import { FaFlask } from 'react-icons/fa6'

function MockModeNotice() {
  if (import.meta.env.VITE_API_MODE !== 'mock') return null

  return (
    <div className="mock-notice" role="note">
      <FaFlask aria-hidden="true" />
      <div>
        <strong>Frontend preview</strong>
        <span>Use test information only. Mock mode does not securely verify passwords.</span>
      </div>
    </div>
  )
}

export default MockModeNotice
