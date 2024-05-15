// transactions/historyTransactions.js

const { supabase } = require('../initSupabase');

// Function to create a new history record
async function createHistory(loserid, groupid, startdate, enddate, amount) {
  const { data, error } = await supabase
    .from('history')
    .insert([
      { loserid, groupid, startdate, enddate, amount }
    ]);
  return { data, error };
}

// Function to get all history records
async function getAllHistories() {
  const { data, error } = await supabase
    .from('history')
    .select('*');
  return { data, error };
}

// Function to get a single history record by historyID
async function getHistoryById(historyID) {
  const { data, error } = await supabase
    .from('history')
    .select('*')
    .eq('historyid', historyID);
  return { data, error };
}


// Function to get groups by hostId
async function getHistoryByLoser(loserId) {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('loserid', loserId);
  
    return { data, error };
  }
  
  async function getHistoryByGroupId(groupid) {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('groupid', groupid);
    
      return { data, error };
  }

// Function to update a history record
async function updateHistory(historyID, updateParams) {
  const { data, error } = await supabase
    .from('history')
    .update(updateParams)
    .eq('historyid', historyID);
  return { data, error };
}

// Function to delete a history record
async function deleteHistory(historyID) {
  const { data, error } = await supabase
    .from('history')
    .delete()
    .eq('historyid', historyID);
  return { data, error };
}

module.exports = { createHistory, getAllHistories, getHistoryById, updateHistory, deleteHistory,getHistoryByLoser,getHistoryByGroupId };
