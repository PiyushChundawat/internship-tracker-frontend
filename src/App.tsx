import React from 'react';
import { DataProvider } from './context/DataContext';
import ProfileToggle from './components/ProfileToggle';
import TodoList from './components/TodoList';
import HabitTracker from './components/HabitTracker';
import DailyLogs from './components/DailyLogs';
import PiyushDashboard from './components/PiyushDashboard';
import ShrutiDashboard from './components/ShrutiDashboard';
import { useData } from './context/DataContext';

const AppContent: React.FC = () => {
  const { profile, setProfile } = useData();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">IT</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Internship Tracker</h1>
          </div>
          <ProfileToggle profile={profile} setProfile={setProfile} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <TodoList profile={profile} />
          <HabitTracker profile={profile} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <DailyLogs profile={profile} />
          {profile === 'piyush' ? <PiyushDashboard /> : <ShrutiDashboard />}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;