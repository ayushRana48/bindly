interface PostData {
    username: any;
    timepost: any; // or Date, depending on your actual data
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
    // Optional fields
    place?: number;
    netMoney?: number;
  }
  
  // -----------------------------------------
  // The helper function
  // -----------------------------------------
  function buildLeaderboardData(
    postsData: PostData[], 
    usersData: { username: string }[],
    startDate: Date, 
    tasksperweek: number
  ): LeaderboardEntry[] {
    // 1) Build the userPosts structure: user -> weekNum -> Date[]
    const userPosts: Record<string, Record<number, Date[]>> = {};
  
    postsData.forEach(post => {
      const { username, timepost } = post;
      const postDate = new Date(timepost);
  
      // Calculate a zero-based "week number" from the start date
      const weekNum = Math.floor(
        (postDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
  
      if (!userPosts[username]) {
        userPosts[username] = {};
      }
      if (!userPosts[username][weekNum]) {
        userPosts[username][weekNum] = [];
      }
      userPosts[username][weekNum].push(postDate);
    });
  
    // 2) Create a LeaderboardEntry for each user
    const leaderboard: LeaderboardEntry[] = usersData.map(user => {
      const username = user.username;
      const userWeeks = userPosts[username] || {};
  
      const weeks = Object.keys(userWeeks).map(weekNumStr => {
        const weekNum = parseInt(weekNumStr, 10);
        const weekPosts = userWeeks[weekNum];
  
        // The first N = tasksperweek count as "countedPosts"
        const countedPosts = weekPosts.slice(0, tasksperweek);
        // Anything beyond that is "unCountedPosts"
        const unCountedPosts = weekPosts.slice(tasksperweek);
  
        // Build a date range for this particular week
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + weekNum * 7);
  
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
  
        return {
          weekNum: weekNum + 1, // converting zero-based to one-based for display
          weekRange: `${weekStart.toISOString()} - ${weekEnd.toISOString()}`,
          countedPosts: countedPosts.length,
          unCountedPosts: unCountedPosts.length,
        };
      });
  
      return {
        username,
        weeks,
        totalCountedPosts: weeks.reduce((acc, w) => acc + w.countedPosts, 0),
        totalUnCountedPosts: weeks.reduce((acc, w) => acc + w.unCountedPosts, 0),
      };
    });
  
    // 3) Sort the leaderboard by descending totalCountedPosts (optional)
    leaderboard.sort((a, b) => b.totalCountedPosts - a.totalCountedPosts);
  
    // 4) Return it
    return leaderboard;
  }
  
export {buildLeaderboardData}