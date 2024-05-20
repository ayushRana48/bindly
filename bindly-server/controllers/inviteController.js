

const  { createInvite, getAllInvites, getInvite, getInvitesByGroupId, getInvitesBySender,getInvitesByReciever,updateInvite, deleteInvite } = require('../transactions/inviteTransactions');
const { createUserGroup }= require('../transactions/usergroupTransactions');
const { v4: uuidv4 } = require('uuid');

// Controller for creating a new user
async function createInviteController(req, res) {
  console.log('at controller')
  const { senderid, receiverid, groupid} = req.body;

  try {
    const { data, error } = await createInvite(senderid, receiverid, groupid);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


async function acceptInviteController(req,res){
  const { inviteId, receiverid, groupid} = req.body;

  const usergroupId=uuidv4()
  console.log(inviteId,'inviteIDDDDDD')

  try {
    const { data, error } = await deleteInvite(inviteId);

    console.log(error,'UPHEER??')


    if (error) throw error;
    
    const { data: userGroupData, error: createUserGroupError } = await createUserGroup(usergroupId, receiverid, groupid);

    console.log(userGroupData, 'inTrann');
    console.log(createUserGroupError, 'fromTrann');

    if (createUserGroupError) throw createUserGroupError;

    res.status(200).json(userGroupData);


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
  console.log('here',inviteId)

  try {
    const { data, error } = await deleteInvite(inviteId);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


module.exports={createInviteController,deleteInviteController,getAllInvitesController,updateInviteController,getInviteController,getInvitesByGroupIdController,getInvitesByRecieverController,getInvitesBySenderController,acceptInviteController};

