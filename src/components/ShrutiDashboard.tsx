import React from 'react';
import Tabs from './Tabs';
import ProjectsSection from './ProjectsSection';
import SkillsSection from './SkillsSection';
import CoursesTracker from './CoursesTracker';
import CaseStudies from './CaseStudies';
import Guesstimates from './Guesstimates';
import CaseCompetitions from './CaseCompetitions';
import Certificates from './Certificates';

const ShrutiDashboard: React.FC = () => {
  const tabs = [
    { label: 'Projects', content: <ProjectsSection profile="shruti" /> },
    { label: 'Skills', content: <SkillsSection profile="shruti" /> },
    { label: 'Courses', content: <CoursesTracker profile="shruti" /> },
    { label: 'Case Studies', content: <CaseStudies /> },
    { label: 'Guesstimates', content: <Guesstimates /> },
    { label: 'Competitions', content: <CaseCompetitions /> },
    { label: 'Certificates', content: <Certificates profile="shruti" /> },
  ];

  return <Tabs tabs={tabs} />;
};

export default ShrutiDashboard;