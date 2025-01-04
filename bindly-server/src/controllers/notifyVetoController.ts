import { Request, Response } from 'express';
import { getNotifyveto } from '../transactions/notifyvetoTransactions';

async function getNotifyVetoByGroupController(req: Request, res: Response) {
  const { username } = req.params;

  try {
    const { data, error } = await getNotifyveto(username);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

export { getNotifyVetoByGroupController };