import { Request, Response } from 'express';
import { addComment, getCommentByPost } from '../transactions/commentTransactions';

async function addCommentController(req: Request, res: Response) {
  const { postid, groupid, username, message } = req.body;

  try {
    const { data, error } = await addComment(postid, groupid, username, message);

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

async function getCommentByPostController(req: Request, res: Response) {
  const { postid } = req.params;

  try {
    const { data, error } = await getCommentByPost(postid);

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

export {
  addCommentController,
  getCommentByPostController
};