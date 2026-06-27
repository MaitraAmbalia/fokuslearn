const BADGES = [
  { id: 'newbie', name: 'Fresh Starter', icon: '🌱', minXP: 0, description: 'Started the journey' },
  { id: 'bronze', name: 'Bronze Scholar', icon: '🥉', minXP: 500, description: 'Earned 500 XP' },
  { id: 'silver', name: 'Silver Master', icon: '🥈', minXP: 2000, description: 'Earned 2000 XP' },
  { id: 'gold', name: 'Gold Legend', icon: '🥇', minXP: 5000, description: 'Earned 5000 XP' },
  { id: 'streak_7', name: 'Week Warrior', icon: '🔥', condition: (user) => user.streak >= 7, description: '7 Day Streak' }
];

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 2000, 5000, 10000]; // XP needed for Level 1, 2, 3...

export { BADGES, LEVEL_THRESHOLDS };