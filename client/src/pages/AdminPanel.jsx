import { useState, useEffect } from 'react';
import './AdminPanel.css';
import StatisticsCards from '../components/adminpanel/StatisticsCards';
import AdminTable from '../components/adminpanel/AdminTable';
import MatchLogs from '../components/adminpanel/MatchLogs';

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

    const adminName = 'Admin';

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

        const updatedUsers = users.map(u =>
            u.id === editingUser.id ? editingUser : u
        );
        setUsers(updatedUsers);

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
            adminName: adminName,
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
        <div className="admin-panel-wrapper">
            <div className="admin-panel-page">
                <div className="admin-panel-header">
                    <h2>Admin Panel</h2>
                    <p className="welcome-text">Welcome to the admin dashboard!</p>
                </div>

                <div className="admin-panel-content">
                    <StatisticsCards stats={stats} />
                    
                    <div className="admin-panel-tables">
                        <AdminTable
                            users={users}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                        <MatchLogs logs={logs} />
                    </div>
                </div>

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
        </div>
    );
}

export default AdminPanel;