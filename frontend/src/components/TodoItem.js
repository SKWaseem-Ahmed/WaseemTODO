import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Calendar, Tag } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

const priorityConfig = {
  high: { 
    class: 'priority-high', 
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    label: 'High'
  },
  medium: { 
    class: 'priority-medium', 
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    label: 'Medium'
  },
  low: { 
    class: 'priority-low', 
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    label: 'Low'
  }
};

const categoryColors = {
  general: 'bg-slate-100 text-slate-700 border-slate-200',
  work: 'bg-blue-100 text-blue-700 border-blue-200',
  personal: 'bg-purple-100 text-purple-700 border-purple-200',
  shopping: 'bg-pink-100 text-pink-700 border-pink-200',
  health: 'bg-green-100 text-green-700 border-green-200',
  learning: 'bg-orange-100 text-orange-700 border-orange-200'
};

export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const priority = priorityConfig[todo.priority] || priorityConfig.medium;
  const categoryColor = categoryColors[todo.category] || categoryColors.general;
  
  const getDueDateStatus = () => {
    if (!todo.due_date) return null;
    const dueDate = new Date(todo.due_date);
    if (todo.completed) return 'completed';
    if (isPast(dueDate) && !isToday(dueDate)) return 'overdue';
    if (isToday(dueDate)) return 'today';
    return 'upcoming';
  };
  
  const dueDateStatus = getDueDateStatus();
  
  const dueDateStyles = {
    overdue: 'text-rose-600 bg-rose-50',
    today: 'text-amber-600 bg-amber-50',
    upcoming: 'text-cyan-600 bg-cyan-50',
    completed: 'text-slate-400 bg-slate-50'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`todo-item group relative overflow-hidden glass-surface rounded-2xl p-5 ${priority.class} transition-all duration-300 hover:shadow-xl`}
      data-testid={`todo-item-${todo.id}`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="pt-1">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="custom-checkbox"
            data-testid={`todo-checkbox-${todo.id}`}
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 
            className={`font-semibold text-lg text-slate-800 leading-tight transition-all duration-300 ${
              todo.completed ? 'line-through text-slate-400' : ''
            }`}
            data-testid={`todo-title-${todo.id}`}
          >
            {todo.title}
          </h3>
          
          {todo.description && (
            <p 
              className={`mt-1.5 text-sm leading-relaxed transition-all duration-300 ${
                todo.completed ? 'text-slate-300 line-through' : 'text-slate-500'
              }`}
              data-testid={`todo-description-${todo.id}`}
            >
              {todo.description}
            </p>
          )}
          
          {/* Tags Row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Category Badge */}
            <span 
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${categoryColor}`}
              data-testid={`todo-category-${todo.id}`}
            >
              <Tag size={12} />
              {todo.category}
            </span>
            
            {/* Priority Badge */}
            <span 
              className={`px-2.5 py-1 rounded-full text-xs font-medium border ${priority.badge}`}
              data-testid={`todo-priority-${todo.id}`}
            >
              {priority.label}
            </span>
            
            {/* Due Date */}
            {todo.due_date && (
              <span 
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${dueDateStyles[dueDateStatus]}`}
                data-testid={`todo-due-date-${todo.id}`}
              >
                <Calendar size={12} />
                {format(new Date(todo.due_date), 'MMM d, yyyy')}
                {dueDateStatus === 'overdue' && ' (Overdue)'}
                {dueDateStatus === 'today' && ' (Today)'}
              </span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(todo)}
            className="p-2 rounded-xl glass-button text-cyan-700 hover:text-cyan-600"
            data-testid={`todo-edit-${todo.id}`}
            aria-label="Edit todo"
          >
            <Pencil size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(todo.id)}
            className="p-2 rounded-xl glass-button text-rose-600 hover:text-rose-500"
            data-testid={`todo-delete-${todo.id}`}
            aria-label="Delete todo"
          >
            <Trash2 size={18} />
          </motion.button>
        </div>
      </div>
      
      {/* Shimmer Effect on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
        <div className="absolute inset-0 animate-shimmer" />
      </div>
    </motion.div>
  );
}
