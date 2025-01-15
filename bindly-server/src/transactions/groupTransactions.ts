import { PrismaClient } from '@prisma/client';
import { uploadFile } from './uploadFile';
import { Group, Post, DatabaseResponse } from '../types';
import { distributeMoney } from './groupHelpers/leaderboard/distributeMoney';
import { buildLeaderboardData } from './groupHelpers/leaderboard/leaderboard';
import { processPosts } from './groupHelpers/veto/processPosts';
import { updateUserBalance } from './groupHelpers/endGroup/endGroupHelpers';

const prisma = new PrismaClient();

interface LeaderboardWeek {
  weekNum: number;
  weekRange: string;
  countedPosts: number;
  unCountedPosts: number;
}

interface LeaderboardEntry {
  username: string;
  weeks: LeaderboardWeek[];
  totalCountedPosts: number;
  totalUnCountedPosts: number;
  place?: number;
  netMoney?: number;
}

interface GroupsResponse {
  current: Group[];
  archive: Group[];
}

async function createGroup(
  groupid: string,
  groupname: string,
  hostid: string,
  description: string,
  buyin: number,
  week: string,
  startdate: string,
  timeleft: string,
  enddate: string,
  filePath: string,
  tasksperweek: number
): Promise<DatabaseResponse<Group>> {
  try {
    const timestamp = new Date();
    const { fileUrl, error: uploadError } = await uploadFile(filePath, 'groupProfiles', groupid, null, timestamp.toISOString());

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    const data = await prisma.groups.create({
      data: {
        groupid,
        groupname,
        description,
        buyin,
        week,
        startdate: new Date(startdate),
        timeleft,
        hostid,
        enddate: new Date(enddate),
        pfp: fileUrl || "",
        tasksperweek,
        lastpfpupdate: timestamp
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

async function getAllGroups(): Promise<DatabaseResponse<GroupsResponse>> {
  try {
    const currentGroups = await prisma.groups.findMany({
      where: { archive: false }
    });

    const archive = await prisma.groups.findMany({
      where: { archive: true }
    });

    return {
      data: { current: currentGroups, archive },
      error: null
    };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function getLeaderBoard(groupid: string): Promise<DatabaseResponse<LeaderboardEntry[]>> {
  try {
    const group = await prisma.groups.findUnique({
      where: { groupid },
      select: { startdate: true, tasksperweek: true, buyin: true }
    });

    if (!group) {
      return { data: null, error: new Error('Group not found') };
    }

    const { startdate, tasksperweek, buyin } = group;
    const startDate = startdate;

    const users = await prisma.usergroup.findMany({
      where: { groupid },
      select: { username: true }
    });

    const posts = await prisma.post.findMany({
      where: {
        groupid,
        OR: [
          { valid: null },
          { valid: true }
        ]
      },
      select: { username: true, timepost: true }
    });

    const leaderboard = buildLeaderboardData(posts, users, startDate, tasksperweek);

    let currentPlace = 1;
    for (let i = 0; i < leaderboard.length; i++) {
      if (i > 0 && leaderboard[i].totalCountedPosts < leaderboard[i - 1].totalCountedPosts) {
        currentPlace = i + 1;
      }
      leaderboard[i].place = currentPlace;
    }

    const updatedLeaderboard = distributeMoney(leaderboard, buyin);
    return { data: updatedLeaderboard, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

async function getGroup(groupid: string): Promise<DatabaseResponse<{
  group: Group;
  usergroup: any[];
  invite: any[];
  post: Post[];
}>> {
  try {
    console.log("Fetching group data for groupid: ", groupid);

    const groupData = await prisma.groups.findUnique({
      where: { groupid },
      include: {
        usergroup: {
          include: {
            users: true
          }
        },
        invite: true,
        post: {
          include: {
            comment: {
              include: {
                users: {
                  select: {
                    pfp: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!groupData) {
      return { data: null, error: new Error('Group not found') };
    }

    const { data: processData, error: processError } = await processVeto(groupid);
    if (processError) {
      return { data: null, error: processError };
    }

    const filteredPosts = (groupData.post || [])
      .filter((p:Post) => p.valid === null || p.valid === true)
      .sort((a:Post, b:Post) => new Date(b.timepost).getTime() - new Date(a.timepost).getTime())
      .map((post:any) => ({
        ...post,
        comment: post.comment
          ? post.comment.sort((a:any, b:any) => new Date(a.created).getTime() - new Date(b.created).getTime())
          : [],
      }));

    const data = {
      group: groupData,
      usergroup: groupData.usergroup || [],
      invite: groupData.invite || [],
      post: filteredPosts,
    };

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

async function processVeto(groupid: string): Promise<DatabaseResponse<string>> {
  try {
    const memberCount = await prisma.usergroup.count({
      where: { groupid }
    });

    if (memberCount <= 2) {
      return { data: 'less than 2 members', error: null };
    }

    const posts = await prisma.post.findMany({
      where: {
        groupid,
        valid: null
      }
    });

    await processPosts(prisma,posts, memberCount, groupid);

    return { data: 'Process completed successfully', error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

async function getGroupsByHostId(hostid: string): Promise<DatabaseResponse<Group[]>> {
  try {
    const data = await prisma.groups.findMany({
      where: { hostid }
    });
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function updateGroup(
  groupId: string,
  updateParams: Partial<Group>
): Promise<DatabaseResponse<Group>> {
  try {
    let newTimeStamp: Date | null = null;
    let fileUrl = updateParams.pfp;

    if (updateParams.pfp) {
      newTimeStamp = new Date();
      const { fileUrl: newFileUrl, error: uploadError } = await uploadFile(
        updateParams.pfp,
        'groupProfiles',
        groupId,
        updateParams.lastpfpupdate?.toString() || null,
        newTimeStamp.toISOString()
      );

      if (uploadError) {
        return { data: null, error: uploadError };
      }

      fileUrl = newFileUrl;
    }

    const updateData = { 
      ...updateParams, 
      pfp: fileUrl,
      lastpfpupdate: newTimeStamp || undefined
    };

    const data = await prisma.groups.update({
      where: { groupid: groupId },
      data: updateData
    });

    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

async function deleteGroup(groupId: string): Promise<DatabaseResponse<string>> {
  try {
    const group = await prisma.groups.findUnique({
      where: { groupid: groupId },
      select: { buyin: true }
    });

    if (!group) {
      return { data: null, error: new Error('Group not found') };
    }

    const userGroups = await prisma.usergroup.findMany({
      where: { groupid: groupId },
      select: { username: true }
    });

    // Update user balances in a transaction
    await prisma.$transaction(async (tx:any) => {
      for (const userGroup of userGroups) {
        await tx.user.update({
          where: { username: userGroup.username },
          data: {
            balance: {
              increment: group.buyin
            }
          }
        });
      }

      // Delete related records
      await tx.usergroup.deleteMany({ where: { groupid: groupId } });
      await tx.invite.deleteMany({ where: { groupid: groupId } });
      await tx.group.delete({ where: { groupid: groupId } });
    });

    return { data: 'Successfully deleted group', error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

async function endGroups(groupIds: string[]): Promise<DatabaseResponse<string>> {
  try {
    for (const groupId of groupIds) {
      const { error } = await endGroup(groupId);
      if (error) {
        return { data: null, error };
      }
    }
    return { data: "success", error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error("Unknown error") };
  }
}

async function endGroup(groupId: string): Promise<{ error: Error | null }> {
  try {
    await processVeto(groupId);

    const leaderboardResponse = await getLeaderBoard(groupId);
    if (!leaderboardResponse.data) {
      return { error: new Error("Failed to fetch leaderboard for group: " + groupId) };
    }

    const leaderboard = leaderboardResponse.data;

    // Update balances in a transaction
    await prisma.$transaction(async (tx:any) => {
      for (const entry of leaderboard) {
        const { username, netMoney } = entry;
        if (netMoney && netMoney !== 0) {
          const { error } = await updateUserBalance(prisma,username, netMoney, groupId);
          if (error) throw error;
        }
      }

      await tx.group.update({
        where: { groupid: groupId },
        data: { archive: true }
      });
    });

    return { error: null };
  } catch (error) {
    console.error("Error in endGroup:", error);
    return { error: error instanceof Error ? error : new Error("Unknown error") };
  }
}

async function processGroups(groups: any[]): Promise<DatabaseResponse<string>> {
  const now = new Date();
  const groupsToEnd = groups
    .filter(group => {
      const endDate = new Date(group.enddate!);
      return now.getTime() - endDate.getTime() >= 24 * 60 * 60 * 1000;
    })
    .map(group => group.groupid);

  if (groupsToEnd.length === 0) {
    return { data: 'No groups to process', error: null };
  }

  try {
    const result = await endGroups(groupsToEnd);
    return result;
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

export { createGroup, getAllGroups, getGroup, getGroupsByHostId, updateGroup, deleteGroup, getLeaderBoard, processGroups, processVeto, endGroup };
