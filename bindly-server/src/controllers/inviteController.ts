import { Request, Response } from 'express';
import { 
  createInvite, 
  getAllInvites, 
  getInvite, 
  getInvitesByGroupId, 
  getInvitesBySender, 
  getInvitesByReciever, 
  updateInvite, 
  deleteInvite, 
  acceptInvite,
  fetchAvailableInvites
} from '../transactions/inviteTransactions';
import { createUserGroup, getUserGroupsByGroupId } from '../transactions/usergroupTransactions';
import { getAllUsers } from '../transactions/usersTransactions';
import { getGroup } from '../transactions/groupTransactions';
import { v4 as uuidv4 } from 'uuid';
// Controller for creating a new user
async function createInviteController(req: Request, res: Response) {
  const { senderid, receiverid, groupid } = req.body;

  try {
    const { data, error } = await createInvite(senderid, receiverid, groupid);

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

async function acceptInviteController(req: Request, res: Response) {
  const { inviteId, receiverid, groupid } = req.body;

  try {
    // Fetch group details
    const { data: groupData, error: groupError } = await getGroup(groupid);

    if (groupError) {
      return res.status(400).json({ error: 'Group not found' });
    }

    if (!groupData?.group?.startdate || !groupData?.group?.enddate) {
      return res.status(400).json({ error: 'Invalid group dates' });
    }

    // Pass validation and transactional logic to `acceptInviteTransaction`
    const { data, error } = await acceptInvite(
      inviteId,
      receiverid,
      groupid,
      new Date(groupData.group.startdate),
      new Date(groupData.group.enddate)
    );

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}



// Controller for getting a user's details
async function getInviteController(req: Request, res: Response) {
  const { InviteId } = req.params;

  try {
    const { data, error } = await getInvite(InviteId);

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

async function getInvitesByGroupIdController(req: Request, res: Response) {
  const { groupId } = req.params;

  try {
    const { data, error } = await getInvitesByGroupId(groupId);

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


async function getAvailableInvites(req: Request, res: Response) {
  const { groupId } = req.params;

  try {
    const availableInvites = await fetchAvailableInvites(groupId);
    return res.status(200).json(availableInvites);
  } catch (error) {
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Error occurred' 
    });
  }
}

async function getInvitesBySenderController(req: Request, res: Response) {
  const { senderId } = req.params;

  try {
    const { data, error } = await getInvitesBySender(senderId);

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


async function getInvitesByRecieverController(req: Request, res: Response) {
  const { reciverId } = req.params;

  try {
    const { data, error } = await getInvitesByReciever(reciverId);

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


async function getAllInvitesController(req: Request, res: Response) {
  try {
    const { data, error } = await getAllInvites();

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

// Controller for updating a user's details
async function updateInviteController(req: Request, res: Response) {
  const { InviteId } = req.params;
  const updateParams = req.body;

  try {
    const { data, error } = await updateInvite(InviteId, updateParams);

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

// Controller for deleting a user
async function deleteInviteController(req: Request, res: Response) {
  const { inviteId } = req.params;

  try {
    const { data, error } = await deleteInvite(inviteId);

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
  createInviteController,
  deleteInviteController,
  getAllInvitesController,
  updateInviteController,
  getInviteController,
  getInvitesByGroupIdController,
  getInvitesByRecieverController,
  getInvitesBySenderController,
  acceptInviteController,
  getAvailableInvites
};
