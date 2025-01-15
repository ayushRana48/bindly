import { PrismaClient } from '@prisma/client';
import { createPendingBalanceTransaction, finalizeBalanceTransaction } from "./balanceTransactions";

async function createGroupBalanceTransaction(
  prisma: PrismaClient,
  username: string,
  groupid: string,
  subtype: string,
  amount: number,
  errorMessage?: string | null
) {
  // Create a pending transaction
  console.log("about to create pending transaction", username, groupid, amount);

  const { data: pendingTransaction, error: pendingError } = await createPendingBalanceTransaction(prisma,'Group', username, amount);
  if (pendingError) {
    console.log(pendingError,' rerrie')
    return { data: null, error: pendingError };
  }

  try {
    // Insert child transaction into `balance_group_transaction`
    await prisma.balance_group_transaction.create({
      data: {
        id: pendingTransaction.id,
        groupid: groupid,
        type: subtype,
      }
    });

    // Finalize the transaction as successful
    console.log('bow finalize')
    const {newBalance, error}= await finalizeBalanceTransaction(prisma,pendingTransaction.id, 'Success', username, amount);
    return { newBalance, error };

  } catch (error) {
    // Mark the parent transaction as failed in case of any unexpected error
    const {newBalance}= await finalizeBalanceTransaction(prisma,pendingTransaction.id, 'Fail', username, amount, error instanceof Error ? error.message : 'Unknown error');
    return {newBalance, error: error instanceof Error ? error : new Error('Unknown error occurred.') };
  }
}

export { createGroupBalanceTransaction };
