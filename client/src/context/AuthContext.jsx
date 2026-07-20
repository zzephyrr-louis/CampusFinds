import { useReducer } from 'react'
import AuthContext from './authContext'
import { readStoredJson, writeStoredJson } from '../utils/storage'

function createInitialState() {
  const user = readStoredJson('campusfind_user')
  const token = localStorage.getItem('campusfind_token')

  return {
    user: user && token ? user : null,
    token: user && token ? token : null,
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
      }
    }
    case 'LOGOUT': {
      localStorage.removeItem('campusfind_user')
      localStorage.removeItem('campusfind_token')

      return {
        user: null,
        token: null,
      }
    }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, undefined, createInitialState)

  function login(payload) {
    dispatch({ type: 'LOGIN', payload })
  }

  function logout() {
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, isAuthenticated: Boolean(state.token), login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
