import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

async function createPendingBalanceTransaction(
  prisma: PrismaClient,
  transactionType: string,
  username: string,
  amount: number
) {
  const time = new Date();

  try {
    const data = await prisma.balance_transaction.create({
      data: {
        id: uuidv4(),
        time: time,
        transactionType: transactionType,
        username: username,
        amount: amount,
        error: null,
        state: 'Pending',
      }
    });

    console.log("Pending transaction created in balance_transaction", data.id);
    return { data, error: null };
  } catch (error) {
    console.log("Failed to create pending transaction", error);
    return { data: null, error: new Error(`Failed to create pending transaction: ${error instanceof Error ? error.message : 'Unknown error'}`) };
  }
}

async function finalizeBalanceTransaction(
  prisma: PrismaClient,
  id: string,
  state: 'Success' | 'Fail',
  username: string,
  amount: number,
  errorMessage?: string | null
) {
  const time = new Date();
  let newBalance = 0;
  let oldBalance = 0;

  try {
    const userData = await prisma.users.findUnique({
      where: { username },
      select: { balance: true }
    });

    if (!userData) {
      throw new Error('User not found');
    }

    oldBalance = userData.balance;
    newBalance = userData.balance + amount;

    if (state === 'Fail') {
      newBalance = oldBalance;
    }

    if (state === 'Success') {
      console.log('in success space');

      if (newBalance < 0) {
        console.log('throw insufficient funds');
        throw new Error('Insufficient Funds');
      }

      await prisma.users.update({
        where: { username },
        data: { balance: newBalance }
      });
    }

    const data = await prisma.balance_transaction.update({
      where: { id },
      data: {
        state: state,
        error: errorMessage || null,
        time: time,
      }
    });

    return { newBalance, error: null };
  } catch (err) {
    console.log(`Error in finalizeBalanceTransaction: ${err instanceof Error ? err.message : 'Unknown error'}`);

    await prisma.balance_transaction.update({
      where: { id },
      data: {
        state: 'Fail',
        error: err instanceof Error ? err.message : 'Unknown error',
        time: time,
      }
    });

    return { newBalance: oldBalance, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

export { createPendingBalanceTransaction, finalizeBalanceTransaction };