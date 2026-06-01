import { useNavigate } from 'react-router-dom'

function ProjectCard({ project, refreshProjects }) {
  const navigate = useNavigate()

  const total = Number(project.total_tasks) || 0
  const completed = Number(project.completed_tasks) || 0

  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

  const deleteProject = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      await fetch(`http://localhost:5000/api/projects/${project.id}`, {
        method: 'DELETE',
      })
      refreshProjects()
    }
  }

  return (
    <div className="card h-100 shadow-sm border-0 project-card-jira transition-all">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3 gap-3">
          <div className="d-flex align-items-start gap-2">
            <span className="project-icon-tile">
              <span className="material-icons">folder</span>
            </span>
            <div>
              <h5 className="card-title fw-bold text-dark mb-1">{project.name}</h5>
              <small className="text-muted">Company-managed software</small>
            </div>
          </div>
          <span className="material-icons text-muted" style={{ fontSize: '20px' }}>more_horiz</span>
        </div>
        
        <div className="mb-4 flex-grow-1">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted fw-500">Progress</small>
            <small className="jira-progress-pill">{progress}%</small>
          </div>
          <div className="progress" style={{ height: '6px' }}>
            <div 
              className="progress-bar bg-success" 
              role="progressbar" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="text-muted small mb-4">
          <div className="d-flex align-items-center gap-1 mb-1">
            <span className="material-icons" style={{ fontSize: '16px' }}>assignment</span>
            <span>{completed} of {total} tasks completed</span>
          </div>
        </div>

        <div className="d-flex gap-2 mt-auto">
          <button 
            className="btn btn-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2"
            onClick={() => navigate(`/board/${project.id}`)}
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>board</span>
            Open board
          </button>
          <button 
            className="btn btn-danger btn-sm"
            onClick={deleteProject}
            title="Delete project"
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
