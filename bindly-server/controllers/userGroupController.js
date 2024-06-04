

const { createUserGroup, getAllUserGroups, getUserGroup, getUserGroupsByGroupId, getUserGroupsByUsername,updateUserGroup, deleteUserGroup,getUserGroupByUsernameGroup }= require('../transactions/usergroupTransactions');
const { v4: uuidv4 } = require('uuid');
const { getGroup }= require('../transactions/groupTransactions');
// Controller for creating a new user
async function createUserGroupController(req, res) {
  const { username,  groupId, strikes, moneypaid, moneyowed} = req.body;
  const usergroupid = uuidv4();


  try {
    const { data, error } = await createUserGroup(usergroupid,username, groupId, strikes, moneypaid, moneyowed);

    if (error) throw error;
    res.status(200).json(data);
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



async function leaveGroupController(req, res) {
  const { username, groupId } = req.body;

  try {
    const { data: groupData, error: groupError } = await getGroup(groupId);

    if (groupError) {
      return res.status(400).json({ error: 'Error fetching group data' });
    }

    if (username ===  groupData.group.hostid) {
      return res.status(400).json({ error: 'Cannot leave group as host' });
    }

    if (Date.now() > new Date( groupData.group.startdate)) {
      return res.status(400).json({ error: 'Cannot leave group, group already started' });
    }

    const { data, error } = await deleteUserGroup(username, groupId);

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'Successfully left the group' });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}


async function inGroupController(req,res){
  const {username,groupId}= req.body
  console.log(username,groupId,'j')

    const {data,error}=await getUserGroupByUsernameGroup(username,groupId)

    console.log(data,'d')
    console.log(error,'e')
    if(error){
      console.log(error)
      if(error.message=='JSON object requested, multiple (or no) rows returned'){
        res.status(200).json({inGroup:false})
      }
      else{
        res.status(400).json({error:error.message})
      }
    }
    else{
      res.status(200).json({inGroup:true})

    }
 
}



async function kickUserController(req, res) {
  const { username, groupId,kickedUser } = req.body;

  try {
    const { data: groupData, error: groupError } = await getGroup(groupId);

    if (groupError) {
      return res.status(400).json({ error: 'Error fetching group data' });
    }


    if (username !==  groupData.group.hostid) {
      return res.status(400).json({ error: 'Cannot kick, not host' });
    }

    if (Date.now() > new Date( groupData.group.startdate)) {
      return res.status(400).json({ error: 'Cannot kick, group already started' });
    }

    const { data, error } = await deleteUserGroup(kickedUser, groupId);

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'Successfully left the group' });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}





module.exports={createUserGroupController,getAllUserGroupsController,updateUserGroupController,getUserGroupController,getUserGroupsByGroupIdController,getUserGroupsByUsernameontroller,leaveGroupController,kickUserController,inGroupController};

