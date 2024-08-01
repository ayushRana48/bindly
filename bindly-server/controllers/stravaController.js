const { addStravaRefresh,reauthorizeStrava,revokeStravaAccess,getActivities } = require('../transactions/stravaTransactions');


async function addStravaRefreshController(req, res) {
    const { username,refresh} = req.body;
  
 
    const {data,error}= await addStravaRefresh(refresh,username)
    if (error) {
      res.status(400).json({ error });
      return;
    }
  
  
  
    return res.status(200).json(data);
  
  }

  async function reauthorizeStravaController(req, res) {
    const { username, refresh} = req.body;
  
 
    const {data,error}= await reauthorizeStrava(refresh,username)
    if (error) {
      res.status(400).json({ error });
      return;
    }
  
    return res.status(200).json(data);

  }

  async function revokeStravaController(req, res) {
    const { username, refresh} = req.body;
  
 
    const {data,error}= await revokeStravaAccess(username,refresh)
    if (error) {
      res.status(400).json({ error });
      return;
    }
  
    return res.status(200).json(data);
  
  }

  async function getActivitiesController(req, res) {
    const { username, refresh} = req.body;
  
 
    const {data,error}= await getActivities(username,refresh)
    if (error) {
      res.status(400).json({ error });
      return;
    }
  
    return res.status(200).json(data);
  
  }

  module.exports={addStravaRefreshController,reauthorizeStravaController,revokeStravaController,getActivitiesController};