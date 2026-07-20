import { useState, useEffect } from 'react';
import './AdminPanel.css';

function StatisticsCards({ stats }) {
    return (
        <div className="statistics-cards">
            {stats.map(stat => (
                <div key={stat.id} className="card">
                    <div className="card-icon">{stat.icon}</div>
                    <h3 className="card-title">{stat.title}</h3>
                    <p className="card-value">{stat.value}</p>
                </div>
            ))}
        </div>
    );
}

function AdminTable({ users, onEdit, onDelete }) {
    return (
        <div className="admin-table">
            <h3>User Management</h3>
            <div className="admin-table-scroll">
                <table>
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

function MatchLogs({ logs }) {
    return (
        <div className="match-logs">
            <h3>Recent Activity Logs</h3>
            <div className="logs-container">
                <table className="logs-table">
                    <thead>
                        <tr>
                            <th className="log-date-header">Date</th>
                            <th className="log-name-header">Name</th>
                            <th className="log-action-header">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="no-logs">No recent activity</td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} className="log-entry">
                                    <td className="log-date">{log.timestamp}</td>
                                    <td className="log-name">{log.adminName}</td>
                                    <td className="log-action-text">{log.action}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AdminPanel() {
    const [users, setUsers] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Suspended' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Moderator', status: 'Active' }
    ]);

    const [logs, setLogs] = useState([]);

    const [stats, setStats] = useState([
        { id: 1, title: 'Total Users', value: '4', icon: '👥' },
        { id: 2, title: 'Active Listings', value: '12', icon: '📦' },
        { id: 3, title: 'Total Matches', value: '89', icon: '🤝' },
        { id: 4, title: 'Pending Approvals', value: '3', icon: '⏳' }
    ]);

    const [editingUser, setEditingUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [previousUserData, setPreviousUserData] = useState(null);

    // Get the current admin name (you can get this from your auth context)
    const adminName = 'Admin'; // This should come from your auth context

    useEffect(() => {
        console.log('Admin panel loaded');
    }, []);

    const handleDelete = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            const deletedUser = users.find(user => user.id === userId);
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            addLog(`${deletedUser.name} was deleted`);
            updateStats('Total Users', -1);
            alert('User deleted successfully!');
        }
    };

    const handleEdit = (userId) => {
        const user = users.find(u => u.id === userId);
        setPreviousUserData({ ...user });
        setEditingUser({ ...user });
        setShowModal(true);
    };

    const handleSaveEdit = () => {
        if (!editingUser || !previousUserData) return;

        // Check what changed
        const changes = [];
        
        if (editingUser.role !== previousUserData.role) {
            changes.push(`role is set to ${editingUser.role}`);
        }
        
        if (editingUser.status !== previousUserData.status) {
            changes.push(`status is set to ${editingUser.status}`);
        }

        if (editingUser.name !== previousUserData.name) {
            changes.push(`name changed to ${editingUser.name}`);
        }

        if (editingUser.email !== previousUserData.email) {
            changes.push(`email changed to ${editingUser.email}`);
        }

        // Update users
        const updatedUsers = users.map(u =>
            u.id === editingUser.id ? editingUser : u
        );
        setUsers(updatedUsers);

        // Add log entries for each change
        if (changes.length > 0) {
            changes.forEach(change => {
                addLog(`${editingUser.name}'s ${change}`);
            });
        } else {
            addLog(`${editingUser.name}'s profile was updated (no changes)`);
        }

        setShowModal(false);
        setEditingUser(null);
        setPreviousUserData(null);
        alert('User updated successfully!');
    };

    const addLog = (action) => {
        const newLog = {
            id: logs.length + 1,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            adminName: adminName, // This will always show "Admin"
            action: action
        };
        setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 9)]);
    };

    const updateStats = (statTitle, change) => {
        setStats(prevStats =>
            prevStats.map(stat =>
                stat.title === statTitle
                    ? { ...stat, value: String(parseInt(stat.value) + change) }
                    : stat
            )
        );
    };

    return (
        <div className="container">
            <div className="header-actions">
                <h2>Admin Panel</h2>
            </div>
            <p className="welcome-text">Welcome to the admin dashboard!</p>

            <StatisticsCards stats={stats} />
            <AdminTable
                users={users}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            <MatchLogs logs={logs} />

            {/* Edit Modal */}
            {showModal && editingUser && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit User</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Moderator">Moderator</option>
                                    <option value="User">User</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={editingUser.status}
                                    onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="save-btn" onClick={handleSaveEdit}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;
