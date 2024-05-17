

const  { createInvite, getAllInvites, getInvite, getInvitesByGroupId, getInvitesBySender,getInvitesByReciever,updateInvite, deleteInvite } = require('../transactions/inviteTransactions');

// Controller for creating a new user
async function createInviteController(req, res) {
  const { username,  groupId, strikes, moneypaid, moneyowed} = req.body;

  try {
    const { data, error } = await createInvite(username, groupId, strikes, moneypaid, moneyowed);

    if (error) throw error;
    res.status(201).json(data);
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
      const { data, error } = await getInvitesBySender(username);
  
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async function getInvitesByRecieverController(req, res) {
    const { reciverId } = req.params;
  
    try {
      const { data, error } = await getInvitesByReciever(username);
  
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
  const { InviteId } = req.params;

  try {
    const { data, error } = await deleteInvite(InviteId);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


module.exports={createInviteController,deleteInviteController,getAllInvitesController,updateInviteController,getInviteController,getInvitesByGroupIdController,getInvitesByRecieverController,getInvitesBySenderController};

