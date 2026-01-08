import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, Plus, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface Todo {
  id: string;
  profile: string;
  content: string;
  completed: boolean;
  created_at: string;
}

interface TodoListProps {
  profile: 'piyush' | 'shruti';
}

const TodoList: React.FC<TodoListProps> = ({ profile }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    fetchTodos();
  }, [profile]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/todos`, {
        params: { profile }
      });
      if (response.data.success) {
        setTodos(response.data.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching todos:', err);
      setError(err.response?.data?.error || 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/todos`, {
        profile,
        content: newTodo
      });
      
      if (response.data.success) {
        setTodos([response.data.data, ...todos]);
        setNewTodo('');
      }
    } catch (err: any) {
      console.error('Error adding todo:', err);
      setError(err.response?.data?.error || 'Failed to add todo');
    }
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/todos/${id}`, {
        completed: !currentStatus
      });
      
      if (response.data.success) {
        setTodos(todos.map(todo => 
          todo.id === id ? response.data.data : todo
        ));
      }
    } catch (err: any) {
      console.error('Error toggling todo:', err);
      setError(err.response?.data?.error || 'Failed to update todo');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/todos/${id}`);
      
      if (response.data.success) {
        setTodos(todos.filter(todo => todo.id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting todo:', err);
      setError(err.response?.data?.error || 'Failed to delete todo');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
        <CheckCircle className="w-6 h-6 text-blue-500" />
        Top TODO List
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-3 border border-gray-700 rounded-l-lg bg-gray-900 text-white focus:outline-none focus:border-blue-500"
          placeholder="Add new todo"
        />
        <button 
          onClick={addTodo} 
          className="px-4 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors font-medium border border-blue-500"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <ul className="space-y-2">
        {todos.length === 0 ? (
          <li className="text-gray-500 text-center py-8">
            No todos yet. Add your first task!
          </li>
        ) : (
          todos.map((todo) => (
            <li key={todo.id} className="flex items-center p-3 bg-gray-900 rounded-lg hover:bg-gray-700 border border-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
                className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span 
                className={`flex-1 ${
                  todo.completed ? 'line-through text-gray-500' : 'text-white'
                }`}
              >
                {todo.content}
              </span>
              <button 
                onClick={() => deleteTodo(todo.id)} 
                className="ml-2 text-red-400 hover:text-red-300 transition-colors px-2"
                title="Delete todo"
              >
                <X className="w-5 h-5" />
              </button>
            </li>
          ))
        )}
      </ul>

      {todos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between text-sm text-gray-400">
            <span>
              Total: <strong className="text-white">{todos.length}</strong>
            </span>
            <span>
              Completed: <strong className="text-white">{todos.filter(t => t.completed).length}</strong>
            </span>
            <span>
              Remaining: <strong className="text-white">{todos.filter(t => !t.completed).length}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;
