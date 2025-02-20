import { Request, Response } from 'express';
import { canNotify } from '../transactions/balanceNotification';


export async function balanceNotificationController(req: Request, res: Response) {
    const { initiator, receiver } = req.body;
    console.log(req.body)
    console.log(initiator)
    console.log(receiver)
    try {
        const { data, error } = await canNotify(initiator, receiver);
        console.log(data,'g')
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}