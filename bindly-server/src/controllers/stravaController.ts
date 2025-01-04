import { Request, Response } from 'express';
import { 
  addStravaRefresh, 
  reauthorizeStrava, 
  revokeStravaAccess, 
  getActivities 
} from '../transactions/stravaTransactions';

async function addStravaRefreshController(req: Request, res: Response) {
  const { username, refresh } = req.body;

  const { data, error } = await addStravaRefresh(refresh, username);
  
  if (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : error 
    });
  }

  return res.status(200).json(data);
}

async function reauthorizeStravaController(req: Request, res: Response) {
  const { username, refresh } = req.body;

  const { data, error } = await reauthorizeStrava(refresh, username);
  
  if (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : error 
    });
  }

  return res.status(200).json(data);
}

async function revokeStravaController(req: Request, res: Response) {
  const { username, refresh } = req.body;

  const { data, error } = await revokeStravaAccess(username, refresh);
  
  if (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : error 
    });
  }

  return res.status(200).json(data);
}

async function getActivitiesController(req: Request, res: Response) {
  const { username, refresh } = req.body;

  const { data, error } = await getActivities(username, refresh);
  
  if (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : error 
    });
  }

  return res.status(200).json(data);
}

export {
  addStravaRefreshController,
  reauthorizeStravaController,
  revokeStravaController,
  getActivitiesController
};