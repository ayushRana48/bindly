const { createGroup, getAllGroups, getGroup, getGroupsByHostId, updateGroup, deleteGroup } = require('../transactions/groupTranasctions.js');

async function createGroupController(req, res) {
  const { groupname, description, moneypot, week, startdate, timeleft, hostId } = req.body;
  try {
    const { data, error } = await createGroup(groupname, hostId, description, moneypot, week, startdate, timeleft);

    if (error) throw error;
    res.status(201).json(data);
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
    const { data, error } = await updateGroup(Number(groupId), req.body);

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
