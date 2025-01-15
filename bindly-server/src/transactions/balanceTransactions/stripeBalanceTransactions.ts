import { PrismaClient } from '@prisma/client';
import { createPendingBalanceTransaction, finalizeBalanceTransaction } from "./balanceTransactions";

async function createPendingStripeBalanceTransaction(
    prisma: PrismaClient,
    cardid: string,
    amount: number,
    username: string
) {
    console.log("Creating pending stripe transaction");
    const { data, error } = await createPendingBalanceTransaction(prisma, 'Stripe', username, amount);
    if (error) {
        return { data: null, error: new Error(`Failed to create pending transaction: ${error.message}`) };
    }

    console.log("Pending transaction created in stripe_balance_transaction", data.id);
    const transactionId = data.id;

    try {
        // Insert into `balance_stripe_transaction` with the pending state
        const stripeData = await prisma.balance_stripe_transaction.create({
            data: {
                id: transactionId,
                cardid: cardid,
                state: 'Pending',
                timeinitiated: new Date(),
            }
        });

        return { data: { transactionId, stripeData }, error: null };
    } catch (error) {
        console.log("Failed to create pending Stripe transaction", error);
        return { data: null, error: new Error(`Failed to create pending Stripe transaction: ${error instanceof Error ? error.message : 'Unknown error'}`) };
    }
}

async function finalizeStripeBalanceTransaction(
    prisma: PrismaClient,
    id: string,
    cardid: string,
    state: 'Success' | 'Fail',
    timeconfirmed: Date,
    username: string,
    amountNumber: number,
    errorMessage?: string | null
) {
    await finalizeBalanceTransaction(prisma, id, state, username, amountNumber, errorMessage);

    try {
        const data = await prisma.balance_stripe_transaction.update({
            where: { id },
            data: {
                state: state,
                timeconfirmed: timeconfirmed,
            }
        });

        return { data, error: null };
    } catch (error) {
        return { data: null, error: new Error(`Failed to finalize Stripe transaction: ${error instanceof Error ? error.message : 'Unknown error'}`) };
    }
}

export { createPendingStripeBalanceTransaction, finalizeStripeBalanceTransaction };
