import { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel() {
    return(<>
        <div className="container">
            <h2>Admin Panel</h2>
            <p>Welcome to the admin dashboard!</p>

            <div className="statisticsCards">
                <div className="cards">
                    <div className="card">
                        <h3>StatisticsCards</h3>
                    </div>
                    <div className="card">
                        <h3>StatisticsCards</h3>
                    </div>
                    <div className="card">
                        <h3>StatisticsCards</h3>
                    </div>
                </div>
            </div>

            <div className="adminTable">
                <h3>Admin   Table</h3>
            </div>

            <div className="matchLogs">
                <h3>Match Logs</h3>
            </div>
        </div>
    </>);
}

export default AdminPanel;