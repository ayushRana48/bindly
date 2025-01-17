import { PrismaClient, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

async function updateUserBalance(
  prisma: PrismaClient | Prisma.TransactionClient, // Accept both
  username: string,
  netMoney: number,
  groupId: string,
  transactionType: string,
  tx?: Prisma.TransactionClient // Specifically allow TransactionClient here
): Promise<{ newBalance: number | null, error: Error | null }> {
  const client = tx || prisma; // Use provided transaction or main client
  const time = new Date();
  const transactionId = uuidv4();
  console.log('updateUserBalance called');


  try {
    // Check if `tx` is not provided and `client` is a PrismaClient
    if (!tx && client instanceof PrismaClient) {
      // Automatically handle transaction for standalone use
      return await client.$transaction((transactionClient) =>
        updateUserBalance(transactionClient, username, netMoney, groupId, transactionType, transactionClient)
      );
    }

    // Fetch and update user balance
    const user = await client.users.findUnique({
      where: { username },
      select: { balance: true },
    });

    
    if (!user) {
      throw new Error("Failed to fetch user balance for: " + username);
    }

    const newBalance = user.balance + netMoney;

    if (newBalance < 0) {
      throw new Error("New balance is negative, Insufficient funds");
    }

    // Log balance transaction
    await client.balance_transaction.create({
      data: {
        id: transactionId,
        time,
        transactionType: "Group",
        username,
        amount: netMoney,
        state: "Success",
        error: null,
      },
    });

    // Log group transaction
    await client.balance_group_transaction.create({
      data: {
        id: transactionId,
        groupid: groupId,
        type: transactionType,
      },
    });

    // Update user balance
    const  userUpdate =await client.users.update({
      where: { username },
      data: { balance: newBalance },
    });
    console.log('user balance updated',userUpdate);

    // throw new Error('hahaha funnt error no nees');

    return { newBalance, error: null };
  } catch (error) {
    return {
      newBalance: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
}

export { updateUserBalance };
