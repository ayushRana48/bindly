const { createPayout } = require('../transactions/paypalTransactions.js');

async function createPayoutController(req, res) {
    const { user_id, recipient_email, amount, is_venmo } = req.body;

    const {error,payoutData}= await createPayout(user_id, recipient_email, amount, is_venmo )

    if(error){
        res.status(400).json({error})
    }

    else{
        res.status(200).json({payoutData})
    }
}



module.exports = {createPayoutController};
