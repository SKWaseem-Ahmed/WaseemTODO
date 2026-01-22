import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, CheckCircle2, Circle, ListTodo, Sparkles } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import TodoItem from './TodoItem';
import AddTodoModal from './AddTodoModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../components/ui/dropdown-menu';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState(['general', 'work', 'personal', 'shopping', 'health', 'learning']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
    fetchCategories();
  }, []);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API}/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddTodo = async (todoData) => {
    try {
      const response = await axios.post(`${API}/todos`, todoData);
      setTodos(prev => [response.data, ...prev]);
      toast.success('Task added successfully!');
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('Failed to add task');
    }
  };

  const handleUpdateTodo = async (todoData) => {
    try {
      const response = await axios.put(`${API}/todos/${todoData.id}`, todoData);
      setTodos(prev => prev.map(t => t.id === todoData.id ? response.data : t));
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error('Failed to update task');
    }
  };

  const handleToggleTodo = async (todoId) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    try {
      const response = await axios.put(`${API}/todos/${todoId}`, {
        completed: !todo.completed
      });
      setTodos(prev => prev.map(t => t.id === todoId ? response.data : t));
      toast.success(response.data.completed ? 'Task completed!' : 'Task reopened');
    } catch (error) {
      console.error('Error toggling todo:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await axios.delete(`${API}/todos/${todoId}`);
      setTodos(prev => prev.filter(t => t.id !== todoId));
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleEditClick = (todo) => {
    setEditTodo(todo);
    setIsModalOpen(true);
  };

  const handleSave = (todoData) => {
    if (editTodo) {
      handleUpdateTodo(todoData);
    } else {
      handleAddTodo(todoData);
    }
    setEditTodo(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditTodo(null);
  };

  // Filtered todos
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      // Search filter
      if (searchQuery && !todo.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !todo.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Category filter
      if (filterCategory !== 'all' && todo.category !== filterCategory) {
        return false;
      }
      // Priority filter
      if (filterPriority !== 'all' && todo.priority !== filterPriority) {
        return false;
      }
      // Status filter
      if (filterStatus === 'completed' && !todo.completed) return false;
      if (filterStatus === 'pending' && todo.completed) return false;
      
      return true;
    });
  }, [todos, searchQuery, filterCategory, filterPriority, filterStatus]);

  // Stats
  const stats = useMemo(() => ({
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length
  }), [todos]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterPriority('all');
    setFilterStatus('all');
  };

  const hasActiveFilters = searchQuery || filterCategory !== 'all' || filterPriority !== 'all' || filterStatus !== 'all';

  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-cyan-600" />
            <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">
              Glass Tasks
            </h1>
          </div>
          <p className="text-lg text-slate-500 font-medium">
            Organize your life with crystal clarity
          </p>
        </motion.header>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="glass-surface rounded-2xl p-5 text-center" data-testid="stats-total">
            <ListTodo className="w-6 h-6 mx-auto mb-2 text-cyan-600" />
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
            <p className="text-sm text-slate-500">Total Tasks</p>
          </div>
          <div className="glass-surface rounded-2xl p-5 text-center" data-testid="stats-completed">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
            <p className="text-3xl font-bold text-slate-800">{stats.completed}</p>
            <p className="text-sm text-slate-500">Completed</p>
          </div>
          <div className="glass-surface rounded-2xl p-5 text-center" data-testid="stats-pending">
            <Circle className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <p className="text-3xl font-bold text-slate-800">{stats.pending}</p>
            <p className="text-sm text-slate-500">Pending</p>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-surface-heavy rounded-3xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full glass-input rounded-xl pl-12 pr-4 py-3 text-slate-800"
                data-testid="search-input"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              {/* Category Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="glass-button rounded-xl px-4 py-3 flex items-center gap-2 text-slate-700"
                    data-testid="category-filter-btn"
                  >
                    <Filter size={18} />
                    <span className="hidden sm:inline">
                      {filterCategory === 'all' ? 'Category' : filterCategory}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-surface-heavy border-0 rounded-xl">
                  <DropdownMenuLabel>Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setFilterCategory('all')}
                    data-testid="filter-category-all"
                  >
                    All Categories
                  </DropdownMenuItem>
                  {categories.map(cat => (
                    <DropdownMenuItem 
                      key={cat} 
                      onClick={() => setFilterCategory(cat)}
                      data-testid={`filter-category-${cat}`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Priority Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="glass-button rounded-xl px-4 py-3 flex items-center gap-2 text-slate-700"
                    data-testid="priority-filter-btn"
                  >
                    <span className="hidden sm:inline">
                      {filterPriority === 'all' ? 'Priority' : filterPriority}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-surface-heavy border-0 rounded-xl">
                  <DropdownMenuLabel>Priority</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterPriority('all')} data-testid="filter-priority-all">
                    All Priorities
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority('high')} data-testid="filter-priority-high">
                    High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority('medium')} data-testid="filter-priority-medium">
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority('low')} data-testid="filter-priority-low">
                    Low
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="glass-button rounded-xl px-4 py-3 flex items-center gap-2 text-slate-700"
                    data-testid="status-filter-btn"
                  >
                    <span className="hidden sm:inline">
                      {filterStatus === 'all' ? 'Status' : filterStatus}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-surface-heavy border-0 rounded-xl">
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterStatus('all')} data-testid="filter-status-all">
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('pending')} data-testid="filter-status-pending">
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('completed')} data-testid="filter-status-completed">
                    Completed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 flex items-center justify-between"
            >
              <p className="text-sm text-slate-500">
                Showing {filteredTodos.length} of {todos.length} tasks
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                data-testid="clear-filters-btn"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Todo List */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
          data-testid="todo-list"
        >
          {isLoading ? (
            <div className="glass-surface rounded-2xl p-12 text-center">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500">Loading tasks...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-surface rounded-3xl p-12 text-center"
              data-testid="empty-state"
            >
              <ListTodo className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                {hasActiveFilters ? 'No matching tasks' : 'No tasks yet'}
              </h3>
              <p className="text-slate-500 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search query'
                  : 'Create your first task to get started'}
              </p>
              {!hasActiveFilters && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25"
                  data-testid="empty-add-btn"
                >
                  <Plus size={20} />
                  Add Your First Task
                </motion.button>
              )}
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Floating Add Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-2xl shadow-cyan-500/30 flex items-center justify-center z-40"
          data-testid="add-todo-btn"
        >
          <Plus size={28} />
        </motion.button>
      </div>

      {/* Add/Edit Modal */}
      <AddTodoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editTodo={editTodo}
        categories={categories}
      />
    </div>
  );
}
