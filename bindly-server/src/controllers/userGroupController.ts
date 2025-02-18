

import { Request, Response } from 'express';
import { 
  createUserGroup, 
  getAllUserGroups, 
  getUserGroup, 
  getUserGroupsByGroupId, 
  getUserGroupsByUsername,
  updateUserGroup, 
  deleteUserGroup,
  getUserGroupByUsernameGroup 
} from '../transactions/usergroupTransactions';
import { v4 as uuidv4 } from 'uuid';
import { getGroup } from '../transactions/groupTransactions';
import { getGroupMemberCacheKey, deleteGroupMemberCache } from '../utils/cacheHelpers';
import { redis } from '../initRedis';
// Controller for creating a new user
async function createUserGroupController(req: Request, res: Response) {
  const { username, groupId } = req.body;
  const usergroupid = uuidv4();

  try {
    const { data, error } = await createUserGroup(
      usergroupid, 
      username, 
      groupId
    );

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Call the function to check the connection


// Controller for getting a user's details
async function getUserGroupController(req: Request, res: Response) {
  const { usergroupId } = req.params;

  try {
    const { data, error } = await getUserGroup(usergroupId);

    if (error) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function getUserGroupsByGroupIdController(req: Request, res: Response) {
  const { groupId } = req.params;
  const cacheKey = getGroupMemberCacheKey(groupId);

  try {
    // Check if the data exists in the cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for groupId: ${groupId}`);
      return res.status(200).json(JSON.parse(cachedData));
    }

    console.log(`Cache miss for groupId: ${groupId}`);
    // Fetch data from the database or service
    const { data, error } = await getUserGroupsByGroupId(groupId);

    if (error) {
      return res.status(404).json({ error: error.message });
    }

    // Cache the result with a TTL of 1 hour (3600 seconds)
    await redis.set(cacheKey, JSON.stringify(data), 'EX', 3600);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function getUserGroupsByUsernameController(req: Request, res: Response) {
  const { username } = req.params;

  try {
    const { data, error } = await getUserGroupsByUsername(username);

    if (error) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function getAllUserGroupsController(req: Request, res: Response) {
  try {
    const { data, error } = await getAllUserGroups();

    if (error) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}


async function updateUserGroupController(req: Request, res: Response) {
  const { usergroupId } = req.params;
  const updateParams = req.body;

  try {
    const { data, error } = await updateUserGroup(usergroupId, updateParams);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}



async function leaveGroupController(req: Request, res: Response) {
  const { username, groupId } = req.body;

  try {
    const { data: groupData, error: groupError } = await getGroup(groupId);

    if (groupError) {
      return res.status(400).json({ error: 'Error fetching group data' });
    }

    if (username === groupData?.group.hostid) {
      return res.status(400).json({ error: 'Cannot leave group as host' });
    }

    if (!groupData?.group?.startdate) {
      return res.status(400).json({ error: 'Invalid group start date' });
    }

    if (Date.now() > new Date(groupData.group.startdate).getTime()) {
      return res.status(400).json({ error: 'Cannot leave group, group already started' });
    }

    const { data, error } = await deleteUserGroup(username, groupId);

    if (error) {
      return res.status(404).json({ error: error.message });
    }
    await deleteGroupMemberCache(groupId);

    return res.status(200).json({ message: 'Successfully left the group' });
  } catch (error) {
    return res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}


async function inGroupController(req: Request, res: Response) {
  const { username, groupId } = req.body;

  const { data, error } = await getUserGroupByUsernameGroup(username, groupId);

  if (error) {
    if (error.message === 'JSON object requested, multiple (or no) rows returned') {
      return res.status(200).json({ inGroup: false });
    }
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ inGroup: true });
}



async function kickUserController(req: Request, res: Response) {
  const { username, groupId, kickedUser } = req.body;

  try {
    const { data: groupData, error: groupError } = await getGroup(groupId);

    if (groupError) {
      return res.status(400).json({ error: 'Error fetching group data' });
    }

    if (username !== groupData?.group.hostid) {
      return res.status(400).json({ error: 'Cannot kick, not host' });
    }

    if (!groupData?.group?.startdate) {
      return res.status(400).json({ error: 'Invalid group start date' });
    }

    if (Date.now() > new Date(groupData.group.startdate).getTime()) {
      return res.status(400).json({ error: 'Cannot kick, group already started' });
    }

    const { data, error } = await deleteUserGroup(kickedUser, groupId);

    if (error) {
      return res.status(404).json({ error: error.message });
    }
    await deleteGroupMemberCache(groupId);


    return res.status(200).json({ message: 'Successfully kicked user from group' });
  } catch (error) {
    return res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}




export {
  createUserGroupController,
  getAllUserGroupsController,
  updateUserGroupController,
  getUserGroupController,
  getUserGroupsByGroupIdController,
  getUserGroupsByUsernameController,
  leaveGroupController,
  kickUserController,
  inGroupController
};
