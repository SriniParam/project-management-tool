import { useEffect, useState } from "react";
import API from "../api";
import ProjectCard from "../components/Projectcard";

function Dashboard() {
  const [projects, setProjects] = useState([])
  const [projectName, setProjectName] = useState('')
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalTasks: 0,
  })

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects')
      const normalizedProjects = res.data.map((project) => ({
        ...project,
        total_tasks: Number(project.total_tasks) || 0,
        completed_tasks: Number(project.completed_tasks) || 0,
      }))

      setProjects(normalizedProjects)
      
      // Calculate stats
      let completed = 0
      let pending = 0
      let total = 0
      
      normalizedProjects.forEach(project => {
        completed += project.completed_tasks
        pending += project.total_tasks - project.completed_tasks
        total += project.total_tasks
      })
      
      setStats({
        totalProjects: normalizedProjects.length,
        completedTasks: completed,
        pendingTasks: pending,
        totalTasks: total,
      })
    } catch (error) {
      console.error('Error fetching projects:', error)
      alert('Failed to load projects')
    }
  }

  useEffect(() => {
    fetchProjects()

    const refreshVisibleDashboard = () => {
      if (document.visibilityState === 'visible') {
        fetchProjects()
      }
    }

    window.addEventListener('focus', fetchProjects)
    document.addEventListener('visibilitychange', refreshVisibleDashboard)

    return () => {
      window.removeEventListener('focus', fetchProjects)
      document.removeEventListener('visibilitychange', refreshVisibleDashboard)
    }
  }, [])

  const createProject = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name')
      return
    }

    try {
      await API.post('/projects', {
        name: projectName,
      })

      setProjectName('')
      await fetchProjects()
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project. Please try again.')
    }
  }

  const completionRate = stats.totalTasks === 0 ? 0 : Math.round((stats.completedTasks / stats.totalTasks) * 100)

  return (
    <div className="dashboard-container">
      <div className="container-fluid py-5">
        <div className="container-xl">
          <div className="jira-page-heading mb-4">
            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div>
                <p className="jira-breadcrumb mb-2">Projects / Dashboard</p>
                <h1 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                  <span className="material-icons" style={{ fontSize: '34px', color: '#0052cc' }}>dashboard</span>
                  Project dashboard
                </h1>
                <p className="text-muted mb-0 fs-6">Track delivery health, task progress, and active work.</p>
              </div>
              <button className="btn btn-outline-secondary btn-sm jira-soft-button" type="button">
                <span className="material-icons me-1">tune</span>
                View settings
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row g-3 mb-5">
            <div className="col-lg-3 col-md-6">
              <div className="stat-card stat-card-blue">
                <div className="stat-icon">
                  <span className="material-icons">folder</span>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.totalProjects}</h3>
                  <p className="stat-label">Total Projects</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stat-card stat-card-green">
                <div className="stat-icon">
                  <span className="material-icons">check_circle</span>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.completedTasks}</h3>
                  <p className="stat-label">Completed Tasks</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stat-card stat-card-orange">
                <div className="stat-icon">
                  <span className="material-icons">pending_actions</span>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.pendingTasks}</h3>
                  <p className="stat-label">Pending Tasks</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stat-card stat-card-purple">
                <div className="stat-icon">
                  <span className="material-icons">trending_up</span>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{completionRate}%</h3>
                  <p className="stat-label">Overall Progress</p>
                </div>
              </div>
            </div>
          </div>

          {/* Create Project Card */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="card shadow-sm border-0 create-project-card create-project-enhanced">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="material-icons" style={{ fontSize: '28px', color: '#0052cc' }}>add_box</span>
                    <h5 className="mb-0 fw-bold text-dark">Create project</h5>
                  </div>
                  <p className="text-muted small mb-3">Create a workspace for a team, client, or sprint.</p>
                  <div className="input-group input-group-lg">
                    <input
                      type="text"
                      className="form-control border-end-0"
                      placeholder="Enter project name..."
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && createProject()}
                    />
                    <button 
                      className="btn btn-primary px-4 fw-bold"
                      onClick={createProject}
                    >
                      <span className="material-icons me-2">add</span>
                      Create Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="mb-4">
            <h2 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
              <span className="material-icons" style={{ fontSize: '32px', color: '#0052cc' }}>folder_open</span>
              Your Projects
              <span className="badge bg-primary">{projects.length}</span>
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state-card">
              <div className="text-center py-5">
                <span className="material-icons empty-state-icon">inbox</span>
                <h5 className="mt-4 text-dark fw-bold">No Projects Yet</h5>
                <p className="text-muted">Create your first project to get started and boost your productivity!</p>
                <button 
                  className="btn btn-primary btn-lg mt-3"
                  onClick={() => document.querySelector('input[placeholder*="Enter project name"]')?.focus()}
                >
                  <span className="material-icons me-2">add</span>
                  Create First Project
                </button>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {projects.map((project) => (
                <div key={project.id} className="col-lg-4 col-md-6">
                  <ProjectCard
                    project={project}
                    refreshProjects={fetchProjects}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
