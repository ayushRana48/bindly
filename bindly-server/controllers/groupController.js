const { createGroup, getAllGroups, getGroup, getGroupsByHostId, updateGroup, deleteGroup } = require('../transactions/groupTransactions.js');
const { createUserGroup} = require('../transactions/usergroupTransactions.js');
const { v4: uuidv4 } = require('uuid');

async function createGroupController(req, res) {
  const groupid = uuidv4();

  const { groupname, description, buyin, week, startdate, timeleft, hostId,enddate,image,tasksperweek } = req.body;

  try {
    const { data, error } = await createGroup(groupid,groupname, hostId, description, buyin, week, startdate, timeleft,enddate,image,tasksperweek);


    if (error) throw error;

    const usergroupid = uuidv4();


    const {data2,error2} = await createUserGroup(usergroupid,hostId,groupid)
    if (error2) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getAllGroupsController(req, res) {
  try {
    const { data, error } = await getAllGroups();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getGroupController(req, res) {
  const { groupId } = req.params;

  try {
    const { data, error } = await getGroup(Number(groupId));

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function getGroupsByHostIdController(req, res) {
  const { hostId } = req.params;

  try {
    const { data, error } = await getGroupsByHostId(hostId);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function updateGroupController(req, res) {
  const { groupId } = req.params;


  try {
    const { data, error } = await updateGroup(groupId, req.body);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteGroupController(req, res) {
  const { username, groupId } = req.body;

  console.log(username,groupId)

  try {
    const { data: groupData, error: groupError } = await getGroup(groupId);
    console.log(groupData)

    if (groupError) {
      return res.status(400).json({ error: 'Error fetching group data' });
    }

    if (username !== groupData.hostid) {
      return res.status(400).json({ error: 'Cannot delete, not the host' });
    }

    if (Date.now() > new Date(groupData.startdate)) {
      return res.status(400).json({ error: 'Cannot delete, group already started' });
    }

    const { data, error } = await deleteGroup(groupId);

    if (error) {
      return res.status(400).json({ error });
    }

    console.log('here')

    res.status(200).json({'message':'success'});
  } catch (error) {
    console.log('her2e')

    res.status(400).json({ error: error.message });
  }
}



async function changeHostController(req, res) {
  const { username, groupId,newHost} = req.body;

  try {
    const { data: groupData, error: groupError } = await getGroup(groupId);

    if (groupError) {
      return res.status(400).json({ error: 'Error fetching group data' });
    }

    if (username !== groupData.hostid) {
      return res.status(400).json({ error: 'Cannot change, not the host currenlty' });
    }

    if (Date.now() > new Date(groupData.startdate)) {
      return res.status(400).json({ error: 'Cannot change, group already started' });
    }

    const { data, error } = await updateGroup(groupId,{hostid:newHost});

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}



module.exports = {
  createGroupController,
  getAllGroupsController,
  getGroupController,
  getGroupsByHostIdController,
  updateGroupController,
  deleteGroupController,
  changeHostController
};
