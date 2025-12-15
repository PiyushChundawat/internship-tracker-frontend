import React from 'react';
import Tabs from './Tabs';
import CompetitiveProgrammingDashboard from './CompetitiveProgrammingDashboard';
import RatingTracker from './RatingTracker';
import ContestPerformanceLog from './ContestPerformanceLog';
import DSAProgressTracker from './DSAProgressTracker';
import ResumeSection from './ResumeSection';
import CoursesTracker from './CoursesTracker';
import Certificates from './Certificates';

const PiyushDashboard: React.FC = () => {
  const tabs = [
    { label: 'CP Dashboard', content: <CompetitiveProgrammingDashboard /> },
    { label: 'Rating Tracker', content: <RatingTracker /> },
    { label: 'Contest Log', content: <ContestPerformanceLog /> },
    { label: 'DSA Progress', content: <DSAProgressTracker /> },
    { label: 'Resume', content: <ResumeSection /> },
    { label: 'Courses', content: <CoursesTracker profile="piyush" /> },
    { label: 'Certificates', content: <Certificates profile="piyush" /> },
  ];

  return <Tabs tabs={tabs} />;
};

export default PiyushDashboard;