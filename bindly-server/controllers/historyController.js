// controllers/historyController.js

const {
    createHistory,
    getAllHistories,
    getHistoryById,
    updateHistory,
    deleteHistory,
    getHistoryByLoser,
    getHistoryByGroupId
  } = require('../transactions/historyTransactions');
  
  // Controller to create a history record
  async function createHistoryController(req, res) {
    const { loserId, groupId, startDate, endDate, amount } = req.body;
  
    try {
      const { data, error } = await createHistory(loserId, groupId, startDate, endDate, amount);
  
      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  // Controller to get all history records
  async function getAllHistoriesController(req, res) {
    try {
      const { data, error } = await getAllHistories();
  
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
  
  // Controller to get a history record by ID
  async function getHistoryByIdController(req, res) {
    const { historyId } = req.params;
  
    try {
      const { data, error } = await getHistoryById(historyId);
  
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async function getHistoryByGroupIdController(req, res) {
    const { groupId } = req.params;
  
    try {
      const { data, error } = await getHistoryByGroupId(groupId);
  
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async function getHistoryByLoserController(req, res) {
    const { loserId } = req.params;
  
    try {
      const { data, error } = await getHistoryByLoser(loserId);
  
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
  
  // Controller to update a history record
  async function updateHistoryController(req, res) {
    const { historyId } = req.params;
    const updateParams = req.body;
  
    try {
      const { data, error } = await updateHistory(historyId, updateParams);
  
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  // Controller to delete a history record
  async function deleteHistoryController(req, res) {
    const { historyId } = req.params;
  
    try {
      const { data, error } = await deleteHistory(historyId);
  
      if (error) throw error;
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  module.exports = {
    createHistoryController,
    getAllHistoriesController,
    getHistoryByIdController,
    updateHistoryController,
    deleteHistoryController,
    getHistoryByGroupIdController,
    getHistoryByLoserController

  };
  