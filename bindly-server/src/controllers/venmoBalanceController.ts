import e, {Request, Response} from "express"
import { getVenmoBalanceTransaction, createVenmoBalanceTransaction, updateVenmoBalanceTransaction, processVenmoPayment, getClientToken } from "../transactions/venmoBalanceTransaction"


export async function getVenmoBalanceController(req: Request, res: Response){
    const username= req.params.username
    try{
        const {data, error}= await getVenmoBalanceTransaction(username)
        if (error){
            return res.status(400).json({error: error.message})
        }

        return res.status(200).json(data)
    }
    catch (error){
        res.status(500).json({error: error instanceof Error? error: new Error("Unknown error")})
    }
}

export async function createVenmoBalanceController(req: Request, res: Response){
    const {groupid, payer_id, receiver_id, amount}= req.body
    try{
        const {data, error}= await createVenmoBalanceTransaction(groupid, amount, receiver_id, payer_id)
        if (error){
            return res.status(400).json({error: error.message})
        }
        return res.status(200).json(data)
    }
    catch (error){
        res.status(500).json({error: error instanceof Error? error: new Error("Unknown error")})
    }
}


export async function updateVenmoBalanceController(req: Request, res: Response){
    const {id, paid}= req.body
    try{
        const {data, error}= await updateVenmoBalanceTransaction(id, paid)
        if (error){
            return res.status(400).json({error: error.message})
        }
        return res.status(200).json(data)
    }
    catch (error){
        res.status(500).json({error: error instanceof Error? error: new Error("Unknown error")})
    }
}   

export async function processVenmoPaymentController(req: Request, res: Response){
    const {nonce, amount, payer, receiver}= req.body
    try{
        const {data, error}= await processVenmoPayment(nonce, amount, payer, receiver)
        if (error){
            return res.status(400).json({error: error.message})
        }
        return res.status(200).json(data)
    }
    catch (error){
        res.status(500).json({error: error instanceof Error? error: new Error("Unknown error")})
    }
}   

export async function getClientTokenController(req: Request, res: Response){
    try{
        const {data, error}= await getClientToken()
        if (error){
            return res.status(400).json({error: error.message})
        }
        console.log("data", data)
        return res.status(200).json(data)
    }
    catch (error){
        res.status(500).json({error: error instanceof Error? error: new Error("Unknown error")})
    }
}   