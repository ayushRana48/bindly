import { createGroupBalanceTransaction } from 'transactions/balanceTransactions/groupBalanceTransactions';
import { supabase } from '../../../initSupabase';
import { v4 as uuidv4 } from "uuid";

interface DatabaseResponse<T> {
    data: T | null;
    error: Error | null;
}

interface LeaderboardWeek {
    weekNum: number;
    weekRange: string;
    countedPosts: number;
    unCountedPosts: number;
}

interface LeaderboardEntry {
    username: string;
    weeks: LeaderboardWeek[];
    totalCountedPosts: number;
    totalUnCountedPosts: number;
    place?: number;
    netMoney?: number;
}




function aggregateLeaderboards(
    leaderboards: DatabaseResponse<LeaderboardEntry[]>[]
): Array<{ username: string; netMoney: number }> {
    // Pull out only .data
    const validLeaderboards = leaderboards
        .filter(lb => lb.data !== null)
        .map(lb => lb.data!) as LeaderboardEntry[][];

    // Flatten to get all users across all leaderboards
    const allUsers = validLeaderboards.flat();

    // Build a unique array of { username, netMoney }
    const uniqueUsers = Array.from(new Set(allUsers.map(u => u.username))).map(username => {
        // Sum netMoney for this user across all groups
        const totalNetMoney = allUsers
            .filter(u => u.username === username)
            .reduce((sum, u) => sum + (u.netMoney || 0), 0);

        return {
            username,
            netMoney: totalNetMoney,
        };
    });

    return uniqueUsers;
}


async function updateUserBalances(
    userData: Array<{ username: string; balance: number }>,
    uniqueUsers: Array<{ username: string; netMoney: number; groupid: string }>
): Promise<{ error: Error | null }> {
    try {
        const time = new Date().toISOString();

        // Prepare balance_transaction and balance_group_transaction data
        const balanceTransactions: Array<{
            id: string;
            time: string;
            transactionType: string;
            username: string;
            amount: number;
            state: string;
            error: string | null;
        }> = [];
        const groupTransactions: Array<{ id: string; groupid: string; type: string }> = [];

        // Build a set of promises for updating user balances
        const balanceUpdatePromises = userData.map(async (user) => {
            const userUpdate = uniqueUsers.find((u) => u.username === user.username);
            if (!userUpdate) {
                return null; // Skip if no matching user update
            }

            const newBalance = user.balance + userUpdate.netMoney;

            // Generate transaction IDs
            const transactionId = uuidv4();

            // Prepare balance_transaction entry
            balanceTransactions.push({
                id: transactionId,
                time: time,
                transactionType: "Group",
                username: user.username,
                amount: userUpdate.netMoney,
                state: "Success", // Mark as success for now
                error: null,
            });

            // Prepare balance_group_transaction entry
            groupTransactions.push({
                id: transactionId,
                groupid: userUpdate.groupid,
                type: "BuyIn", // Assuming BuyIn is the subtype
            });

            // Update user balance
            const { error } = await supabase
                .from("users")
                .update({ balance: newBalance })
                .eq("username", user.username);

            if (error) {
                throw new Error(`Failed to update balance for ${user.username}: ${error.message}`);
            }
        });

        // Execute all balance updates
        const balanceUpdateResults = await Promise.all(balanceUpdatePromises);

        // Check for errors
        if (balanceUpdateResults.some((result) => result === null)) {
            throw new Error("Failed to update some user balances");
        }

        // Insert all balance_transaction entries
        const { error: balanceTransactionError } = await supabase
            .from("balance_transaction")
            .insert(balanceTransactions);

        if (balanceTransactionError) {
            throw new Error(`Failed to insert balance transactions: ${balanceTransactionError.message}`);
        }

        // Insert all balance_group_transaction entries
        const { error: groupTransactionError } = await supabase
            .from("balance_group_transaction")
            .insert(groupTransactions);

        if (groupTransactionError) {
            throw new Error(`Failed to insert group transactions: ${groupTransactionError.message}`);
        }

        return { error: null };
    } catch (err) {
        console.error("Error in updateUserBalances:", err);
        return {
            error: err instanceof Error ? err : new Error("Unknown error while updating balances"),
        };
    }
}

export { aggregateLeaderboards, updateUserBalances }