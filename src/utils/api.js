// Mock API functions to simulate fetching data from the backend.

export const fetchTrustScore = async () => {
  return {
    overall: 87.5,
    breakdown: [
      { title: 'Consistency', score: 92, tooltip: 'How consistently you create content.', trend: 'up' },
      { title: 'Engagement', score: 85, tooltip: 'How engaged your audience is.', trend: 'down' },
      { title: 'Revenue', score: 78, tooltip: 'Your content monetization performance.', trend: 'up' },
      { title: 'Platform Health', score: 95, tooltip: 'The technical health of your platforms.', trend: 'up' },
      { title: 'Legacy', score: 80, tooltip: 'Your long-term impact and succession planning.', trend: 'down' },
    ]
  };
};

export const fetchTrustScoreHistory = async () => {
  return [
    { name: 'Jan', score: 75 },
    { name: 'Feb', score: 78 },
    { name: 'Mar', score: 82 },
    { name: 'Apr', score: 80 },
    { name: 'May', score: 85 },
    { name: 'Jun', score: 87.5 },
  ];
};

export const fetchAnomalies = async () => {
  return [
    { date: '2024-06-23', type: 'Engagement Spike', severity: 'Warning', status: 'Pending Review' },
    { date: '2024-06-21', type: 'Suspicious CTR', severity: 'Critical', status: 'Resolved' },
    { date: '2024-06-18', type: 'Refund Fraud', severity: 'Info', status: 'Acknowledged' },
  ];
};

export const fetchChallenges = async () => {
    return [
        { title: '🚀 Content Sprint', progress: 75, points: 5 },
        { title: '💬 Audience Revival', progress: 50, points: 10 },
        { title: '🔧 Platform Tune-Up', progress: 25, points: 8 },
        { title: '🎯 Revenue Reboot', progress: 90, points: 12 },
    ];
};

export const fetchConnections = async () => {
    return [
        { name: 'Google Analytics', connected: true },
        { name: 'YouTube', connected: true },
        { name: 'Stripe', connected: false },
        { name: 'Substack', connected: true },
    ];
};
