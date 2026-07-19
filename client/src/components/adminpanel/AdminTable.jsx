import React from 'react';

function AdminTable({ users, onEdit, onDelete }) {
    return (
        <div className="admin-table-container">
            <h3>User Management</h3>
            <div className="admin-table-scroll">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge status-${user.status.toLowerCase()}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="action-btn edit-btn"
                                        onClick={() => onEdit(user.id)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => onDelete(user.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminTable;