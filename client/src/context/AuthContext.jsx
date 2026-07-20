import { useCallback, useEffect, useReducer } from 'react'
import AuthContext from './authContext'
import { readStoredJson, writeStoredJson } from '../utils/storage'
import api from '../services/api'

function createInitialState() {
  const user = readStoredJson('campusfind_user')
  const token = localStorage.getItem('campusfind_token')

  return {
    user: token ? user : null,
    token: token || null,
    isInitializing: Boolean(token),
  }
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN': {
      writeStoredJson('campusfind_user', action.payload.user)
      localStorage.setItem('campusfind_token', action.payload.token)

      return {
        user: action.payload.user,
        token: action.payload.token,
        isInitializing: false,
      }
    }
    case 'RESTORE': {
      writeStoredJson('campusfind_user', action.payload)
      return { ...state, user: action.payload, isInitializing: false }
    }
    case 'READY':
      return { ...state, isInitializing: false }
    case 'LOGOUT': {
      localStorage.removeItem('campusfind_user')
      localStorage.removeItem('campusfind_token')

      return {
        user: null,
        token: null,
        isInitializing: false,
      }
    }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, undefined, createInitialState)

  const login = useCallback((payload) => {
    dispatch({ type: 'LOGIN', payload })
  }, [])

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' })
  }, [])

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('campusfind_token')) {
      dispatch({ type: 'READY' })
      return null
    }

    const response = await api.get('/auth/me')
    const user = response.data?.user || response.data
    dispatch({ type: 'RESTORE', payload: user })
    return user
  }, [])

  useEffect(() => {
    function handleUnauthorized() {
      logout()
    }

    window.addEventListener('campusfind:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('campusfind:unauthorized', handleUnauthorized)
  }, [logout])

  useEffect(() => {
    if (!state.token) {
      dispatch({ type: 'READY' })
      return
    }

    let isActive = true
    refreshUser().catch(() => {
      if (isActive) logout()
    })

    return () => {
      isActive = false
    }
  }, [logout, refreshUser, state.token])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: Boolean(state.token),
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
