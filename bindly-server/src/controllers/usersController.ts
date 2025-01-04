import { Request, Response } from 'express';
import { 
  createUser, 
  getUser, 
  updateUser, 
  deleteUser, 
  getAllUsers, 
  getUserByEmail 
} from '../transactions/usersTransactions';



async function getUserController(req: Request, res: Response) {
  const { username } = req.params;

  try {
    const { data, error } = await getUser(username);

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

async function getUserByEmailController(req: Request, res: Response) {
  const { email } = req.params;

  try {
    const { data, error } = await getUserByEmail(email);

    if (error) {
      return res.status(404).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function getAllUsersController(req: Request, res: Response) {
  try {
    const { data, error } = await getAllUsers();

    if (error) {
      return res.status(404).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function updateUserController(req: Request, res: Response) {
  const { username } = req.params;
  const updateParams = req.body;

  try {
    const { data, error } = await updateUser(username, updateParams);

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

async function deleteUserController(req: Request, res: Response) {
  const { username } = req.params;

  try {
    const { data, error } = await deleteUser(username);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

export {
  deleteUserController,
  getUserController,
  updateUserController,
  getAllUsersController,
  getUserByEmailController
};