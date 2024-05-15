

const { createUserGroup, getAllUserGroups, getUserGroup, getUserGroupsByGroupId, getUserGroupsByUsername,updateUserGroup, deleteUserGroup }= require('../transactions/usergroupTransactions');

// Controller for creating a new user
async function createUserGroupController(req, res) {
  console.log("reachhs")
  const { username,  groupId, strikes, moneypaid, moneyowed} = req.body;

  try {
    const { data, error } = await createUserGroup(username, groupId, strikes, moneypaid, moneyowed);

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


// Call the function to check the connection


// Controller for getting a user's details
async function getUserGroupController(req, res) {
  const { usergroupId } = req.params;

  try {
    const { data, error } = await getUserGroup(usergroupId);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function getUserGroupsByGroupIdController(req, res) {
    const { groupId } = req.params;
  
    try {
      const { data, error } = await getUserGroupsByGroupId(groupId);
  
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
}

async function getUserGroupsByUsernameontroller(req, res) {
    const { username } = req.params;
  
    try {
      const { data, error } = await getUserGroupsByUsername(username);
  
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }


async function getAllUserGroupsController(req, res) {

  try {
    const { data, error } = await getAllUserGroups();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}
// Controller for updating a user's details
async function updateUserGroupController(req, res) {
  const { usergroupId } = req.params;
  const updateParams = req.body;


  try {
    const { data, error } = await updateUserGroup(usergroupId, updateParams);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Controller for deleting a user
async function deleteUserGroupController(req, res) {
  const { usergroupId } = req.params;

  try {
    const { data, error } = await deleteUserGroup(usergroupId);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


module.exports={createUserGroupController,deleteUserGroupController,getAllUserGroupsController,updateUserGroupController,getUserGroupController,getUserGroupsByGroupIdController,getUserGroupsByUsernameontroller};

