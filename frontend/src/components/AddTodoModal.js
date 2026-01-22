import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Tag, Flag } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { format } from 'date-fns';

const priorities = [
  { value: 'high', label: 'High', color: 'bg-rose-500' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
  { value: 'low', label: 'Low', color: 'bg-emerald-500' }
];

export default function AddTodoModal({ isOpen, onClose, onSave, editTodo, categories }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editTodo) {
      setTitle(editTodo.title || '');
      setDescription(editTodo.description || '');
      setCategory(editTodo.category || 'general');
      setPriority(editTodo.priority || 'medium');
      setDueDate(editTodo.due_date ? new Date(editTodo.due_date) : null);
    } else {
      resetForm();
    }
  }, [editTodo, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('general');
    setPriority('medium');
    setDueDate(null);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const todoData = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      due_date: dueDate ? dueDate.toISOString().split('T')[0] : null
    };

    if (editTodo) {
      todoData.id = editTodo.id;
      todoData.completed = editTodo.completed;
    }

    onSave(todoData);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            data-testid="modal-backdrop"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="w-full max-w-lg glass-surface-heavy rounded-3xl p-8 shadow-2xl"
              data-testid="add-todo-modal"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  {editTodo ? 'Edit Task' : 'Add New Task'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 rounded-xl glass-button text-slate-600"
                  data-testid="modal-close-btn"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className={`w-full glass-input rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 ${
                      errors.title ? 'border-rose-400' : ''
                    }`}
                    data-testid="todo-title-input"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-rose-500">{errors.title}</p>
                  )}
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add some details..."
                    rows={3}
                    className="w-full glass-input rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 resize-none"
                    data-testid="todo-description-input"
                  />
                </div>

                {/* Category & Priority Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Tag size={14} className="inline mr-1" />
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full glass-input rounded-xl px-4 py-3 text-slate-800 cursor-pointer"
                      data-testid="todo-category-select"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Flag size={14} className="inline mr-1" />
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full glass-input rounded-xl px-4 py-3 text-slate-800 cursor-pointer"
                      data-testid="todo-priority-select"
                    >
                      {priorities.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <CalendarIcon size={14} className="inline mr-1" />
                    Due Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full glass-input rounded-xl px-4 py-3 text-left flex items-center justify-between"
                        data-testid="todo-due-date-trigger"
                      >
                        <span className={dueDate ? 'text-slate-800' : 'text-slate-400'}>
                          {dueDate ? format(dueDate, 'MMMM d, yyyy') : 'Select a date'}
                        </span>
                        <CalendarIcon size={18} className="text-slate-400" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 glass-surface-heavy rounded-2xl border-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                        data-testid="todo-calendar"
                      />
                    </PopoverContent>
                  </Popover>
                  {dueDate && (
                    <button
                      type="button"
                      onClick={() => setDueDate(null)}
                      className="mt-2 text-sm text-cyan-600 hover:text-cyan-700"
                      data-testid="clear-due-date"
                    >
                      Clear date
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-3 px-6 rounded-full glass-button text-slate-700 font-semibold"
                    data-testid="modal-cancel-btn"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 py-3 px-6 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-shadow"
                    data-testid="modal-save-btn"
                  >
                    {editTodo ? 'Update Task' : 'Add Task'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
