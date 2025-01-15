import { PrismaClient } from '@prisma/client';
import { processGroups } from './groupTransactions';
import { DatabaseResponse, Group, UserGroup, User } from '../types';
import { createGroupBalanceTransaction } from './balanceTransactions/groupBalanceTransactions';

const prisma = new PrismaClient();

interface GroupMembersResponse {
  members: Array<UserGroup & { users: User }>;
}

interface UserGroupResponse {
  current: Array<UserGroup & { groups: Group }>;
  archive: Array<UserGroup & { groups: Group }>;
}


async function createUserGroup(
  usergroupid: string, 
  username: string, 
  groupid: string
): Promise<DatabaseResponse<{ data: any; newBalance: number }>> {
  try {
    const group = await prisma.groups.findUnique({
      where: { groupid },
      select: { buyin: true }
    });

    if (!group) {
      return { data: null, error: new Error('Group not found') };
    }

    console.log("about to create group balance transaction");

    const { newBalance, error: transactionError } = await createGroupBalanceTransaction(
      prisma,
      username,
      groupid,
      'BuyIn',
      -group.buyin
    );

    if (transactionError) {
      console.log('pushing error', transactionError);
      return { data: null, error: transactionError };
    }

    console.log('newBalance', newBalance);

    const data = await prisma.usergroup.create({
      data: {
        usergroupid,
        username,
        groupid
      }
    });

    return { 
      data: { data, newBalance: newBalance || 0 }, 
      error: null 
    };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function getAllUserGroups(): Promise<DatabaseResponse<Array<UserGroup & { groups: Group }>>> {
  try {
    const data = await prisma.usergroup.findMany({
      include: {
        groups: true
      }
    });
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function getUserGroupsByGroupId(groupid: string): Promise<DatabaseResponse<GroupMembersResponse>> {
  try {
    const userGroupData = await prisma.usergroup.findMany({
      where: { groupid },
      include: {
        users: true
      }
    });

    return { 
      data: {
        members: userGroupData,
      }, 
      error: null 
    };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function getUserGroupsByUsername(username: string): Promise<DatabaseResponse<UserGroupResponse>> {
  try {
    const allGroups = await prisma.usergroup.findMany({
      where: {
        username,
        groups: {
          archive: false
        }
      },
      select: {
        groupid: true,
        groups: true
      }
    });

    const currentDate = new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    await prisma.users.update({
      where: { username },
      data: {
        lastlogin: currentDate,
        timezone
      }
    });

    const groups = allGroups.map((g: any) => g.groups);
    await processGroups(groups);

    const currentGroups = await prisma.usergroup.findMany({
      where: {
        username,
        groups: {
          archive: false
        }
      },
      include: {
        groups: true
      }
    });

    const archiveGroups = await prisma.usergroup.findMany({
      where: {
        username,
        groups: {
          archive: true
        }
      },
      include: {
        groups: true
      }
    });

    return { 
      data: { 
        current: currentGroups, 
        archive: archiveGroups 
      }, 
      error: null 
    };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function getUserGroup(userGroupId: string): Promise<DatabaseResponse<UserGroup & { groups: Group }>> {
  try {
    const data = await prisma.usergroup.findUnique({
      where: { usergroupid: userGroupId },
      include: {
        groups: true
      }
    });
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}
type UserGroupUpdateParams = Partial<Omit<UserGroup, 'usergroupid' | 'username' | 'groupid'>>;

async function updateUserGroup(
  usergroupid: string, 
  updateParams: UserGroupUpdateParams
): Promise<DatabaseResponse<UserGroup>> {
  try {
    const data = await prisma.usergroup.update({
      where: { usergroupid },
      data: updateParams
    });
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function deleteUserGroup(
  username: string, 
  groupId: string
): Promise<DatabaseResponse<string>> {
  try {
    const group = await prisma.groups.findUnique({
      where: { groupid: groupId },
      select: { buyin: true }
    });

    if (!group) {
      return { data: null, error: new Error('Group not found') };
    }

    const user = await prisma.users.findUnique({
      where: { username },
      select: { balance: true }
    });

    if (!user) {
      return { data: null, error: new Error('User not found') };
    }

    const newBalance = user.balance + group.buyin;

    await prisma.users.update({
      where: { username },
      data: { balance: newBalance }
    });

    await prisma.usergroup.deleteMany({
      where: {
        username,
        groupid: groupId
      }
    });

    return { data: 'Successfully deleted', error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function getUserGroupByUsernameGroup(
  username: string, 
  groupId: string
): Promise<DatabaseResponse<UserGroup>> {
  try {
    const data = await prisma.usergroup.findFirst({
      where: {
        username,
        groupid: groupId
      }
    });
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

export { createUserGroup, getAllUserGroups, getUserGroup, getUserGroupsByGroupId, getUserGroupsByUsername, updateUserGroup, deleteUserGroup, getUserGroupByUsernameGroup };
