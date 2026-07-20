import { useCallback, useEffect, useMemo, useState } from 'react'
import NotificationsContext from './notificationsContext'
import { useAuth } from './useAuth'
import api from '../services/api'
import { asArray, toNotificationView } from '../services/mappers'

export function NotificationsProvider({ children }) {
  const { isAuthenticated, isInitializing } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const loadNotifications = useCallback(async ({ signal } = {}) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await api.get('/notifications', { signal })
      const records = asArray(response.data, 'notifications')
      setNotifications(records.map(toNotificationView))
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setError(requestError.response?.data?.message || 'Unable to load notifications.')
      }
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isInitializing) return undefined
    if (!isAuthenticated) return undefined

    const controller = new AbortController()
    const loadTimer = window.setTimeout(
      () => loadNotifications({ signal: controller.signal }),
      0,
    )
    return () => {
      window.clearTimeout(loadTimer)
      controller.abort()
    }
  }, [isAuthenticated, isInitializing, loadNotifications])

  const visibleNotifications = useMemo(
    () => isAuthenticated ? notifications : [],
    [isAuthenticated, notifications],
  )
  const unreadCount = useMemo(
    () => visibleNotifications.filter((notification) => !notification.read).length,
    [visibleNotifications],
  )

  async function markAsRead(id) {
    const previous = notifications
    setNotifications((current) =>
      current.map((notification) =>
        String(notification.id) === String(id) ? { ...notification, read: true } : notification,
      ),
    )
    setError('')

    try {
      const response = await api.patch(`/notifications/${id}/read`, {})
      if (response.data) {
        const updated = toNotificationView(response.data.notification || response.data)
        setNotifications((current) =>
          current.map((notification) =>
            String(notification.id) === String(id) ? updated : notification,
          ),
        )
      }
    } catch (requestError) {
      setNotifications(previous)
      setError(requestError.response?.data?.message || 'Unable to mark that notification as read.')
    }
  }

  async function markAllAsRead() {
    const previous = notifications
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
    setError('')

    try {
      await api.patch('/notifications/read-all', {})
    } catch (requestError) {
      setNotifications(previous)
      setError(requestError.response?.data?.message || 'Unable to mark notifications as read.')
    }
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications: visibleNotifications,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        markAllAsRead,
        refreshNotifications: loadNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}
