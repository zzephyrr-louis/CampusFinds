import { useMemo, useState } from 'react'
import NotificationsContext from './notificationsContext'
import { mockNotifications } from '../data/notificationsData'

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  )

  function markAsRead(id) {
    setNotifications((current) =>
      current.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  function markAllAsRead() {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
  }

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationsContext.Provider>
  )
}