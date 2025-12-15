export const piyushData = {
  todoList: [
    { id: 1, text: 'Solve 5 LeetCode problems', completed: false },
    { id: 2, text: 'Review Codeforces contest', completed: true },
    { id: 3, text: 'Complete A2Z sheet easy section', completed: false },
  ],
  habitTracker: {
    habits: ['DSA', 'CP', 'Contest', 'Revision', 'Courses'],
    last10Days: [
      '2025-12-05', '2025-12-06', '2025-12-07', '2025-12-08', '2025-12-09',
      '2025-12-10', '2025-12-11', '2025-12-12', '2025-12-13', '2025-12-14'
    ],
    data: {
      '2025-12-05': { DSA: true, CP: false, Contest: false, Revision: true, Courses: true },
      '2025-12-06': { DSA: true, CP: true, Contest: false, Revision: false, Courses: true },
      '2025-12-07': { DSA: false, CP: true, Contest: true, Revision: true, Courses: false },
      '2025-12-08': { DSA: true, CP: false, Contest: false, Revision: true, Courses: true },
      '2025-12-09': { DSA: true, CP: true, Contest: false, Revision: false, Courses: true },
      '2025-12-10': { DSA: false, CP: true, Contest: true, Revision: true, Courses: false },
      '2025-12-11': { DSA: true, CP: false, Contest: false, Revision: true, Courses: true },
      '2025-12-12': { DSA: true, CP: true, Contest: false, Revision: false, Courses: true },
      '2025-12-13': { DSA: false, CP: true, Contest: true, Revision: true, Courses: false },
      '2025-12-14': { DSA: true, CP: false, Contest: false, Revision: true, Courses: true },
    }
  },
  dailyLogs: [
    { date: '2025-12-10', dsaQuestions: 3, notes: 'Focused on arrays' },
    { date: '2025-12-11', dsaQuestions: 2, notes: 'Graphs problems' },
    { date: '2025-12-12', dsaQuestions: 4, notes: 'Dynamic programming' },
  ],
  contestSchedule: [
    { platform: 'Codeforces', contest: 'Div 4', day: 'Friday', time: '8:05 PM IST' },
    { platform: 'Codeforces', contest: 'Div 3', day: 'Sunday', time: '8:05 PM IST' },
    { platform: 'LeetCode', contest: 'Weekly', day: 'Sunday', time: '8:00 AM IST' },
    { platform: 'LeetCode', contest: 'Biweekly', day: 'Saturday', time: '8:00 PM IST' },
    { platform: 'CodeChef', contest: 'Starters', day: 'Wednesday', time: '8:00 PM IST' },
  ],
  ratings: {
    codeforces: 1450,
    leetcode: 1800,
    codechef: 1600,
  },
  contestPerformance: [
    { platform: 'Codeforces', contestName: 'Div 3 Round 890', date: '2025-12-08', problemsSolved: '2 / 7', notes: 'Solved A and B' },
    { platform: 'LeetCode', contestName: 'Weekly Contest 380', date: '2025-12-10', problemsSolved: '3 / 4', notes: 'Good performance' },
  ],
  dsaProgress: {
    a2z: {
      easy: { total: 100, solved: 80 },
      medium: { total: 150, solved: 60 },
      hard: { total: 50, solved: 10 },
    },
    blind75: [
      { questionName: 'Two Sum', solutionLink: 'https://example.com/two-sum' },
      { questionName: 'Valid Parentheses', solutionLink: 'https://example.com/valid-parentheses' },
    ],
  },
  resume: {
    workExperience: 'Intern at XYZ Corp, 6 months',
    skills: 'C++, Python, DSA',
    projects: 'Built a web scraper',
    achievements: 'LeetCode 200 problems solved',
  },
  courses: [
    { courseName: 'CS50', platform: 'Harvard', totalContent: 12, completedContent: 8 },
    { courseName: 'AlgoExpert', platform: 'AlgoExpert', totalContent: 100, completedContent: 50 },
  ],
  certificates: [
    { title: 'AWS Certified', issuer: 'Amazon', date: '2025-06-15' },
    { title: 'Google IT Support', issuer: 'Google', date: '2025-08-20' },
  ],
};