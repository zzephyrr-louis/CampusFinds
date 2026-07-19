import React from 'react';

function MatchLogs({ logs }) {
    return (
        <div className="match-logs-container">
            <h3>Recent Activity Logs</h3>
            <div className="logs-scroll">
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

export default MatchLogs;