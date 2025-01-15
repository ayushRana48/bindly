import { PrismaClient } from '@prisma/client';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseResponse, Invite, Group } from '../types';
import { sendBatchNotifications } from '../utils/sendNotificationUtil';

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

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(error.message) };
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

async function deleteInvite(inviteid: string): Promise<DatabaseResponse<Invite>> {
  try {
    const data = await prisma.invite.delete({
      where: { inviteid }
    });
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: new Error(error.message) };
  }
}

export { 
  createInvite, 
  getAllInvites, 
  getInvite, 
  getInvitesByGroupId, 
  getInvitesBySender, 
  getInvitesByReciever, 
  updateInvite, 
  deleteInvite 
};