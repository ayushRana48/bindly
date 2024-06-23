const { getNotifyveto } = require('../transactions/notifyvetoTransactions');



const getNotifyVetoByGroupController = async (req, res) => {
    const { username } = req.params;

    console.log(username)
  
    try {
      const { data, error } = await getNotifyveto(username);

      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };


  module.exports = {getNotifyVetoByGroupController}
