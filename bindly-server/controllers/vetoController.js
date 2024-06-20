const { createVeto, updateVeto, getVetoByGroup, deleteVeto, processVeto } = require('../transactions/vetoTransactions');
const { v4: uuidv4 } = require('uuid');

// Create Veto Controller
const createVetoController = async (req, res) => {
  const { postid, groupid, username, timecycle } = req.body;

  try {
    const { data, error } = await createVeto(postid, groupid, username, timecycle);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update Veto Controller
const updateVetoController = async (req, res) => {
  const { vetoid, count } = req.body;

  try {
    const { data, error } = await updateVeto(vetoid, count);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Veto By Group Controller
const getVetoByGroupController = async (req, res) => {
  const { groupid } = req.params;

  try {
    const { data, error } = await getVetoByGroup(groupid);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Veto Controller
const deleteVetoController = async (req, res) => {
  const { vetoid } = req.params;

  try {
    const { data, error } = await deleteVeto(vetoid);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Process Veto Controller
const processVetoController = async (req, res) => {
  const { groupid } = req.params;

  try {
    const { data, error } = await processVeto(groupid);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createVetoController,
  updateVetoController,
  getVetoByGroupController,
  deleteVetoController,
  processVetoController
};
