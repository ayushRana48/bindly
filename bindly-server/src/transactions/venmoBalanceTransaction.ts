import { PrismaClient } from "@prisma/client";
import { DatabaseResponse, VenmoBalanceTransaction } from "../types";
import { v4 as uuidv4 } from 'uuid';
const prisma = new PrismaClient();
import braintree from "braintree"



export async function createVenmoBalanceTransaction(
    groupid: string,
    amount: number,
    receiver_id: string,
    payer_id: string,
): Promise<DatabaseResponse<VenmoBalanceTransaction>> {
    try {
        const timestamp = new Date()
        
        const data = await prisma.venmo_balances.create({
            data: {
                groupid: groupid,
                amount: amount,
                receiver_id: receiver_id,
                payer_id: payer_id,
                time_initiated: timestamp,
                time_paid: null,
                paid: false,
            }
        })

        return {
            data: data,
            error: null
        }
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error : new Error("Unknown error")
        }
    }
}


export async function updateVenmoBalanceTransaction(
    id: string,
    paid: boolean
): Promise<DatabaseResponse<VenmoBalanceTransaction>> {
    const timePaid = new Date()
    try {
        const data = await prisma.venmo_balances.update({
            where: { id: id },
            data: { time_paid: timePaid, paid: paid }
        })

        return { data: data, error: null }
    } catch (error) {
        return { data: null, error: error instanceof Error ? error : new Error("Unknown error") }
    }
}


export async function getVenmoBalanceTransaction(
    username: string
): Promise<DatabaseResponse<any>> {
    try {
        const data = await prisma.venmo_balances.findMany({
            where: {
                OR: [
                    { payer_id: username },
                    { receiver_id: username }
                ]
            },
            include: {
                groups: {
                    select: { groupname: true }
                }
            }
        });

        console.log("data", data);



        const group_balance_dict: {
            unpaid: Record<string, { id: string, amount: number, payer: string, receiver: string, groupname: string }>,
            paid: Record<string, { id: string, amount: number, payer: string, receiver: string, groupname: string }>
        } = { unpaid: {}, paid: {} };

        for (const transaction of data) {
            if (transaction.paid) {
                group_balance_dict.paid[`${transaction.groupid}-**-${transaction.groups.groupname}`] = { id: transaction.id, amount: transaction.amount, payer: transaction.payer_id, receiver: transaction.receiver_id, groupname: transaction.groups.groupname }
            } else {
                group_balance_dict.unpaid[`${transaction.groupid}-**-${transaction.groups.groupname}`] = { id: transaction.id, amount: transaction.amount, payer: transaction.payer_id, receiver: transaction.receiver_id, groupname: transaction.groups.groupname }
            }
        }

        const compressed_balance_dict: Record<string, { amount: number }> = {}

        for (const transaction of data) {
            console.log("transaction", transaction);
            //if the user is the payer, add the amount to the receiver as negative to show we owe them
            if (!transaction.paid) {
                if (transaction.payer_id === username) {
                    const newAmount = (compressed_balance_dict[transaction.receiver_id]?.amount ?? 0) - transaction.amount
                    console.log("newAmountpayer", newAmount);
                    compressed_balance_dict[transaction.receiver_id] = { amount: newAmount }
                } else {
                    //if the user is the receiver, add the amount to the payer as positive to show they owe us
                    const newAmount = (compressed_balance_dict[transaction.payer_id]?.amount ?? 0) + transaction.amount
                    console.log("newAmountreceiver", newAmount);
                    compressed_balance_dict[transaction.payer_id] = { amount: newAmount }
                }
            }
        }

        const new_compressed_balance_dict :{ id: string, amount: number, payer: string, receiver: string }[] = []

        for (const entry of Object.entries(compressed_balance_dict)) {
            if (entry[1].amount > 0) {
                const x = { id: uuidv4(), amount: Math.abs(entry[1].amount), payer: entry[0], receiver: username }
                new_compressed_balance_dict.push(x)
            }
            else{
                const x = { id: uuidv4(), amount: Math.abs(entry[1].amount), payer: username, receiver: entry[0] }
                new_compressed_balance_dict.push(x)
            }
        }

        return { data: { compressed_balance_dict:new_compressed_balance_dict, group_balance_dict }, error: null }

    }
    catch (error) {
        return { data: null, error: error instanceof Error ? error : new Error("Unknown error") }
    }
}


// Braintree Gateway
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox, // Change to Production when live
    merchantId: "xw8655ps6h5ff2by",
    publicKey: "2vkhfcqfz7q7gtfx",
    privateKey: "3acb23d9871e6effc5cb7be89b5bb3f8",
  })
  


export const getClientToken = async () => {
    try {
        const response = await gateway.clientToken.generate({})
        return {data: response.clientToken, error: null}
    } catch (error) {
        return {data: null, error: error instanceof Error ? error : new Error("Unknown error")}
    }
}

export const processVenmoPayment = async (nonce: string, amount: number, payer: string, receiver: string) => {
    try {
        const saleResult = await gateway.transaction.sale({
            amount: amount.toString(),
            paymentMethodNonce: nonce,
            options: { submitForSettlement: true },
        })
        return {data: saleResult, error: null}
    } catch (error) {
        return {data: null, error: error instanceof Error ? error : new Error("Unknown error")}
    }
}   


