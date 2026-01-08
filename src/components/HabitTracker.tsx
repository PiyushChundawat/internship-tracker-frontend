import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckSquare, Plus, X, Trash2 } from 'lucide-react';

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

      const habitsResponse = await axios.get(`${API_BASE_URL}/habits`, {
        params: { profile }
      });

      if (habitsResponse.data.success) {
        setHabits(habitsResponse.data.data);
      }

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
    const existingEntry = habitEntries.find(
      entry => entry.habit_id === habitId && entry.date === date
    );

    try {
      if (existingEntry) {
        const response = await axios.put(`${API_BASE_URL}/habit-entries/${existingEntry.id}`, {
          completed: !existingEntry.completed
        });

        if (response.data.success) {
          setHabitEntries(habitEntries.map(entry =>
            entry.id === existingEntry.id ? response.data.data : entry
          ));
        }
      } else {
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
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-green-500" />
          10-Day Habit Tracker
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 border border-green-500 flex items-center gap-1"
        >
          {isAdding ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add Habit</>}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {isAdding && (
        <div className="mb-4 p-4 border border-gray-700 rounded-lg bg-gray-900">
          <div className="flex gap-2">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addHabit()}
              placeholder="Habit name (e.g., DSA, CP, Reading)"
              className="flex-1 px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={addHabit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 border border-green-500"
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
          <div className="mb-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
            <p className="text-lg font-medium text-white">
              Completion: {calculateCompletion()}%
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-700 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-900">
                  <th className="border border-gray-700 p-3 text-left font-medium text-gray-400">
                    Date
                  </th>
                  {habits.map((habit) => (
                    <th
                      key={habit.id}
                      className="border border-gray-700 p-2 text-center font-medium text-gray-400"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{habit.name}</span>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                          title="Delete habit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {last10Days.map((date) => (
                  <tr key={date} className="hover:bg-gray-700 transition-colors">
                    <td className="border border-gray-700 p-3 font-medium text-white">
                      {new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    {habits.map((habit) => (
                      <td key={habit.id} className="border border-gray-700 p-3 text-center">
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
            <h3 className="text-lg font-medium mb-2 text-white">Current Streaks</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {habits.map((habit) => {
                const streak = calculateStreak(habit.id);
                return (
                  <div
                    key={habit.id}
                    className={`p-3 rounded-lg border ${
                      streak > 0 ? 'bg-green-900 border-green-700' : 'bg-gray-900 border-gray-700'
                    }`}
                  >
                    <div className="font-medium text-sm text-white">{habit.name}</div>
                    <div className={`text-lg font-bold ${streak > 0 ? 'text-green-400' : 'text-gray-500'}`}>
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
