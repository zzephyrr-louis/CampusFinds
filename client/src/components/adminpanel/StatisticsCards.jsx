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

export default StatisticsCards;
