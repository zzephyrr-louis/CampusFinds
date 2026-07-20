import { useEffect, useMemo, useState } from 'react'
import { FaCheckDouble } from 'react-icons/fa6'
import { useNotifications } from '../context/useNotifications'
import NotificationItem from '../components/notification/NotificationItem'
import PageHeader from '../components/ui/PageHeader'
import './Notifications.css'

function Notifications() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications()
  const [filter, setFilter] = useState('all')
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  useEffect(() => {
    document.title = 'Notifications | CampusFind'
  }, [])

  const visibleNotifications = useMemo(
    () => (filter === 'unread' ? notifications.filter((notification) => !notification.read) : notifications),
    [filter, notifications],
  )

  async function handleMarkAllAsRead() {
    setIsMarkingAll(true)
    await markAllAsRead()
    setIsMarkingAll(false)
  }

  return (
    <section className="notifications-page" aria-labelledby="notifications-title">
      <PageHeader
        eyebrow="Campus activity"
        title="Notifications"
        titleId="notifications-title"
        description="Keep track of item matches, claim updates, and important CampusFind activity."
        aside={(
          <div className="page-metric" aria-label={`${unreadCount} unread notifications`}>
            <strong>{unreadCount}</strong>
            <span>{unreadCount === 1 ? 'unread update' : 'unread updates'}</span>
          </div>
        )}
      />

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
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || isMarkingAll}
          >
            <FaCheckDouble aria-hidden="true" />
            {isMarkingAll ? 'Updating…' : 'Mark all as read'}
          </button>
        </div>

        <div className="notification-results" aria-live="polite">
          {isLoading ? (
            <div className="page-loading-state" role="status">Loading notifications&hellip;</div>
          ) : error ? (
            <div className="page-error-state" role="alert">
              <p>{error}</p>
              <button className="secondary-button" type="button" onClick={() => refreshNotifications()}>Try again</button>
            </div>
          ) : visibleNotifications.length === 0 ? (
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
