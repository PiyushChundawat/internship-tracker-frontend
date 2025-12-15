import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface Habit {
  id: string;
  profile: string;
  name: string;
  sort_order: number;
}

interface HabitEntry {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
}

interface HabitTrackerProps {
  profile: 'piyush' | 'shruti';
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ profile }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  // Generate last 10 days
  const getLast10Days = () => {
    const days: string[] = [];
    for (let i = 9; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last10Days = getLast10Days();

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch habits
      const habitsResponse = await axios.get(`${API_BASE_URL}/habits`, {
        params: { profile }
      });

      if (habitsResponse.data.success) {
        setHabits(habitsResponse.data.data);
      }

      // Fetch habit entries for last 10 days
      const fromDate = last10Days[0];
      const toDate = last10Days[last10Days.length - 1];

      const entriesResponse = await axios.get(`${API_BASE_URL}/habit-entries`, {
        params: { profile, from: fromDate, to: toDate }
      });

      if (entriesResponse.data.success) {
        setHabitEntries(entriesResponse.data.data);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching habit data:', err);
      setError(err.response?.data?.error || 'Failed to fetch habit data');
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async () => {
    if (!newHabitName.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/habits`, {
        profile,
        name: newHabitName,
        sort_order: habits.length
      });

      if (response.data.success) {
        setHabits([...habits, response.data.data]);
        setNewHabitName('');
        setIsAdding(false);
      }
    } catch (err: any) {
      console.error('Error adding habit:', err);
      setError(err.response?.data?.error || 'Failed to add habit');
    }
  };

  const deleteHabit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this habit? All tracking data will be lost.')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/habits/${id}`);
      
      if (response.data.success) {
        setHabits(habits.filter(h => h.id !== id));
        setHabitEntries(habitEntries.filter(e => e.habit_id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting habit:', err);
      setError(err.response?.data?.error || 'Failed to delete habit');
    }
  };

  const toggleHabit = async (date: string, habitId: string) => {
    // Find existing entry
    const existingEntry = habitEntries.find(
      entry => entry.habit_id === habitId && entry.date === date
    );

    try {
      if (existingEntry) {
        // Update existing entry
        const response = await axios.put(`${API_BASE_URL}/habit-entries/${existingEntry.id}`, {
          completed: !existingEntry.completed
        });

        if (response.data.success) {
          setHabitEntries(habitEntries.map(entry =>
            entry.id === existingEntry.id ? response.data.data : entry
          ));
        }
      } else {
        // Create new entry
        const response = await axios.post(`${API_BASE_URL}/habit-entries`, {
          habit_id: habitId,
          date: date,
          completed: true
        });

        if (response.data.success) {
          setHabitEntries([...habitEntries, response.data.data]);
        }
      }
    } catch (err: any) {
      console.error('Error toggling habit:', err);
      setError(err.response?.data?.error || 'Failed to update habit');
    }
  };

  const isHabitCompleted = (date: string, habitId: string): boolean => {
    const entry = habitEntries.find(
      e => e.habit_id === habitId && e.date === date
    );
    return entry?.completed || false;
  };

  const calculateCompletion = () => {
    const total = habits.length * last10Days.length;
    if (total === 0) return 0;

    const completed = habitEntries.filter(entry => entry.completed).length;
    return Math.round((completed / total) * 100);
  };

  const calculateStreak = (habitId: string) => {
    let streak = 0;
    for (let i = last10Days.length - 1; i >= 0; i--) {
      if (isHabitCompleted(last10Days[i], habitId)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-green-500">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-green-500">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-800 flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          10-Day Habit Tracker
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
        >
          {isAdding ? 'Cancel' : '+ Add Habit'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isAdding && (
        <div className="mb-4 p-4 border rounded bg-green-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addHabit()}
              placeholder="Habit name (e.g., DSA, CP, Reading)"
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            <button
              onClick={addHabit}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No habits configured. Click "Add Habit" to start tracking!
        </div>
      ) : (
        <>
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-lg font-medium text-green-800">
              Completion: {calculateCompletion()}%
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-green-300 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-green-100">
                  <th className="border border-green-300 p-3 text-left font-semibold text-green-800">
                    Date
                  </th>
                  {habits.map((habit) => (
                    <th
                      key={habit.id}
                      className="border border-green-300 p-2 text-center font-semibold text-green-800"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{habit.name}</span>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                          title="Delete habit"
                        >
                          🗑️
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {last10Days.map((date) => (
                  <tr key={date} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 font-medium">
                      {new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    {habits.map((habit) => (
                      <td key={habit.id} className="border border-gray-300 p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isHabitCompleted(date, habit.id)}
                          onChange={() => toggleHabit(date, habit.id)}
                          className="h-5 w-5 text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2 text-gray-800">Current Streaks</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {habits.map((habit) => {
                const streak = calculateStreak(habit.id);
                return (
                  <div
                    key={habit.id}
                    className={`p-3 rounded-lg ${
                      streak > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-sm">{habit.name}</div>
                    <div className={`text-lg font-bold ${streak > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {streak} {streak === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HabitTracker;