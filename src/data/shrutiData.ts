export const shrutiData = {
  todoList: [
    { id: 1, text: 'Complete SQL practice set', completed: false },
    { id: 2, text: 'Work on Python project', completed: true },
    { id: 3, text: 'Review case study notes', completed: false },
  ],
  habitTracker: {
    habits: ['DSA', 'CP', 'Contest', 'Revision', 'Courses'],
    last10Days: [
      '2025-12-05', '2025-12-06', '2025-12-07', '2025-12-08', '2025-12-09',
      '2025-12-10', '2025-12-11', '2025-12-12', '2025-12-13', '2025-12-14'
    ],
    data: {
      '2025-12-05': { DSA: true, CP: false, Contest: false, Revision: true, Courses: true },
      '2025-12-06': { DSA: false, CP: true, Contest: false, Revision: false, Courses: true },
      '2025-12-07': { DSA: true, CP: true, Contest: true, Revision: true, Courses: false },
      '2025-12-08': { DSA: false, CP: false, Contest: false, Revision: true, Courses: true },
      '2025-12-09': { DSA: true, CP: true, Contest: false, Revision: false, Courses: true },
      '2025-12-10': { DSA: false, CP: true, Contest: true, Revision: true, Courses: false },
      '2025-12-11': { DSA: true, CP: false, Contest: false, Revision: true, Courses: true },
      '2025-12-12': { DSA: false, CP: true, Contest: false, Revision: false, Courses: true },
      '2025-12-13': { DSA: true, CP: true, Contest: true, Revision: true, Courses: false },
      '2025-12-14': { DSA: false, CP: false, Contest: false, Revision: true, Courses: true },
    }
  },
  dailyLogs: [
    { date: '2025-12-10', pythonQuestions: 5, sqlQuestions: 3, notes: 'Python basics' },
    { date: '2025-12-11', pythonQuestions: 4, sqlQuestions: 2, notes: 'SQL joins' },
    { date: '2025-12-12', pythonQuestions: 6, sqlQuestions: 4, notes: 'Data analysis' },
  ],
  projects: [
    { projectName: 'Data Analysis Dashboard', description: 'Built with Python and Pandas', personalNotes: 'Learned visualization' },
    { projectName: 'SQL Database Design', description: 'Normalized database schema', personalNotes: 'Improved query skills' },
  ],
  skills: [
    { skillName: 'Python', notes: 'Proficient in data manipulation' },
    { skillName: 'SQL', notes: 'Experienced with complex queries' },
  ],
  courses: [
    { courseName: 'Python for Data Science', platform: 'Coursera', totalContent: 20, completedContent: 15 },
    { courseName: 'SQL Mastery', platform: 'Udemy', totalContent: 50, completedContent: 30 },
  ],
  caseStudies: [
    { title: 'Market Analysis Case', notes: 'Analyzed consumer trends', date: '2025-11-15' },
    { title: 'Business Strategy', notes: 'Developed recommendations', date: '2025-12-01' },
  ],
  guesstimates: [
    { topic: 'Market Size Estimation', learnings: 'Used top-down approach', notes: 'Improved estimation skills' },
    { topic: 'User Growth', learnings: 'Applied cohort analysis', notes: 'Better understanding of metrics' },
  ],
  caseCompetitions: [
    { competitionName: 'Case Challenge 2025', notes: 'Team project', document: 'presentation.pdf' },
    { competitionName: 'Analytics Cup', notes: 'Solo entry', document: 'report.pdf' },
  ],
  certificates: [
    { issuer: 'Google', date: '2025-07-10' },
    { issuer: 'Microsoft', date: '2025-09-05' },
  ],
};