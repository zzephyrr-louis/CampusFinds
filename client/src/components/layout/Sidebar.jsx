import { NavLink } from 'react-router-dom'
import { FaBoxArchive, FaXmark } from 'react-icons/fa6'
import { navigationItems } from '../../config/navigation'
import { useAuth } from '../../context/useAuth'

function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const visibleItems = navigationItems.filter((item) => !item.roles || item.roles.includes(user?.role))

  return (
    <aside className={`app-sidebar${isOpen ? ' is-open' : ''}`} id="app-sidebar" aria-label="Primary navigation">
      <div className="sidebar-header">
        <NavLink className="sidebar-logo" to="/dashboard" onClick={() => onClose()} aria-label="CampusFind dashboard">
          <span className="sidebar-logo-icon" aria-hidden="true">
            <FaBoxArchive />
          </span>
          <span>CampusFind</span>
        </NavLink>
        <button
          className="icon-button sidebar-close"
          type="button"
          onClick={() => onClose({ restoreFocus: true })}
          aria-label="Close menu"
        >
          <FaXmark aria-hidden="true" />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="CampusFind sections">
        {visibleItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => onClose()}
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <span className="preview-dot" aria-hidden="true" />
        <div>
          <strong>Campus records</strong>
          <span>Changes are saved securely</span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
