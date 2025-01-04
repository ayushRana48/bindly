import { Request, Response } from 'express';
import { 
  createInvite, 
  getAllInvites, 
  getInvite, 
  getInvitesByGroupId, 
  getInvitesBySender, 
  getInvitesByReciever, 
  updateInvite, 
  deleteInvite 
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
  const usergroupId = uuidv4();

  try {
    const { data: groupData, error: groupError } = await getGroup(groupid);

    if (groupError) {
      return res.status(400).json({ error: 'Group not found' });
    }

    if (!groupData?.group?.startdate || !groupData?.group?.enddate) {
      return res.status(400).json({ error: 'Invalid group dates' });
    }

    const currentDate = new Date();
    const startDate = new Date(groupData.group.startdate);
    const endDate = new Date(groupData.group.enddate);

    if (startDate < currentDate) {
      await deleteInvite(inviteId);
      return res.status(400).json({ error: 'Group already started' });
    }

    if (endDate < currentDate) {
      await deleteInvite(inviteId);
      return res.status(400).json({ error: 'Group already ended' });
    }

    const { data: userGroupData, error: createUserGroupError } = await createUserGroup(
      usergroupId, 
      receiverid, 
      groupid
    );

    if (createUserGroupError) {
      if (createUserGroupError.message === 'Insufficient Funds') {
        return res.status(400).json({ error: 'Insufficient Funds' });
      }
      throw createUserGroupError;
    }

    const { error: deleteError } = await deleteInvite(inviteId);

    if (deleteError) {
      throw deleteError;
    }

    return res.status(200).json(userGroupData);
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
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
