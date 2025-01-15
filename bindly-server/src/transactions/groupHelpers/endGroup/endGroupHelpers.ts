import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

async function updateUserBalance(
  prisma: PrismaClient,
  username: string,
  netMoney: number,
  groupId: string
): Promise<{ error: Error | null }> {
  try {
    const time = new Date();
    const transactionId = uuidv4();

    // Fetch and update user balance
    const user = await prisma.users.findUnique({
      where: { username },
      select: { balance: true }
    });

    if (!user) {
      throw new Error("Failed to fetch user balance for: " + username);
    }

    const newBalance = user.balance + netMoney;

    // Log balance transaction
    await prisma.balance_transaction.create({
      data: {
        id: transactionId,
        time,
        transactionType: "Group",
        username,
        amount: netMoney,
        state: "Success",
        error: null,
      }
    });

    // Log group transaction
    await prisma.balance_group_transaction.create({
      data: {
        id: transactionId,
        groupid: groupId,
        type: "BuyIn",
      }
    });

    // Update user balance
    await prisma.users.update({
      where: { username },
      data: { balance: newBalance }
    });

    return { error: null };
  } catch (error) {
    console.error("Error in updateUserBalance:", error);
    return { error: error instanceof Error ? error : new Error("Unknown error") };
  }
}

export { updateUserBalance };