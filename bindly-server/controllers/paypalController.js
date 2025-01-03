const { createPayout, checkPayoutStatus } = require('../transactions/paypalTransactions.js');

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

async function checkPayoutStatusController(req, res) {
    const {batchId } = req.body;

    const {error,data}= await checkPayoutStatus(batchId)

    if(error){
        res.status(400).json({error})
    }

    else{
        res.status(200).json({data})
    }
}




module.exports = {createPayoutController,checkPayoutStatusController};
