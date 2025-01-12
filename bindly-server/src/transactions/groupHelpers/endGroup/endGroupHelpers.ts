import { supabase } from '../../../initSupabase';

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
    uniqueUsers: Array<{ username: string; netMoney: number }>
): Promise<{ error: Error | null }> {
    try {
        // Build a set of promises
        const balanceUpdatePromises = userData.map(user => {
            const userUpdate = uniqueUsers.find(u => u.username === user.username);
            const newBalance = user.balance + (userUpdate?.netMoney || 0);

            return supabase
                .from("users")
                .update({ balance: newBalance })
                .eq("username", user.username);
        });

        const balanceUpdateResults = await Promise.all(balanceUpdatePromises);

        const balanceUpdateErrors = balanceUpdateResults.filter(res => res.error);
        if (balanceUpdateErrors.length > 0) {
            return { error: new Error("Failed to update some user balances") };
        }

        return { error: null };
    } catch (err) {
        return {
            error: err instanceof Error ? err : new Error("Unknown error while updating balances"),
        };
    }
}

export { aggregateLeaderboards, updateUserBalances }