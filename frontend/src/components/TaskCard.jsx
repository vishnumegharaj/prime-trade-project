const statusBadge = {
  'todo': 'badge-todo',
  'in-progress': 'badge-in-progress',
  'done': 'badge-done',
};

const priorityBadge = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
};

const statusLabel = {
  'todo': 'Todo',
  'in-progress': 'In Progress',
  'done': 'Done',
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'done';

  return (
    <div
      className={`card p-4 group hover:border-slate-700/80 transition-all duration-200 
        ${task.status === 'done' ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3
          className={`font-semibold text-slate-100 text-sm leading-snug flex-1 
            ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}
        >
          {task.title}
        </h3>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-slate-500 text-xs mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={statusBadge[task.status]}>{statusLabel[task.status]}</span>
        <span className={priorityBadge[task.priority]}>{task.priority}</span>
        {isOverdue && (
          <span className="bg-red-500/10 text-red-400 text-xs font-medium px-2.5 py-1 rounded-lg border border-red-500/20">
            overdue
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        {task.dueDate ? (
          <span className={`text-xs font-mono ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
            Due {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        ) : (
          <span />
        )}

        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="text-xs bg-slate-800/60 border border-slate-700/60 text-slate-400 rounded-lg px-2 py-1 
            focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer"
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {task.owner?.name && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-800/60">
          <span className="text-xs text-slate-600">by {task.owner.name}</span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
