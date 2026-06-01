function Navbar() {
  return (
    <nav className="navbar navbar-dark jira-navbar">
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center gap-3">
          <span className="jira-app-switcher" title="Apps">
            <span className="material-icons">apps</span>
          </span>
          <span className="navbar-brand mb-0 h1 fw-bold d-flex align-items-center gap-2">
            <span className="jira-logo-mark">
              <span className="material-icons">view_kanban</span>
            </span>
            <span>Project Manager</span>
          </span>
          <span className="jira-nav-link">Your work</span>
          <span className="jira-nav-link">Projects</span>
          <span className="jira-nav-link">Filters</span>
        </div>

        <div className="jira-top-actions">
          <div className="jira-search">
            <span className="material-icons">search</span>
            <span>Search</span>
          </div>
          <button className="btn btn-light btn-sm jira-create-top" type="button">
            <span className="material-icons">add</span>
            Create
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
