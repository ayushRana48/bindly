// userControllers.ts


const { createUser, getUser, updateUser, deleteUser,getAllUsers,getUserByEmail } = require('../transactions/usersTransactions');

// Controller for creating a new user
async function createUserController(req, res) {
  const { username, email, name, pfp } = req.body;

  try {
    const { data, error } = await createUser(username, email, name, pfp);

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


// Call the function to check the connection


// Controller for getting a user's details
async function getUserController(req, res) {
  const { username } = req.params;

  try {
    const { data, error } = await getUser(username);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}


async function getUserByEmailController(req, res) {
  const { email } = req.params;

  try {
    const { data, error } = await getUserByEmail(email);


    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}


async function getAllUsersController(req, res) {
  const { username } = req.params;

  try {
    const { data, error } = await getAllUsers();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}
// Controller for updating a user's details
async function updateUserController(req, res) {
  const { username } = req.params;
  const updateParams = req.body;



  try {
    const { data, error } = await updateUser(username, updateParams);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Controller for deleting a user
async function deleteUserController(req, res) {
  const { username } = req.params;

  try {
    const { data, error } = await deleteUser(username);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


module.exports={createUserController,deleteUserController,getUserController,updateUserController,getAllUsersController,getUserByEmailController};

