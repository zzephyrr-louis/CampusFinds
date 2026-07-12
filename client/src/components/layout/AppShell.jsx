import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef(null)

  const closeMenu = useCallback(({ restoreFocus = false } = {}) => {
    setIsMenuOpen(false)

    if (restoreFocus) {
      requestAnimationFrame(() => menuButtonRef.current?.focus())
    }
  }, [])

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape' && isMenuOpen) {
        closeMenu({ restoreFocus: true })
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeMenu, isMenuOpen])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Sidebar isOpen={isMenuOpen} onClose={closeMenu} />
      {isMenuOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          onClick={() => closeMenu({ restoreFocus: true })}
          aria-label="Close menu"
        />
      )}
      <div className="app-main">
        <Navbar
          isMenuOpen={isMenuOpen}
          menuButtonRef={menuButtonRef}
          onMenuToggle={() => setIsMenuOpen((current) => !current)}
        />
        <main className="app-content" id="main-content" tabIndex="-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell
