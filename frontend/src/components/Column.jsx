function Column({ title, icon, color, tasks, updateTaskStatus, deleteTask }) {
  const renderAvatar = (task) => {
    if (!task.assignee_name) {
      return (
        <span className="jira-avatar jira-avatar-empty" title="Unassigned">
          <span className="material-icons">person</span>
        </span>
      );
    }

    return (
      <span
        className="jira-avatar"
        style={{ backgroundColor: task.assignee_color || '#0052cc' }}
        title={`${task.assignee_name} - ${task.assignee_role || 'Assignee'}`}
      >
        {task.assignee_initials || task.assignee_name.slice(0, 2)}
      </span>
    );
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(String(dueDate).slice(0, 10));
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const isUpcoming = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(String(dueDate).slice(0, 10));
    due.setHours(0, 0, 0, 0);
    const daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return daysUntilDue > 0 && daysUntilDue <= 3;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(String(dateStr).slice(0, 10));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return '#dc3545';
      case 'Medium': return '#ff9f1a';
      case 'Low': return '#36b37e';
      default: return '#6c757d';
    }
  };

  return (
    <div className="card shadow-sm border-0 jira-column" style={{ minHeight: '650px', '--column-color': color }}>
      <div className="card-header bg-light border-bottom py-3">
        <div className="d-flex align-items-center justify-content-between gap-2">
          <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <span className="material-icons" style={{ fontSize: '20px', color }}>
              {icon}
            </span>
            {title}
          </h6>
          <span className="jira-column-count">{tasks.length}</span>
        </div>
      </div>

      <div className="card-body p-3" style={{ overflowY: 'auto', maxHeight: '600px' }}>
        {tasks.length === 0 ? (
          <div className="text-center text-muted py-5">
            <span className="material-icons" style={{ fontSize: '48px', color: '#ccc', display: 'block' }}>inbox</span>
            <p className="mb-0 mt-2 small">No tasks</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {tasks.map((task) => {
              const overdue = isOverdue(task.due_date);
              const upcoming = isUpcoming(task.due_date);
              return (
                <div 
                  className="card border-0 shadow-sm jira-task-card" 
                  key={task.id}
                  style={{ '--issue-color': color }}
                >
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                      <h6 className="card-title mb-0 text-break fw-500 text-dark" style={{ flex: 1 }}>{task.title}</h6>
                      {renderAvatar(task)}
                    </div>
                    
                    {task.description && (
                      <p className="card-text small text-muted mb-3 text-break">
                        {task.description}
                      </p>
                    )}

                    <div className="d-flex gap-2 mb-2 flex-wrap">
                      <span className="badge jira-issue-type">
                        <span className="material-icons" style={{ fontSize: '12px', marginRight: '4px' }}>task_alt</span>
                        Task
                      </span>
                      {task.due_date && (
                        <span 
                          className="badge" 
                          style={{ 
                            backgroundColor: overdue ? '#dc3545' : upcoming ? '#ff9f1a' : '#e3e8ef',
                            color: (overdue || upcoming) ? 'white' : '#626f86',
                            fontSize: '11px'
                          }}
                          title={overdue ? 'OVERDUE' : upcoming ? 'DUE SOON' : 'Due date'}
                        >
                          <span className="material-icons" style={{ fontSize: '12px', marginRight: '4px', verticalAlign: 'middle' }}>
                            calendar_today
                          </span>
                          {formatDate(task.due_date)}
                        </span>
                      )}
                      {task.priority && (
                        <span 
                          className="badge" 
                          style={{ 
                            backgroundColor: getPriorityColor(task.priority),
                            color: 'white',
                            fontSize: '11px'
                          }}
                        >
                          {task.priority}
                        </span>
                      )}
                    </div>

                    {task.assignee_name && (
                      <div className="jira-assignee-line mb-3">
                        {renderAvatar(task)}
                        <span>{task.assignee_name}</span>
                        <small>{task.assignee_role}</small>
                      </div>
                    )}

                    {(overdue || upcoming) && (
                      <div className="alert alert-warning mb-2 p-2" style={{ fontSize: '12px' }}>
                        <span className="material-icons" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>
                          {overdue ? 'error' : 'schedule'}
                        </span>
                        {overdue ? 'OVERDUE - Action needed!' : 'Due soon - Complete soon'}
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <select
                        className="form-select form-select-sm flex-grow-1"
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task, e.target.value)}
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Code Review">Code Review</option>
                        <option value="Done">Done</option>
                      </select>

                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                      >
                        <span className="material-icons" style={{ fontSize: '18px' }}>delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Column
