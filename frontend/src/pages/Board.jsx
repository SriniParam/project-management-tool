import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import Column from "../components/Column";

function Board() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [assigneeId, setAssigneeId] = useState('')
  const [assignees, setAssignees] = useState([])
  const [taskError, setTaskError] = useState('')

  const toDateInputValue = (value) => {
    if (!value) return null
    return String(value).slice(0, 10)
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === 'Done').length
  const inProgressTasks = tasks.filter((task) => task.status === 'In Progress').length
  const codeReviewTasks = tasks.filter((task) => task.status === 'Code Review').length

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/${id}`)
      setTasks(res.data)
      setTaskError('')
    } catch (error) {
      console.error('Error fetching tasks:', error.response?.data || error.message)
      setTaskError('Unable to load tasks. Please check that the backend is running.')
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [id])

  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        const res = await API.get('/assignees')
        setAssignees(res.data)
      } catch (error) {
        console.error('Error fetching assignees:', error.response?.data || error.message)
        setTaskError('Unable to load assignees. Please check that the backend is running.')
      }
    }

    fetchAssignees()
  }, [])

  const createTask = async () => {
    if (!title.trim()) {
      setTaskError('Task title is required')
      return
    }

    try {
      await API.post('/tasks', {
        title,
        description,
        due_date: dueDate || null,
        priority,
        assignee_id: assigneeId || null,
        status: 'Todo',
        project_id: id,
      })

      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('Medium')
      setAssigneeId('')
      setTaskError('')

      await fetchTasks()
    } catch (error) {
      console.error('Error creating task:', error.response?.data || error.message)
      setTaskError('Unable to create task. Please check the backend and database schema.')
    }
  }

  const updateTaskStatus = async (task, status) => {
    try {
      await API.put(`/tasks/${task.id}`, {
        title: task.title,
        description: task.description,
        status,
        due_date: toDateInputValue(task.due_date),
        priority: task.priority,
        assignee_id: task.assignee_id,
      })

      setTaskError('')
      await fetchTasks()
    } catch (error) {
      console.error('Error updating task status:', error.response?.data || error.message)
      setTaskError('Unable to update task status.')
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`)
      setTaskError('')
      await fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error.response?.data || error.message)
      setTaskError('Unable to delete task.')
    }
  }

  return (
    <div className="board-container">
      <div className="jira-scrum-shell">
        <aside className="jira-project-sidebar">
          <div className="jira-project-identity">
            <div className="jira-project-rocket">
              <span className="material-icons">rocket_launch</span>
            </div>
            <div>
              <h6>Teams in Space</h6>
              <small>Software project</small>
            </div>
          </div>

          <nav className="jira-side-nav">
            <button className="active" type="button">
              <span className="material-icons">view_kanban</span>
              Backlog
            </button>
            <button type="button">
              <span className="material-icons">directions_run</span>
              Active sprints
            </button>
            <button type="button">
              <span className="material-icons">rocket_launch</span>
              Releases
            </button>
            <button type="button">
              <span className="material-icons">analytics</span>
              Reports
            </button>
            <button type="button">
              <span className="material-icons">error_outline</span>
              Issues
            </button>
            <button type="button">
              <span className="material-icons">extension</span>
              Components
            </button>
          </nav>

          <div className="jira-project-shortcuts">
            <p>Project shortcuts</p>
            <a>Teams Chat Room</a>
            <a>Project Page</a>
            <a>Orbitify Playlist</a>
            <a>Hyperspeed Repo</a>
            <button type="button">+ Add item</button>
          </div>
        </aside>

        <main className="jira-scrum-main">
          <div className="jira-board-header d-flex align-items-center justify-content-between mb-4 gap-3 flex-wrap">
            <div className="d-flex align-items-center gap-3">
              <button 
                className="btn btn-light border-0 p-0 d-flex align-items-center justify-content-center"
                onClick={() => navigate('/')}
                style={{ width: '40px', height: '40px' }}
                title="Back to projects"
              >
                <span className="material-icons">arrow_back</span>
              </button>
              <div>
                <h2 className="mb-1 fw-semibold text-dark">Scrum Board</h2>
                <p className="text-muted mb-0 small">
                  <span>Switch sprint</span>
                  <span className="material-icons align-middle" style={{ fontSize: '14px' }}>arrow_drop_down</span>
                </p>
              </div>
            </div>
            <div className="jira-board-metrics">
              <span><strong>{totalTasks}</strong> issues</span>
              <span><strong>{inProgressTasks}</strong> active</span>
              <span><strong>{codeReviewTasks}</strong> review</span>
              <span><strong>{completedTasks}</strong> done</span>
            </div>
          </div>

          <div className="jira-board-toolbar mb-4">
            <span className="jira-quick-filter-label">Quick filters:</span>
            <div className="jira-filter-chip active">
              Product
            </div>
            <div className="jira-filter-chip">
              UI
            </div>
            <div className="jira-filter-chip">
              Server
            </div>
            <div className="jira-filter-chip">
              My issues
            </div>
            <div className="jira-filter-chip">
              Recently updated
            </div>
            <div className="jira-avatar-stack">
              {assignees.slice(0, 4).map((assignee) => (
                <span
                  key={assignee.id}
                  className="jira-avatar"
                  style={{ backgroundColor: assignee.avatar_color }}
                  title={`${assignee.name} - ${assignee.role}`}
                >
                  {assignee.avatar_initials}
                </span>
              ))}
            </div>
          </div>

          <div className="card shadow-sm border-0 mb-4 create-task-card jira-create-issue">
            <div className="card-body p-3">
              <h6 className="card-subtitle mb-3 fw-bold text-muted d-flex align-items-center gap-2">
                <span className="material-icons" style={{ fontSize: '20px' }}>add_task</span>
                Create Issue
              </h6>
              <div className="row g-3">
                {taskError && (
                  <div className="col-12">
                    <div className="alert alert-danger mb-0 py-2">{taskError}</div>
                  </div>
                )}
                <div className="col-lg-3 col-md-6">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Issue summary..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createTask()}
                  />
                </div>
                <div className="col-lg-3 col-md-6">
                  <textarea
                    className="form-control form-control-lg"
                    placeholder="Description"
                    rows="1"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="col-lg-2 col-md-4">
                  <input
                    type="date"
                    className="form-control form-control-lg"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="col-lg-1 col-md-4">
                  <select 
                    className="form-select form-select-lg"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Med</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="col-lg-2 col-md-4">
                  <select
                    className="form-select form-select-lg"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    title="Assignee"
                  >
                    <option value="">Unassigned</option>
                    {assignees.map((assignee) => (
                      <option key={assignee.id} value={assignee.id}>
                        {assignee.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-1 col-md-12">
                  <button 
                    onClick={createTask}
                    className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center"
                    title="Create issue"
                  >
                    <span className="material-icons">add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="jira-scrum-board-grid">
            <div>
              <Column
                title="To Do"
                icon="assignment"
                color="#ff9f1a"
                tasks={tasks.filter((task) => task.status === 'Todo')}
                updateTaskStatus={updateTaskStatus}
                deleteTask={deleteTask}
              />
            </div>

            <div>
              <Column
                title="In Progress"
                icon="hourglass_top"
                color="#0052cc"
                tasks={tasks.filter((task) => task.status === 'In Progress')}
                updateTaskStatus={updateTaskStatus}
                deleteTask={deleteTask}
              />
            </div>

            <div>
              <Column
                title="Code Review"
                icon="rate_review"
                color="#6554c0"
                tasks={tasks.filter((task) => task.status === 'Code Review')}
                updateTaskStatus={updateTaskStatus}
                deleteTask={deleteTask}
              />
            </div>

            <div>
              <Column
                title="Done"
                icon="check_circle"
                color="#36b37e"
                tasks={tasks.filter((task) => task.status === 'Done')}
                updateTaskStatus={updateTaskStatus}
                deleteTask={deleteTask}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Board
