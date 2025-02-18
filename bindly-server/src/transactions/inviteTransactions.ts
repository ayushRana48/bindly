import { Prisma, PrismaClient } from '@prisma/client';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseResponse, Invite, Group } from '../types';
import { sendBatchNotifications } from '../utils/sendNotificationUtil';
import { createUserGroup, getUserGroupsByGroupId } from './usergroupTransactions';
import { deleteGroupCache, deleteGroupMemberCache } from '../utils/cacheHelpers';
import { getAllUsers } from './usersTransactions';

const prisma = new PrismaClient();
const expo = new Expo();

async function createInvite(
  senderid: string,
  receiverid: string,
  groupid: string
): Promise<DatabaseResponse<Invite>> {
  try {
    const inviteid = uuidv4();
    const data = await prisma.invite.create({
      data: { inviteid, senderid, receiverid, groupid }
    });

    const receiverData = await prisma.users.findUnique({
      where: { username: receiverid },
      select: { username: true, tokens: true }
    });

    if (!receiverData) {
      return { data, error: new Error('Receiver not found') };
    }

    const tokens = receiverData.tokens.filter((token: unknown) => Expo.isExpoPushToken(token));
    if (tokens.length > 0) {
      const notifications: ExpoPushMessage[] = tokens.map((token: any) => ({
        to: token,
        sound: 'default',
        title: 'Bindly',
        body: `You received an invite from ${senderid}`,
      }));
      await sendBatchNotifications(notifications);
    }
    await deleteGroupCache(groupid);
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(error.message) };
  }
}

async function acceptInvite(
  inviteId: string,
  receiverid: string,
  groupid: string,
  groupStartDate: Date,
  groupEndDate: Date
): Promise<DatabaseResponse<{ message: string }>> {
  console.log('acceptInvite called');

  const currentDate = new Date();

  try {
    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // Validate group dates
      if (groupStartDate < currentDate) {
        await deleteInvite(inviteId, tx); // Pass transaction to deleteInvite
        throw new Error('Group already started');
      }

      if (groupEndDate < currentDate) {
        await deleteInvite(inviteId, tx); // Pass transaction to deleteInvite
        throw new Error('Group already ended');
      }

      const usergroupId = uuidv4();

      // Create the user group
      const { error: createUserGroupError } = await createUserGroup(
        usergroupId,
        receiverid,
        groupid,
        tx // Pass transaction to createUserGroup
      );

      if (createUserGroupError) {
        if (createUserGroupError.message === 'Insufficient Funds') {
          throw new Error('Insufficient Funds');
        }
        throw createUserGroupError;
      }

      // Delete the invite
      await deleteGroupCache(groupid);
      await deleteGroupMemberCache(groupid);
      const { error: deleteError } = await deleteInvite(inviteId, tx);

      if (deleteError) {
        throw deleteError;
      }
    });

    return { data: { message: 'Invite accepted successfully' }, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}


  async function getAllInvites(): Promise<DatabaseResponse<Invite[]>> {
    try {
      const data = await prisma.invite.findMany();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: new Error(error.message) };
    }
  }

  async function getInvite(inviteId: string): Promise<DatabaseResponse<Invite>> {
    try {
      const data = await prisma.invite.findUnique({
        where: { inviteid: inviteId }
      });
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: new Error(error.message) };
    }
  }

  async function getInvitesBySender(username: string): Promise<DatabaseResponse<Invite[]>> {
    try {
      const data = await prisma.invite.findMany({
        where: { senderid: username }
      });
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: new Error(error.message) };
    }
  }

  async function getInvitesByReciever(username: string): Promise<DatabaseResponse<Array<Invite & { groups: Group }>>> {
    try {
      const data = await prisma.invite.findMany({
        where: { receiverid: username },
        include: { groups: true }
      });
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: new Error(error.message) };
    }
  }

  async function getInvitesByGroupId(groupid: string): Promise<DatabaseResponse<Invite[]>> {
    try {
      const data = await prisma.invite.findMany({
        where: { groupid }
      });
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: new Error(error.message) };
    }
  }

  async function fetchAvailableInvites(groupId:string) {
    try {
      const [inviteDataResponse, allUsersResponse, allMembersResponse] = await Promise.all([
        getInvitesByGroupId(groupId),
        getAllUsers(),
        getUserGroupsByGroupId(groupId)
      ]);
  
      if (inviteDataResponse.error || allUsersResponse.error || allMembersResponse.error) {
        throw new Error('Error fetching data');
      }
  
      const inviteData = inviteDataResponse.data;
      const allUsers = allUsersResponse.data;
      const allMembers = allMembersResponse.data;
  
      if (!allMembers?.members) {
        throw new Error('Invalid members data');
      }
  
      const allMemberUsernames = new Set(allMembers.members.map(member => member.username));
      const invitedUsernames = new Set(inviteData?.map(invite => invite.receiverid) || []);
  
      const availableInvites = allUsers?.map(user => ({
        ...user,
        invited: invitedUsernames.has(user.username),
        isMember: allMemberUsernames.has(user.username)
      })).filter(user => !user.isMember);
  
      return availableInvites;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error occurred');
    }
  }
  

  async function updateInvite(
    inviteid: string,
    updateParams: Partial<Omit<Invite, 'inviteid'>>
  ): Promise<DatabaseResponse<Invite>> {
    try {
      const data = await prisma.invite.update({
        where: { inviteid },
        data: updateParams
      });
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: new Error(error.message) };
    }
  }

  async function deleteInvite(
    inviteid: string,
    tx?: Prisma.TransactionClient
  ): Promise<DatabaseResponse<Invite>> {
    // Use the provided transaction client if available, otherwise use the global Prisma client
    const client = tx || prisma;
  
    try {
      const data = await client.invite.delete({
        where: { inviteid },
      });
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: new Error(error.message) };
    }
  }
  

  export {
    createInvite,
    acceptInvite,
    getAllInvites,
    getInvite,
    getInvitesByGroupId,
    getInvitesBySender,
    getInvitesByReciever,
    updateInvite,
    deleteInvite,
    fetchAvailableInvites
  };