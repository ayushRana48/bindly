import { Group } from "types";


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
  
  interface GroupsResponse {
    current: Group[];
    archive: Group[];
  }
  
  interface UserPosts {
    [username: string]: {
      [weekNum: string]: Date[];
    };
  }
  
  interface RankMember {
    rank: number;
    members: LeaderboardEntry[];
    quantity: number;
  }
  

function distributeMoney(leaderboard: LeaderboardEntry[], buyin: number): LeaderboardEntry[] {
    const rankDict = initializeRankDict(leaderboard.length);
    const ranks = populateRankDict(rankDict, leaderboard);
    const rankMembers = buildRankMembers(rankDict, ranks);
  
    if (rankMembers.length === 1) {
      distributeEqualMoney(rankMembers[0].members, buyin);
      return flattenRankMembers(rankMembers);
    }
  
    const totalGain = buyin * leaderboard.length;
    const baseGain = calculateBaseGain(rankMembers, totalGain);
    distributeRankedMoney(rankMembers, baseGain);
  
    return flattenRankMembers(rankMembers);
  }
  
  // Helper to initialize the rank dictionary
  function initializeRankDict(length: number): LeaderboardEntry[][] {
    const rankDict = new Array(length);
    for (let i = 0; i < length; i++) {
      rankDict[i] = [];
    }
    return rankDict;
  }
  
  // Helper to populate the rank dictionary and collect unique ranks
  function populateRankDict(rankDict: LeaderboardEntry[][], leaderboard: LeaderboardEntry[]): Set<number> {
    const ranks = new Set<number>();
    leaderboard.forEach(user => {
      const currPlace = user.place!;
      rankDict[currPlace - 1].push(user);
      ranks.add(currPlace);
    });
    return ranks;
  }
  
  // Helper to build rank members from the rank dictionary and ranks set
  function buildRankMembers(rankDict: LeaderboardEntry[][], ranks: Set<number>): RankMember[] {
    const ranksArr = Array.from(ranks);
    return ranksArr.map(rank => ({
      rank,
      members: rankDict[rank - 1],
      quantity: rankDict[rank - 1].length,
    }));
  }
  
  // Helper to distribute equal money among all members of a single rank
  function distributeEqualMoney(members: LeaderboardEntry[], buyin: number): void {
    members.forEach(user => (user.netMoney = buyin));
  }
  
  // Helper to calculate the base gain for distributing money
  function calculateBaseGain(rankMembers: RankMember[], totalGain: number): number {
    const incrementPercentage = 0.5;
    let sumTop = 0;
    for (let i = rankMembers.length - 1; i >= 0; i--) {
      sumTop += rankMembers[i].members.length * incrementPercentage * (rankMembers.length - 1 - i);
    }
    return totalGain / sumTop;
  }
  
  // Helper to distribute money based on rank
  function distributeRankedMoney(rankMembers: RankMember[], baseGain: number): void {
    const incrementPercentage = 0.5;
    for (let i = rankMembers.length - 1; i >= 0; i--) {
      const rankGain = baseGain * incrementPercentage * (rankMembers.length - 1 - i);
      rankMembers[i].members.forEach(user => (user.netMoney = rankGain));
    }
  }
  
  // Helper to flatten the rank members into a single array of leaderboard entries
  function flattenRankMembers(rankMembers: RankMember[]): LeaderboardEntry[] {
    return rankMembers.flatMap(rank => rank.members);
  }

  
  export {distributeMoney}