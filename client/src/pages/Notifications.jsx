import { useEffect, useMemo, useState } from 'react'
import { FaCheckDouble } from 'react-icons/fa6'
import { useNotifications } from '../context/useNotifications'
import NotificationItem from '../components/notification/NotificationItem'
import './Notifications.css'

function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    document.title = 'Notifications | CampusFind'
  }, [])

  const visibleNotifications = useMemo(
    () => (filter === 'unread' ? notifications.filter((notification) => !notification.read) : notifications),
    [filter, notifications],
  )

  return (
    <section className="notifications-page" aria-labelledby="notifications-title">
      <h1 className="sr-only" id="notifications-title">
        Notifications
      </h1>

      <div className="notifications-card">
        <div className="notification-toolbar" aria-label="Filter notifications">
          <div className="notification-filters">
            <button
              type="button"
              aria-pressed={filter === 'all'}
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All
              <span className="filter-count">{notifications.length}</span>
            </button>
            <button
              type="button"
              aria-pressed={filter === 'unread'}
              className={filter === 'unread' ? 'active' : ''}
              onClick={() => setFilter('unread')}
            >
              Unread
              <span className="filter-count">{unreadCount}</span>
            </button>
          </div>

          <button
            className="mark-all-button"
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <FaCheckDouble aria-hidden="true" />
            Mark all as read
          </button>
        </div>

        <div className="notification-results" aria-live="polite">
          {visibleNotifications.length === 0 ? (
            <p className="empty-state">
              {filter === 'unread' ? "You're all caught up. No unread notifications." : 'No notifications yet.'}
            </p>
          ) : (
            <ul className="notification-list">
              {visibleNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} onMarkAsRead={markAsRead} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

export default Notifications