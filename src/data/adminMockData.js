// ─── Matches ─────────────────────────────────────────────────────────────────
export const mockMatches = [
  { id: 'm1', title: 'Arsenal vs Manchester United', homeTeam: 'Arsenal', awayTeam: 'Manchester United', league: 'Premier League', stadium: 'Emirates Stadium / EPL', matchDate: '2024-04-18 20:45', market: 'Corners',     status: 'active', tickets: 32, author: 'Williams Idowu', createdAt: '2024/01/29 at 10:24 pm', adminPick: 'Over 9.5',        winners: 3,  tier: 'silver',   ticketPrice: 0.99,  prizePool: 44.55 },
  { id: 'm2', title: 'Chelsea vs Newcastle United',  homeTeam: 'Chelsea', awayTeam: 'Newcastle United',  league: 'Premier League', stadium: 'Stamford Bridge / EPL',  matchDate: '2024-04-19 18:00', market: 'Total Goals', status: 'active', tickets: 21, author: 'Williams Idowu', createdAt: '2024/01/30 at 8:00 am',  adminPick: 'Over 2.5',        winners: 5,  tier: 'silver',   ticketPrice: 0.99,  prizePool: 29.70 },
  { id: 'm3', title: 'Real Madrid vs Barcelona',     homeTeam: 'Real Madrid', awayTeam: 'Barcelona',    league: 'La Liga',        stadium: 'Bernabeu / La Liga',      matchDate: '2024-04-20 21:00', market: 'BTTS',        status: 'active', tickets: 45, author: 'Admin Super',   createdAt: '2024/02/01 at 2:15 pm',  adminPick: 'BTTS - Yes',      winners: 2,  tier: 'platinum', ticketPrice: 24.99, prizePool: 1124.55 },
  { id: 'm4', title: 'Bayern vs Borussia Dortmund',  homeTeam: 'Bayern', awayTeam: 'Dortmund',          league: 'Bundesliga',     stadium: 'Allianz Arena / Bundesliga', matchDate: '2024-04-21 17:30', market: 'Total Cards', status: 'ended', tickets: 18, author: 'Williams Idowu', createdAt: '2024/02/03 at 11:00 am', adminPick: 'Over 3.5',        winners: 3,  tier: 'silver',   ticketPrice: 0.99,  prizePool: 26.73 },
  { id: 'm5', title: 'PSG vs Marseille',             homeTeam: 'PSG', awayTeam: 'Marseille',             league: 'Ligue 1',        stadium: 'Parc des Princes / L1',   matchDate: '2024-04-22 20:00', market: 'Shots',       status: 'active', tickets: 29, author: 'Admin Super',   createdAt: '2024/02/05 at 9:30 am',  adminPick: 'Over 12.5',       winners: 5,  tier: 'gold',     ticketPrice: 4.99,  prizePool: 179.64 },
  { id: 'm6', title: 'Juventus vs Inter Milan',      homeTeam: 'Juventus', awayTeam: 'Inter Milan',      league: 'Serie A',        stadium: 'Allianz Stadium / Serie A', matchDate: '2024-04-23 19:45', market: 'Fouls',      status: 'active', tickets: 12, author: 'Williams Idowu', createdAt: '2024/02/06 at 4:00 pm',  adminPick: 'Over 22.5',       winners: 2,  tier: 'gold',     ticketPrice: 4.99,  prizePool: 89.82 },
  { id: 'm7', title: 'Tottenham vs Liverpool',       homeTeam: 'Tottenham', awayTeam: 'Liverpool',       league: 'Premier League', stadium: 'Tottenham Hotspur Stadium', matchDate: '2024-04-24 15:00', market: 'Corners',    status: 'ended', tickets: 37, author: 'Williams Idowu', createdAt: '2024/02/07 at 1:00 pm',  adminPick: 'Over 8.5',        winners: 3,  tier: 'silver',   ticketPrice: 0.99,  prizePool: 44.55 },
  { id: 'm8', title: 'Ajax vs PSV',                  homeTeam: 'Ajax', awayTeam: 'PSV',                  league: 'Eredivisie',     stadium: 'Johan Cruyff / Eredivisie', matchDate: '2024-04-25 18:30', market: 'Penalty',    status: 'active', tickets: 8,  author: 'Admin Super',   createdAt: '2024/02/08 at 7:00 am',  adminPick: 'Penalty in Game', winners: 1,  tier: 'platinum', ticketPrice: 24.99, prizePool: 199.92 },
  { id: 'm9', title: 'Celtic vs Rangers',            homeTeam: 'Celtic', awayTeam: 'Rangers',            league: 'Scottish Prem',  stadium: 'Celtic Park / SPL',       matchDate: '2024-04-26 12:00', market: 'Total Goals', status: 'active', tickets: 16, author: 'Williams Idowu', createdAt: '2024/02/09 at 10:00 am', adminPick: 'Over 1.5',        winners: 5,  tier: 'gold',     ticketPrice: 4.99,  prizePool: 119.76 },
  { id: 'm10', title: 'AC Milan vs Napoli',          homeTeam: 'AC Milan', awayTeam: 'Napoli',           league: 'Serie A',        stadium: 'San Siro / Serie A',       matchDate: '2024-04-27 20:45', market: 'Throw Ins',   status: 'draft', tickets: 0,  author: 'Admin Super',   createdAt: '2024/02/10 at 3:00 pm',  adminPick: 'Over 25.5',       winners: 3,  tier: 'gold',     ticketPrice: 4.99,  prizePool: 0 },
];

// ─── Tickets / Predictions ────────────────────────────────────────────────────
export const mockTickets = [
  { id: 't1',  ticketNumber: 'WAL-20240418-00001', matchId: 'm1', match: 'Arsenal vs Manchester United', market: 'Corners',      prediction: 10, user: '@james88',    userId: 'u1', purchasedAt: '2024/01/29 at 10:24 pm', status: 'correct' },
  { id: 't2',  ticketNumber: 'WAL-20240418-00002', matchId: 'm1', match: 'Arsenal vs Manchester United', market: 'Corners',      prediction: 11, user: '@mary_2',     userId: 'u2', purchasedAt: '2024/01/29 at 11:00 am', status: 'correct' },
  { id: 't3',  ticketNumber: 'WAL-20240419-00003', matchId: 'm2', match: 'Chelsea vs Newcastle United',  market: 'Total Goals',  prediction: 3,  user: '@tony99',     userId: 'u3', purchasedAt: '2024/01/30 at 9:00 am',  status: 'pending' },
  { id: 't4',  ticketNumber: 'WAL-20240419-00004', matchId: 'm2', match: 'Chelsea vs Newcastle United',  market: 'Total Goals',  prediction: 2,  user: '@kate55',     userId: 'u4', purchasedAt: '2024/01/30 at 9:30 am',  status: 'incorrect' },
  { id: 't5',  ticketNumber: 'WAL-20240420-00005', matchId: 'm3', match: 'Real Madrid vs Barcelona',     market: 'BTTS',         prediction: 1,  user: '@fred007',    userId: 'u5', purchasedAt: '2024/02/01 at 3:00 pm',  status: 'correct' },
  { id: 't6',  ticketNumber: 'WAL-20240420-00006', matchId: 'm3', match: 'Real Madrid vs Barcelona',     market: 'BTTS',         prediction: 1,  user: '@anna_1',     userId: 'u6', purchasedAt: '2024/02/01 at 4:00 pm',  status: 'correct' },
  { id: 't7',  ticketNumber: 'WAL-20240421-00007', matchId: 'm4', match: 'Bayern vs Borussia Dortmund',  market: 'Total Cards',  prediction: 4,  user: '@sam22',      userId: 'u7', purchasedAt: '2024/02/03 at 12:00 pm', status: 'winner' },
  { id: 't8',  ticketNumber: 'WAL-20240421-00008', matchId: 'm4', match: 'Bayern vs Borussia Dortmund',  market: 'Total Cards',  prediction: 4,  user: '@williams',   userId: 'u8', purchasedAt: '2024/02/03 at 1:00 pm',  status: 'correct' },
  { id: 't9',  ticketNumber: 'WAL-20240422-00009', matchId: 'm5', match: 'PSG vs Marseille',             market: 'Shots',        prediction: 13, user: '@john_d',     userId: 'u9', purchasedAt: '2024/02/05 at 10:00 am', status: 'pending' },
  { id: 't10', ticketNumber: 'WAL-20240422-00010', matchId: 'm5', match: 'PSG vs Marseille',             market: 'Shots',        prediction: 14, user: '@mike_k',     userId: 'u10', purchasedAt: '2024/02/05 at 11:00 am', status: 'pending' },
  { id: 't11', ticketNumber: 'WAL-20240423-00011', matchId: 'm6', match: 'Juventus vs Inter Milan',      market: 'Fouls',        prediction: 23, user: '@james88',    userId: 'u1', purchasedAt: '2024/02/06 at 5:00 pm',  status: 'correct' },
  { id: 't12', ticketNumber: 'WAL-20240424-00012', matchId: 'm7', match: 'Tottenham vs Liverpool',       market: 'Corners',      prediction: 9,  user: '@mary_2',     userId: 'u2', purchasedAt: '2024/02/07 at 2:00 pm',  status: 'winner' },
  { id: 't13', ticketNumber: 'WAL-20240424-00013', matchId: 'm7', match: 'Tottenham vs Liverpool',       market: 'Corners',      prediction: 9,  user: '@tony99',     userId: 'u3', purchasedAt: '2024/02/07 at 2:30 pm',  status: 'winner' },
  { id: 't14', ticketNumber: 'WAL-20240425-00014', matchId: 'm8', match: 'Ajax vs PSV',                  market: 'Penalty',      prediction: 1,  user: '@kate55',     userId: 'u4', purchasedAt: '2024/02/08 at 8:00 am',  status: 'pending' },
  { id: 't15', ticketNumber: 'WAL-20240426-00015', matchId: 'm9', match: 'Celtic vs Rangers',            market: 'Total Goals',  prediction: 2,  user: '@fred007',    userId: 'u5', purchasedAt: '2024/02/09 at 11:00 am', status: 'pending' },
  { id: 't16', ticketNumber: 'WAL-20240418-00016', matchId: 'm1', match: 'Arsenal vs Manchester United', market: 'Corners',      prediction: 10, user: '@anna_1',     userId: 'u6', purchasedAt: '2024/01/29 at 2:00 pm',  status: 'correct' },
  { id: 't17', ticketNumber: 'WAL-20240419-00017', matchId: 'm2', match: 'Chelsea vs Newcastle United',  market: 'Total Goals',  prediction: 3,  user: '@sam22',      userId: 'u7', purchasedAt: '2024/01/30 at 3:00 pm',  status: 'pending' },
  { id: 't18', ticketNumber: 'WAL-20240420-00018', matchId: 'm3', match: 'Real Madrid vs Barcelona',     market: 'BTTS',         prediction: 0,  user: '@williams',   userId: 'u8', purchasedAt: '2024/02/01 at 5:00 pm',  status: 'incorrect' },
  { id: 't19', ticketNumber: 'WAL-20240426-00019', matchId: 'm9', match: 'Celtic vs Rangers',            market: 'Total Goals',  prediction: 2,  user: '@john_d',     userId: 'u9', purchasedAt: '2024/02/09 at 12:00 pm', status: 'pending' },
  { id: 't20', ticketNumber: 'WAL-20240427-00020', matchId: 'm10', match: 'AC Milan vs Napoli',          market: 'Throw Ins',    prediction: 26, user: '@mike_k',     userId: 'u10', purchasedAt: '2024/02/10 at 4:00 pm', status: 'pending' },
];

// ─── Settle Predictions ───────────────────────────────────────────────────────
export const mockSettleRows = [
  { id: 's1', matchId: 'm1', match: 'Arsenal vs Manchester United', market: 'Corners',     tier: 'silver',   winners: 3, correctOptions: ['9','10','11','12'],       correctPrediction: '10',  tickets: 32, winningTickets: ['WAL-20240418-00001','WAL-20240418-00002','WAL-20240418-00016'], status: 'pending' },
  { id: 's2', matchId: 'm2', match: 'Chelsea vs Newcastle United',  market: 'Total Goals', tier: 'silver',   winners: 5, correctOptions: ['1','2','3','4','5'],      correctPrediction: '3',   tickets: 21, winningTickets: ['WAL-20240419-00003'], status: 'pending' },
  { id: 's3', matchId: 'm3', match: 'Real Madrid vs Barcelona',     market: 'BTTS',        tier: 'platinum', winners: 2, correctOptions: ['Yes','No'],               correctPrediction: 'Yes', tickets: 45, winningTickets: ['WAL-20240420-00005','WAL-20240420-00006'], status: 'pending' },
  { id: 's4', matchId: 'm4', match: 'Bayern vs Borussia Dortmund',  market: 'Total Cards', tier: 'silver',   winners: 3, correctOptions: ['2','3','4','5','6'],      correctPrediction: '4',   tickets: 18, winningTickets: ['WAL-20240421-00007','WAL-20240421-00008'], status: 'published' },
  { id: 's5', matchId: 'm5', match: 'PSG vs Marseille',             market: 'Shots',       tier: 'gold',     winners: 5, correctOptions: ['10','11','12','13','14','15'], correctPrediction: '13', tickets: 29, winningTickets: [], status: 'pending' },
  { id: 's6', matchId: 'm6', match: 'Juventus vs Inter Milan',      market: 'Fouls',       tier: 'gold',     winners: 2, correctOptions: ['20','21','22','23','24','25'], correctPrediction: '23', tickets: 12, winningTickets: ['WAL-20240423-00011'], status: 'pending' },
  { id: 's7', matchId: 'm7', match: 'Tottenham vs Liverpool',       market: 'Corners',     tier: 'silver',   winners: 3, correctOptions: ['7','8','9','10','11'],    correctPrediction: '9',   tickets: 37, winningTickets: ['WAL-20240424-00012','WAL-20240424-00013'], status: 'published' },
  { id: 's8', matchId: 'm8', match: 'Ajax vs PSV',                  market: 'Penalty',     tier: 'platinum', winners: 1, correctOptions: ['Yes','No'],               correctPrediction: 'Yes', tickets: 8,  winningTickets: [], status: 'pending' },
];

// ─── Transactions ─────────────────────────────────────────────────────────────
export const mockTransactions = [
  { id: 'tx1',  reference: 'TXN-20240418-00001', ticketNumber: 'WAL-20240418-00001', user: 'Webmaster',    userId: 'u1', amount: '$1.98', dateAdded: '18/04/2024', status: 'successful' },
  { id: 'tx2',  reference: 'TXN-20240418-00002', ticketNumber: 'WAL-20240418-00002', user: 'Mary Adams',   userId: 'u2', amount: '$0.99', dateAdded: '18/04/2024', status: 'successful' },
  { id: 'tx3',  reference: 'TXN-20240419-00003', ticketNumber: 'WAL-20240419-00003', user: 'Tony Wright',  userId: 'u3', amount: '$0.99', dateAdded: '19/04/2024', status: 'failed' },
  { id: 'tx4',  reference: 'TXN-20240419-00004', ticketNumber: 'WAL-20240419-00004', user: 'Kate Brown',   userId: 'u4', amount: '$0.99', dateAdded: '19/04/2024', status: 'successful' },
  { id: 'tx5',  reference: 'TXN-20240420-00005', ticketNumber: 'WAL-20240420-00005', user: 'Fred James',   userId: 'u5', amount: '$1.98', dateAdded: '20/04/2024', status: 'successful' },
  { id: 'tx6',  reference: 'TXN-20240420-00006', ticketNumber: 'WAL-20240420-00006', user: 'Anna Lee',     userId: 'u6', amount: '$0.99', dateAdded: '20/04/2024', status: 'successful' },
  { id: 'tx7',  reference: 'TXN-20240421-00007', ticketNumber: 'WAL-20240421-00007', user: 'Sam Taylor',   userId: 'u7', amount: '$0.99', dateAdded: '21/04/2024', status: 'failed' },
  { id: 'tx8',  reference: 'TXN-20240421-00008', ticketNumber: 'WAL-20240421-00008', user: 'Williams I.',  userId: 'u8', amount: '$0.99', dateAdded: '21/04/2024', status: 'successful' },
  { id: 'tx9',  reference: 'TXN-20240422-00009', ticketNumber: 'WAL-20240422-00009', user: 'John Doe',     userId: 'u9', amount: '$1.98', dateAdded: '22/04/2024', status: 'successful' },
  { id: 'tx10', reference: 'TXN-20240422-00010', ticketNumber: 'WAL-20240422-00010', user: 'Mike King',    userId: 'u10', amount: '$0.99', dateAdded: '22/04/2024', status: 'successful' },
  { id: 'tx11', reference: 'TXN-20240423-00011', ticketNumber: 'WAL-20240423-00011', user: 'Webmaster',    userId: 'u1', amount: '$0.99', dateAdded: '23/04/2024', status: 'failed' },
  { id: 'tx12', reference: 'TXN-20240424-00012', ticketNumber: 'WAL-20240424-00012', user: 'Mary Adams',   userId: 'u2', amount: '$1.98', dateAdded: '24/04/2024', status: 'successful' },
  { id: 'tx13', reference: 'TXN-20240425-00013', ticketNumber: 'WAL-20240425-00013', user: 'Tony Wright',  userId: 'u3', amount: '$0.99', dateAdded: '25/04/2024', status: 'successful' },
  { id: 'tx14', reference: 'TXN-20240426-00014', ticketNumber: 'WAL-20240426-00014', user: 'Kate Brown',   userId: 'u4', amount: '$0.99', dateAdded: '26/04/2024', status: 'successful' },
  { id: 'tx15', reference: 'TXN-20240427-00015', ticketNumber: 'WAL-20240427-00015', user: 'Fred James',   userId: 'u5', amount: '$1.98', dateAdded: '27/04/2024', status: 'failed' },
];

// ─── Users ────────────────────────────────────────────────────────────────────
export const mockUsers = [
  { id: 'u1',  username: '@webmaster',  name: 'Williams Idowu',  email: 'williams@email.com',  phone: '+2348012345678', dateAdded: '01/01/2024', status: 'enabled',   tickets: 12, winnings: '$54.60' },
  { id: 'u2',  username: '@mary_2',     name: 'Mary Adams',      email: 'mary@email.com',      phone: '+2348023456789', dateAdded: '05/01/2024', status: 'enabled',   tickets: 8,  winnings: '$14.85' },
  { id: 'u3',  username: '@tony99',     name: 'Tony Wright',     email: 'tony@email.com',      phone: '+2348034567890', dateAdded: '10/01/2024', status: 'enabled',   tickets: 5,  winnings: '$0.00' },
  { id: 'u4',  username: '@kate55',     name: 'Kate Brown',      email: 'kate@email.com',      phone: '+2348045678901', dateAdded: '12/01/2024', status: 'disabled',  tickets: 3,  winnings: '$0.00' },
  { id: 'u5',  username: '@fred007',    name: 'Fred James',      email: 'fred@email.com',      phone: '+2348056789012', dateAdded: '15/01/2024', status: 'enabled',   tickets: 9,  winnings: '$29.70' },
  { id: 'u6',  username: '@anna_1',     name: 'Anna Lee',        email: 'anna@email.com',      phone: '+2348067890123', dateAdded: '18/01/2024', status: 'enabled',   tickets: 7,  winnings: '$14.85' },
  { id: 'u7',  username: '@sam22',      name: 'Samuel Okafor',   email: 'sam@email.com',       phone: '+2348078901234', dateAdded: '20/01/2024', status: 'suspended', tickets: 2,  winnings: '$0.00' },
  { id: 'u8',  username: '@williams',   name: 'Williams Tunde',  email: 'wtunde@email.com',    phone: '+2348089012345', dateAdded: '22/01/2024', status: 'enabled',   tickets: 11, winnings: '$39.60' },
  { id: 'u9',  username: '@john_d',     name: 'John Doe',        email: 'john@email.com',      phone: '+2348090123456', dateAdded: '25/01/2024', status: 'enabled',   tickets: 4,  winnings: '$0.00' },
  { id: 'u10', username: '@mike_k',     name: 'Mike King',       email: 'mike@email.com',      phone: '+2348001234567', dateAdded: '28/01/2024', status: 'disabled',  tickets: 6,  winnings: '$0.00' },
  { id: 'u11', username: '@grace_o',    name: 'Grace Osei',      email: 'grace@email.com',     phone: '+2348011111111', dateAdded: '01/02/2024', status: 'enabled',   tickets: 14, winnings: '$79.20' },
  { id: 'u12', username: '@peter_n',    name: 'Peter Nwosu',     email: 'peter@email.com',     phone: '+2348022222222', dateAdded: '05/02/2024', status: 'suspended', tickets: 1,  winnings: '$0.00' },
];

// ─── Notification Templates ───────────────────────────────────────────────────
export const mockTemplates = [
  { id: 'nt1', title: 'Welcome Message',         message: 'Dear [User], Welcome to WinALot! Your account has been created successfully. Start predicting and win big. Regards, [Admin Name]' },
  { id: 'nt2', title: 'Ticket Confirmed',         message: 'Hi [User], Your ticket #[TicketNumber] for [Match] has been confirmed. Good luck! Regards, [Admin Name]' },
  { id: 'nt3', title: 'You Won!',                 message: 'Congratulations [User]! You have won $[Prize] on the [Match] - [Market] market. Your prize will be credited shortly. Regards, [Admin Name]' },
  { id: 'nt4', title: 'Draw Complete',            message: 'Hi [User], The draw for [Match] - [Market] has been completed. Check your dashboard to see if you won. Regards, [Admin Name]' },
  { id: 'nt5', title: 'New Match Available',      message: 'Hey [User], A new prediction market is now live: [Match] - [Market]. Tickets are just $0.99. Get yours now! Regards, [Admin Name]' },
  { id: 'nt6', title: 'Match Cancelled',          message: 'Hi [User], We regret to inform you that [Match] has been cancelled. Your ticket has been fully refunded. Regards, [Admin Name]' },
  { id: 'nt7', title: 'Withdrawal Processed',     message: 'Hi [User], Your withdrawal of $[Amount] has been processed. It should arrive within 1-3 business days. Regards, [Admin Name]' },
  { id: 'nt8', title: 'Account Status Update',   message: 'Dear [User], Your account status has been updated to [Status]. If you have questions, please contact support. Regards, [Admin Name]' },
];

// ─── Notification History ─────────────────────────────────────────────────────
export const mockNotifHistory = [
  { id: 'nh1',  templateId: 'nt1', title: 'Welcome Message',    message: 'Dear James, Welcome to WinALot! Your account has been created successfully. Start predicting and win big. Regards, Williams Idowu',          sentAt: 'Today, 11:47am',     recipient: '@james88' },
  { id: 'nh2',  templateId: 'nt3', title: 'You Won!',           message: 'Congratulations Mary! You have won $14.85 on the Chelsea vs Newcastle - Total Goals market. Your prize will be credited shortly. Regards, Williams Idowu', sentAt: 'Today, 10:30am', recipient: '@mary_2' },
  { id: 'nh3',  templateId: 'nt2', title: 'Ticket Confirmed',   message: 'Hi Tony, Your ticket #WAL-20240419-00003 for Chelsea vs Newcastle United has been confirmed. Good luck! Regards, Williams Idowu',             sentAt: 'Yesterday, 9:00am',  recipient: '@tony99' },
  { id: 'nh4',  templateId: 'nt5', title: 'New Match Available', message: 'Hey Kate, A new prediction market is now live: Real Madrid vs Barcelona - BTTS. Tickets are just $0.99. Get yours now! Regards, Williams Idowu', sentAt: 'Yesterday, 8:00am', recipient: '@kate55' },
  { id: 'nh5',  templateId: 'nt4', title: 'Draw Complete',      message: 'Hi Fred, The draw for Arsenal vs Man United - Corners has been completed. Check your dashboard to see if you won. Regards, Admin Super',      sentAt: '2 days ago, 3:00pm', recipient: '@fred007' },
  { id: 'nh6',  templateId: 'nt7', title: 'Withdrawal Processed', message: 'Hi Anna, Your withdrawal of $29.70 has been processed. It should arrive within 1-3 business days. Regards, Williams Idowu',              sentAt: '2 days ago, 1:00pm', recipient: '@anna_1' },
  { id: 'nh7',  templateId: 'nt8', title: 'Account Status Update', message: 'Dear Sam, Your account status has been updated to Suspended. If you have questions, please contact support. Regards, Admin Super',         sentAt: '3 days ago, 11:00am', recipient: '@sam22' },
  { id: 'nh8',  templateId: 'nt3', title: 'You Won!',           message: 'Congratulations Williams! You have won $39.60 on Tottenham vs Liverpool - Corners. Your prize will be credited shortly. Regards, Admin Super', sentAt: '3 days ago, 9:00am', recipient: '@williams' },
  { id: 'nh9',  templateId: 'nt6', title: 'Match Cancelled',    message: 'Hi John, We regret to inform you that AC Milan vs Napoli has been cancelled. Your ticket has been fully refunded. Regards, Williams Idowu',   sentAt: '4 days ago, 4:00pm', recipient: '@john_d' },
  { id: 'nh10', templateId: 'nt1', title: 'Welcome Message',    message: 'Dear Mike, Welcome to WinALot! Your account has been created successfully. Start predicting and win big. Regards, Williams Idowu',             sentAt: '5 days ago, 2:00pm', recipient: '@mike_k' },
];

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const dashboardStats = {
  activeMatches: 24,
  totalTickets:  128,
  totalUsers:    1008,
  totalVisitors: 2051,
  ticketsTrend:  '+10.3%',
  usersTrend:    '+10.3%',
  visitorsTrend: '-3.5%',
  mostBooked: [
    { match: 'Arsenal vs Manchester United', pct: 35 },
    { match: 'Chelsea vs Newcastle United',  pct: 19 },
    { match: 'Real Madrid vs Barcelona',     pct: 10 },
  ],
  recentTransactions: [
    { id: 'tx1',  ref: 'TXN-20240418-00001', ticket: 'WAL-00001', amount: '$1.98', date: '18/04/2024', status: 'successful' },
    { id: 'tx3',  ref: 'TXN-20240419-00003', ticket: 'WAL-00003', amount: '$0.99', date: '19/04/2024', status: 'failed' },
    { id: 'tx5',  ref: 'TXN-20240420-00005', ticket: 'WAL-00005', amount: '$1.98', date: '20/04/2024', status: 'successful' },
    { id: 'tx7',  ref: 'TXN-20240421-00007', ticket: 'WAL-00007', amount: '$0.99', date: '21/04/2024', status: 'successful' },
    { id: 'tx11', ref: 'TXN-20240423-00011', ticket: 'WAL-00011', amount: '$0.99', date: '23/04/2024', status: 'failed' },
  ],
};
