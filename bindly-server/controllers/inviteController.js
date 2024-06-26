

const { createInvite, getAllInvites, getInvite, getInvitesByGroupId, getInvitesBySender, getInvitesByReciever, updateInvite, deleteInvite } = require('../transactions/inviteTransactions');
const { createUserGroup, getUserGroupsByGroupId } = require('../transactions/usergroupTransactions');
const { v4: uuidv4 } = require('uuid');
const { getAllUsers } = require('../transactions/usersTransactions');
const { getGroup } = require('../transactions/groupTransactions');

// Controller for creating a new user
async function createInviteController(req, res) {
  const { senderid, receiverid, groupid } = req.body;

  try {
    const { data, error } = await createInvite(senderid, receiverid, groupid);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


async function acceptInviteController(req, res) {
  const { inviteId, receiverid, groupid } = req.body;


  const usergroupId = uuidv4()

  console.log('call')

  try {


    const {data:groupData,error:groupError}=await getGroup(groupid)

    if(groupError){
      return res.status(400).json({ error: 'Group not found' });
    }


    console.log(groupData)
    console.log(groupData.group.startdate)
    console.log(groupData.group.enddate)
    console.log(new Date())


    if(new Date(groupData.group.startdate) < new Date()){
      const { data, error } = await deleteInvite(inviteId);
      return res.status(400).json({ error: 'Group already started' });
    }

    if(new Date(groupData.group.enddate) < new Date()){
      const { data, error } = await deleteInvite(inviteId);
      return res.status(400).json({ error: 'Group already ended' });
    }




    const { data: userGroupData,newBalance, error: createUserGroupError } = await createUserGroup(usergroupId, receiverid, groupid);

    if(createUserGroupError=='Insufficient Funds'){
      return res.status(400).json({ error: 'Insufficient Funds' });
    }

    if (createUserGroupError) throw createUserGroupError;

    const { data, error } = await deleteInvite(inviteId);



    if (error) throw error;

    res.status(200).json({userGroupData,newBalance});


  } catch (error) {
    res.status(400).json({ error: error.message });
  }


}


// Call the function to check the connection


// Controller for getting a user's details
async function getInviteController(req, res) {
  const { InviteId } = req.params;

  try {
    const { data, error } = await getInvite(InviteId);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function getInvitesByGroupIdController(req, res) {
  const { groupId } = req.params;

  try {
    const { data, error } = await getInvitesByGroupId(groupId);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function getAvailableInvites(req, res) {
  const { groupId } = req.params;

  try {
    // Execute API calls in parallel
    const [inviteDataResponse, allUsersResponse, allMembersResponse] = await Promise.all([
      getInvitesByGroupId(groupId),
      getAllUsers(),
      getUserGroupsByGroupId(groupId)
    ]);

    const inviteData = inviteDataResponse.data;
    const allUsers = allUsersResponse.data;
    const allMembers = allMembersResponse.data;

    const allMemberUsernames = new Set(allMembers.members.map(member => member.username));
    const invitedUsernames = new Set(inviteData.map(invite => invite.receiverid));

    const availableInvites = allUsers.map(user => ({
      ...user,
      invited: invitedUsernames.has(user.username),
      isMember: allMemberUsernames.has(user.username)
    })).filter(user => !user.isMember);

    res.status(200).json(availableInvites);
  } catch (err) {
    console.error(err);
    res.status(500).json('Error occurred');
  }
}



async function getInvitesBySenderController(req, res) {
  const { senderId } = req.params;

  try {
    const { data, error } = await getInvitesBySender(senderId);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function getInvitesByRecieverController(req, res) {
  const { reciverId } = req.params;

  try {
    const { data, error } = await getInvitesByReciever(reciverId);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}



async function getAllInvitesController(req, res) {

  try {
    const { data, error } = await getAllInvites();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}
// Controller for updating a user's details
async function updateInviteController(req, res) {
  const { InviteId } = req.params;
  const updateParams = req.body;


  try {
    const { data, error } = await updateInvite(InviteId, updateParams);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Controller for deleting a user
async function deleteInviteController(req, res) {
  const { inviteId } = req.params;

  try {
    const { data, error } = await deleteInvite(inviteId);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


module.exports = { createInviteController, deleteInviteController, getAllInvitesController, updateInviteController, getInviteController, getInvitesByGroupIdController, getInvitesByRecieverController, getInvitesBySenderController, acceptInviteController, getAvailableInvites };

