// import { distributeMoney } from "./distributeMoney"; // Update to the correct file path

// interface LeaderboardEntry {
//     username: string;
//     weeks: LeaderboardWeek[];
//     totalCountedPosts: number;
//     totalUnCountedPosts: number;
//     place?: number;
//     netMoney?: number;
//   }

//   interface LeaderboardWeek {
//     weekNum: number;
//     weekRange: string;
//     countedPosts: number;
//     unCountedPosts: number;
//   }

// // Sample leaderboard data
// const leaderboard: LeaderboardEntry[] = [
//   {
//       username: "Alice", totalCountedPosts: 10, totalUnCountedPosts: 2, place: 1,
//       weeks: []
//   },
//   {
//       username: "Bob", totalCountedPosts: 8, totalUnCountedPosts: 3, place: 2,
//       weeks: []
//   },
//   {
//       username: "Charlie", totalCountedPosts: 8, totalUnCountedPosts: 2, place: 2,
//       weeks: []
//   }, // Tie
//   {
//       username: "David", totalCountedPosts: 6, totalUnCountedPosts: 1, place: 4,
//       weeks: []
//   },
//   {
//       username: "Eve", totalCountedPosts: 4, totalUnCountedPosts: 5, place: 5,
//       weeks: []
//   },
//   {
//       username: "Frank", totalCountedPosts: 2, totalUnCountedPosts: 7, place: 6,
//       weeks: []
//   },
// ];

// // Set the buy-in amount
// const buyin = 14; // $10 per user

// // Call distributeMoney function
// const updatedLeaderboard = distributeMoney(leaderboard, buyin);


// let sum=0
// for (const entry of updatedLeaderboard) {
//     sum += entry.netMoney || 0;
// }

// let adjustedLeaderboard = updatedLeaderboard.map(entry => ({
//     ...entry,
//     diff: (entry.netMoney || 0) - buyin

// }));


// // Print results to the console
// console.log("Updated Leaderboard with Net Money Distribution:");
// console.table(adjustedLeaderboard);
// console.log("Sum of net money:", sum);


// interface Person {
//     username: string;
//     netMoney: number;
// }

// function settlePayments(leaderboard: LeaderboardEntry[],buyin:number) {
//     const receivers: Person[] = [];
//     const payers: Person[] = [];

//     // Separate payers and receivers
//     for (const person of leaderboard) {
//         if ((person?.netMoney || person.netMoney===0) && person.netMoney-buyin > 0) {
//             receivers.push({ username: person.username, netMoney: person.netMoney-buyin });
//         } else if ((person?.netMoney || person.netMoney===0) && person.netMoney-buyin < 0 ) {
//             payers.push({ username: person.username, netMoney: Math.abs(person.netMoney-buyin) }); // Convert to positive
//         }
//     }


//     payers.sort((a, b) => b.netMoney - a.netMoney);

//     console.log("receivers",receivers);
//     console.log("payers",payers);


//     // Match payers with receivers
//     const transactions: { from: string; to: string; amount: number }[] = [];
//     let i = 0, j = 0;

//     while (i < payers.length && j < receivers.length) {
//         let payer = payers[i];
//         let receiver = receivers[j];

//         let transferAmount = Math.min(payer.netMoney, receiver.netMoney); // Settle the smaller amount

//         transactions.push({ from: payer.username, to: receiver.username, amount: transferAmount });

//         // Deduct transferred amount
//         payer.netMoney -= transferAmount;
//         receiver.netMoney -= transferAmount;

//         // Move to next person in the list if settled
//         if (payer.netMoney === 0) i++;
//         if (receiver.netMoney === 0) j++;
//     }

//     return transactions;
// }


// console.log("settlement");
// console.log(settlePayments(updatedLeaderboard,buyin));


