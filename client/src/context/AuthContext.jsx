import { useReducer } from 'react'
import AuthContext from './authContext'

const initialState = {
  user: JSON.parse(localStorage.getItem('campusfind_user') || 'null'),
  token: localStorage.getItem('campusfind_token'),
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN': {
      localStorage.setItem('campusfind_user', JSON.stringify(action.payload.user))
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
  const [state, dispatch] = useReducer(authReducer, initialState)

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
