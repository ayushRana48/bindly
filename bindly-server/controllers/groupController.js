const { createGroup, getAllGroups, getGroup, getGroupsByHostId, updateGroup, deleteGroup } = require('../transactions/groupTranasctions.js');
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
  const { groupId } = req.params;

  try {
    const { data, error } = await deleteGroup(Number(groupId));

    if (error) throw error;
    res.sendStatus(200);
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
  deleteGroupController
};
