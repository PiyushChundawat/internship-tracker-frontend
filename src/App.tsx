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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="bg-slate-900 border-b border-slate-800">
  <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
    <div className="flex items-center space-x-3">
  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
    <span className="text-slate-100 font-bold text-sm tracking-wider">
      T
    </span>
  </div>
  <div className="flex flex-col leading-tight">
    <h1 className="text-xl font-semibold text-slate-100 tracking-tight">
      Tracktern
    </h1>
    <span className="text-xs text-slate-400">
      Internship Tracker
    </span>
  </div>
</div>


    <div className="flex items-center">
      <ProfileToggle profile={profile} setProfile={setProfile} />
    </div>
  </div>
</header>


      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
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
