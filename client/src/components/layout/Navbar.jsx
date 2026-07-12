import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FaArrowRightFromBracket,
  FaBars,
  FaBell,
  FaMagnifyingGlass,
  FaUser,
} from 'react-icons/fa6'
import { useAuth } from '../../context/useAuth'

function Navbar({ isMenuOpen, menuButtonRef, onMenuToggle }) {
  const [query, setQuery] = useState('')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleSearch(event) {
    event.preventDefault()
    const trimmedQuery = query.trim()
    navigate(trimmedQuery ? `/search-items?q=${encodeURIComponent(trimmedQuery)}` : '/search-items')
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const displayName = user?.fullname || 'CampusFind User'

  return (
    <header className="app-navbar">
      <div className="navbar-start">
        <button
          className="icon-button menu-toggle"
          ref={menuButtonRef}
          type="button"
          onClick={onMenuToggle}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-controls="app-sidebar"
          aria-expanded={isMenuOpen}
        >
          <FaBars aria-hidden="true" />
        </button>
        <div className="navbar-title">
          <span>Student Lost &amp; Found</span>
          <strong>CampusFind</strong>
        </div>
      </div>

      <form className="navbar-search" role="search" onSubmit={handleSearch}>
        <FaMagnifyingGlass aria-hidden="true" />
        <label className="sr-only" htmlFor="global-search">
          Search lost and found items
        </label>
        <input
          id="global-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search items or locations"
        />
        <button type="submit" aria-label="Search">Search</button>
      </form>

      <div className="navbar-actions">
        <Link className="icon-button notification-link" to="/notifications" aria-label="Notifications">
          <FaBell aria-hidden="true" />
          <span className="notification-dot" aria-hidden="true" />
        </Link>
        <Link className="profile-link" to="/account" aria-label={`Open ${displayName}'s account`}>
          <span className="profile-avatar" aria-hidden="true">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <span className="profile-copy">
            <strong>{displayName}</strong>
            <small>{user?.role || 'student'}</small>
          </span>
          <FaUser className="profile-link-icon" aria-hidden="true" />
        </Link>
        <button className="logout-button" type="button" onClick={handleLogout} aria-label="Log out">
          <FaArrowRightFromBracket aria-hidden="true" />
          <span>Log out</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
