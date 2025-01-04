import { Request, Response } from 'express';
import { registerToken, removeToken } from '../transactions/notificationTransactions';

async function registerTokenController(req: Request, res: Response) {
  const { username, token } = req.body;

  try {
    const { data, error } = await registerToken(username, token);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function removeTokenController(req: Request, res: Response) {
  const { username, token } = req.body;

  try {
    const { data, error } = await removeToken(username, token);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

export { registerTokenController, removeTokenController };