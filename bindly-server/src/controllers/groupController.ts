import { Request, Response } from 'express';
import { 
  createGroup,
  processVetoDemo,
  getLeaderBoard,
  processGroups,
  endGroup, 
  getAllGroups, 
  getGroup, 
  getGroupsByHostId, 
  updateGroup, 
  deleteGroup 
} from '../transactions/groupTransactions';
import { createUserGroup } from '../transactions/usergroupTransactions';
import { getUser } from '../transactions/usersTransactions';
import { v4 as uuidv4 } from 'uuid';

async function createGroupController(req: Request, res: Response) {
  const groupid = uuidv4();
  const { 
    groupname, 
    description, 
    buyin, 
    week, 
    startdate, 
    timeleft, 
    hostId,
    enddate,
    image,
    tasksperweek 
  } = req.body;

  try {
    const { data: userData, error: userError } = await getUser(hostId);
    
    if (!userData || userData.balance < buyin) {
      return res.status(400).json({ error: 'Insufficient Funds' });
    }

    const { data, error } = await createGroup(
      groupid,
      groupname, 
      hostId, 
      description, 
      buyin, 
      week, 
      startdate, 
      timeleft,
      enddate,
      image,
      tasksperweek
    );

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const usergroupid = uuidv4();
    const { data: data2, error: error2 } = await createUserGroup(usergroupid, hostId, groupid);

    if (error2) {
      if (error2.message === 'Insufficient Funds') {
        return res.status(400).json({ error: 'Insufficient Funds' });
      }
      return res.status(400).json({ error: error2.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function getAllGroupsController(req: Request, res: Response) {
  try {
    const { data, error } = await getAllGroups();

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

async function processVetoDemoController(req: Request, res: Response) {
  const { groupId } = req.params;

  try {
    const { data: leaderboard, error } = await processVetoDemo(groupId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(leaderboard);
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function getLeaderBoardController(req: Request, res: Response) {
  const { groupId } = req.params;

  try {
    const { data: leaderboard, error } = await getLeaderBoard(groupId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(leaderboard);
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}


async function getGroupController(req: Request, res: Response) {
  const { groupId } = req.params;

  try {
    const { data, error } = await getGroup(groupId);

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

async function getGroupsByHostIdController(req: Request, res: Response) {
  const { hostId } = req.params;

  try {
    const { data, error } = await getGroupsByHostId(hostId);

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

async function updateGroupController(req: Request, res: Response) {
  const { groupId } = req.params;

  try {
    const { data, error } = await updateGroup(groupId, req.body);

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

async function deleteGroupController(req: Request, res: Response) {
  const { username, groupId } = req.body;

  try {
    const { data: groupData, error: groupError } = await getGroup(groupId);

    if (groupError) {
      return res.status(400).json({ error: 'Error fetching group data' });
    }

    if (!groupData?.group?.hostid || username !== groupData.group.hostid) {
      return res.status(400).json({ error: 'Cannot delete, not the host' });
    }

    if (!groupData.group.startdate || Date.now() > new Date(groupData.group.startdate).getTime()) {
      return res.status(400).json({ error: 'Cannot delete, group already started' });
    }

    const { data, error } = await deleteGroup(groupId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'success' });
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function changeHostController(req: Request, res: Response) {
  const { username, groupId, newHost } = req.body;

  try {
    const { data: groupData, error: groupError } = await getGroup(groupId);

    if (groupError) {
      return res.status(400).json({ error: 'Error fetching group data' });
    }

    if (!groupData?.group?.hostid || username !== groupData.group.hostid) {
      return res.status(400).json({ error: 'Cannot change, not the host currently' });
    }

    if (!groupData.group.startdate || Date.now() > new Date(groupData.group.startdate).getTime()) {
      return res.status(400).json({ error: 'Cannot change, group already started' });
    }

    const { data, error } = await updateGroup(groupId, { hostid: newHost });

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



async function endGroupController(req: Request, res: Response) {
  const { groupid } = req.body;

  try {
    const { data, error } = await endGroup([groupid]);

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


export {
  createGroupController,
  getAllGroupsController,
  getGroupController,
  getGroupsByHostIdController,
  updateGroupController,
  deleteGroupController,
  changeHostController,
  getLeaderBoardController,
  endGroupController,
  processVetoDemoController
};