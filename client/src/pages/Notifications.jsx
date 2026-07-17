import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaCircleCheck,
  FaCircleInfo,
  FaCircleXmark,
  FaClipboardCheck,
} from 'react-icons/fa6'
import { useNotifications } from '../context/useNotifications'

const typeConfig = {
  match: { icon: FaClipboardCheck, label: 'Possible match', tone: 'purple' },
  'claim-approved': { icon: FaCircleCheck, label: 'Claim update', tone: 'green' },
  'claim-rejected': { icon: FaCircleXmark, label: 'Claim update', tone: 'amber' },
  system: { icon: FaCircleInfo, label: 'CampusFind update', tone: 'blue' },
}

function formatNotificationDate(value) {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

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
      <div className="notifications-header">
        <div className="section-heading">
          <span className="section-icon" aria-hidden="true">
            <FaBell />
          </span>
          <div>
            <p className="eyebrow">Notifications</p>
            <h1 id="notifications-title">Stay updated</h1>
            <p className="section-description">
              Possible matches, claim decisions, and important CampusFind updates appear here.
            </p>
          </div>
        </div>
        <button
          className="secondary-button mark-all-button"
          type="button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <FaCheckDouble aria-hidden="true" />
          Mark all as read
        </button>
      </div>

      <div className="dashboard-card notifications-card">
        <div className="notification-filters" aria-label="Filter notifications">
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

        <div className="notification-results" aria-live="polite">
          {visibleNotifications.length === 0 ? (
            <p className="empty-state">
              {filter === 'unread' ? "You're all caught up. No unread notifications." : 'No notifications yet.'}
            </p>
          ) : (
            <ul className="notification-list">
              {visibleNotifications.map((notification) => {
                const config = typeConfig[notification.type] || typeConfig.system
                const Icon = config.icon

                return (
                  <li
                    key={notification.id}
                    className={`notification-item notification-${config.tone} ${
                      notification.read ? '' : 'is-unread'
                    }`}
                  >
                    <span className="notification-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <div className="notification-body">
                      <div className="notification-top">
                        <p className="notification-type">{config.label}</p>
                        <strong>{notification.title}</strong>
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-meta">
                        <time dateTime={notification.createdAt}>{formatNotificationDate(notification.createdAt)}</time>
                        {notification.itemId && (
                          <Link
                            className="text-link"
                            to={`/items/${notification.itemId}`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            View item
                          </Link>
                        )}
                        {notification.claimId && (
                          <Link className="text-link" to="/claims" onClick={() => markAsRead(notification.id)}>
                            View claim
                          </Link>
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        className="mark-read-button"
                        type="button"
                        onClick={() => markAsRead(notification.id)}
                        aria-label={`Mark "${notification.title}" as read`}
                      >
                        <FaCheck aria-hidden="true" />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

export default Notifications
