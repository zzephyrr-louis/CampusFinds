import { Link } from 'react-router-dom'
import { FaCheck } from 'react-icons/fa6'
import { notificationTypeConfig, formatNotificationDate } from './notificationHelpers'

function NotificationItem({ notification, onMarkAsRead }) {
  const config = notificationTypeConfig[notification.type] || notificationTypeConfig.system
  const Icon = config.icon

  return (
    <li
      className={`notification-item notification-${config.tone} ${notification.read ? '' : 'is-unread'}`}
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
              onClick={() => onMarkAsRead(notification.id)}
            >
              View item
            </Link>
          )}
          {notification.claimId && (
            <Link className="text-link" to="/claims" onClick={() => onMarkAsRead(notification.id)}>
              View claim
            </Link>
          )}
        </div>
      </div>
      {!notification.read && (
        <button
          className="mark-read-button"
          type="button"
          onClick={() => onMarkAsRead(notification.id)}
          aria-label={`Mark "${notification.title}" as read`}
        >
          <FaCheck aria-hidden="true" />
        </button>
      )}
    </li>
  )
}

export default NotificationItem