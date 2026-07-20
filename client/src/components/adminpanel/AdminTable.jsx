import { FaPen, FaTrashCan } from 'react-icons/fa6'
import StatusBadge from '../ui/StatusBadge'

function AdminTable({ users, currentUserId, onEdit, onDelete }) {
  return (
    <section className="admin-table-container" aria-labelledby="user-management-title">
      <div className="admin-section-heading">
        <div><h2 id="user-management-title">User management</h2><p>Review account identity and role access.</p></div>
        <span>{users.length} {users.length === 1 ? 'user' : 'users'}</span>
      </div>

      {users.length === 0 ? (
        <p className="admin-empty-state">No user accounts are available.</p>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead><tr><th scope="col">Student ID</th><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
            <tbody>
              {users.map((user) => {
                const isCurrentUser = String(user.id) === String(currentUserId)
                return (
                  <tr key={user.id}>
                    <td>{user.student_id || '—'}</td>
                    <td><strong>{user.name}</strong>{isCurrentUser && <small className="admin-current-user">You</small>}</td>
                    <td>{user.email}</td>
                    <td><span className={`admin-role-badge admin-role-${user.role}`}>{user.role}</span></td>
                    <td><StatusBadge status={user.status} /></td>
                    <td>
                      <div className="admin-row-actions">
                        <button className="admin-action-button admin-edit-button" type="button" onClick={() => onEdit(user.id)}><FaPen aria-hidden="true" /> Edit</button>
                        <button className="admin-action-button admin-delete-button" type="button" onClick={() => onDelete(user.id)} disabled={isCurrentUser} title={isCurrentUser ? 'You cannot delete your own account.' : undefined}><FaTrashCan aria-hidden="true" /> Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AdminTable
