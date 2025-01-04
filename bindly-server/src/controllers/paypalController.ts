import { Request, Response } from 'express';
import { createPayout, checkPayoutStatus } from '../transactions/paypalTransactions';

async function createPayoutController(req: Request, res: Response) {
  const { user_id, recipient_email, amount, is_venmo } = req.body;

  const { error, data } = await createPayout(
    user_id, 
    recipient_email, 
    amount, 
    is_venmo
  );

  if (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : error 
    });
  }

  return res.status(200).json({payoutData:data });
}

async function checkPayoutStatusController(req: Request, res: Response) {
  const { batchId } = req.body;

  const { error, data } = await checkPayoutStatus(batchId);

  if (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : error 
    });
  }

  return res.status(200).json({ data });
}

export { createPayoutController, checkPayoutStatusController };
