import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface Course {
  id: string;
  profile: string;
  course_name: string;
  platform: string;
  total_content: number;
  completed_content: number;
}

interface CoursesTrackerProps {
  profile: 'piyush' | 'shruti';
}

const CoursesTracker: React.FC<CoursesTrackerProps> = ({ profile }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({
    course_name: '',
    platform: '',
    total_content: 100,
    completed_content: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, [profile]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/courses`, {
        params: { profile }
      });
      if (response.data.success) {
        setCourses(response.data.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.response?.data?.error || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.course_name.trim() || !newCourse.platform.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/courses`, {
        ...newCourse,
        profile
      });
      if (response.data.success) {
        setCourses([...courses, response.data.data]);
        setNewCourse({ course_name: '', platform: '', total_content: 100, completed_content: 0 });
        setIsAdding(false);
      }
    } catch (err: any) {
      console.error('Error adding course:', err);
      setError(err.response?.data?.error || 'Failed to add course');
    }
  };

  const handleUpdateCourse = async (id: string, updates: Partial<Course>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/courses/${id}`, updates);
      if (response.data.success) {
        setCourses(courses.map(course => 
          course.id === id ? response.data.data : course
        ));
        setEditingId(null);
      }
    } catch (err: any) {
      console.error('Error updating course:', err);
      setError(err.response?.data?.error || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/courses/${id}`);
      if (response.data.success) {
        setCourses(courses.filter(course => course.id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting course:', err);
      setError(err.response?.data?.error || 'Failed to delete course');
    }
  };

  const incrementProgress = async (course: Course) => {
    if (course.completed_content >= course.total_content) return;
    await handleUpdateCourse(course.id, { 
      completed_content: course.completed_content + 1 
    });
  };

  const decrementProgress = async (course: Course) => {
    if (course.completed_content <= 0) return;
    await handleUpdateCourse(course.id, { 
      completed_content: course.completed_content - 1 
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-indigo-500">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border-l-4 border-indigo-500">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-indigo-800 flex items-center">
          <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
          Courses Tracker
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          {isAdding ? 'Cancel' : '+ Add Course'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddCourse} className="mb-6 p-4 border rounded bg-indigo-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Course Name *</label>
              <input
                type="text"
                value={newCourse.course_name}
                onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., CS50, AlgoExpert"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Platform *</label>
              <input
                type="text"
                value={newCourse.platform}
                onChange={(e) => setNewCourse({ ...newCourse, platform: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., Harvard, Coursera"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Total Content</label>
              <input
                type="number"
                value={newCourse.total_content}
                onChange={(e) => setNewCourse({ ...newCourse, total_content: parseInt(e.target.value) || 100 })}
                className="w-full px-3 py-2 border rounded"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Completed Content</label>
              <input
                type="number"
                value={newCourse.completed_content}
                onChange={(e) => setNewCourse({ ...newCourse, completed_content: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded"
                min="0"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Course
          </button>
        </form>
      )}

      <div className="space-y-4">
        {courses.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No courses yet. Start tracking your learning journey!
          </div>
        ) : (
          courses.map((course) => {
            const percentage = Math.round((course.completed_content / course.total_content) * 100);
            
            return (
              <div key={course.id} className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-indigo-800">{course.course_name}</h3>
                    <p className="text-sm text-indigo-600">Platform: {course.platform}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-4 rounded-full transition-all duration-300" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-indigo-700">
                    {course.completed_content} / {course.total_content} ({percentage}%)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => decrementProgress(course)}
                      disabled={course.completed_content <= 0}
                      className="px-3 py-1 bg-indigo-200 text-indigo-800 rounded hover:bg-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      -
                    </button>
                    <button
                      onClick={() => incrementProgress(course)}
                      disabled={course.completed_content >= course.total_content}
                      className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CoursesTracker;