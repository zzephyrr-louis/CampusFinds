import {
  FaBell,
  FaBolt,
  FaBoxArchive,
  FaChartLine,
  FaClipboardCheck,
  FaClockRotateLeft,
  FaFileCirclePlus,
  FaHouse,
  FaListCheck,
  FaMagnifyingGlass,
  FaRightFromBracket,
  FaShieldHalved,
  FaTag,
  FaUserCheck,
} from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const dashboardStats = [
  { label: 'Open lost reports', value: '24', detail: '6 added this week' },
  { label: 'Found items waiting', value: '18', detail: '11 ready for review' },
  { label: 'Active claims', value: '9', detail: '3 need verification' },
]

const lostItems = [
  { item: 'Black wallet', place: 'Library second floor', time: 'Today' },
  { item: 'Blue tumbler', place: 'Science building', time: 'Yesterday' },
  { item: 'Student ID lace', place: 'Main gate', time: '2 days ago' },
]

const foundItems = [
  { item: 'Wireless earbuds', place: 'Cafeteria counter', status: 'Unclaimed' },
  { item: 'Calculus notebook', place: 'Room 204', status: 'Matched' },
  { item: 'Umbrella', place: 'Gym lobby', status: 'Stored' },
]

const teamDistribution = [
  {
    member: 'Member 1 - Louis Drey Castañeto',
    focus: 'Dashboard and overview experience',
    components: ['Dashboard Overview', 'Lost Items Summary', 'Found Items Summary', 'Quick Actions'],
  },
  {
    member: 'Member 2',
    focus: 'Item reporting and discovery',
    components: ['Report Lost Item', 'Report Found Item', 'Search Items', 'Item Details'],
  },
  {
    member: 'Member 3',
    focus: 'Claims, alerts, and administration',
    components: ['Submit Claim', 'Claim History', 'Notifications', 'Admin Panel'],
  },
]

const navLinks = [
  { label: 'Dashboard', icon: FaHouse, href: '#dashboard' },
  { label: 'Report Lost Item', icon: FaFileCirclePlus, href: '#report-lost' },
  { label: 'Report Found Item', icon: FaClipboardCheck, href: '#report-found' },
  { label: 'Search Items', icon: FaMagnifyingGlass, href: '#search-items' },
  { label: 'Claims', icon: FaUserCheck, href: '#claims' },
  { label: 'Notifications', icon: FaBell, href: '#notifications' },
  { label: 'Admin Panel', icon: FaShieldHalved, href: '#admin-panel' },
]

function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="dashboard-navbar">
      <div>
        <p className="brand-kicker">Student Lost & Found Management System</p>
        <h1>CampusFinds</h1>
      </div>
      <label className="dashboard-search">
        <FaMagnifyingGlass aria-hidden="true" />
        <input type="search" placeholder="Search reports, items, or claim IDs" />
      </label>
      <div className="profile-area">
        <div className="profile-avatar">{(user?.fullname || 'Student').charAt(0)}</div>
        <div>
          <strong>{user?.fullname || 'CampusFinds User'}</strong>
          <span>{user?.role || 'student'}</span>
        </div>
        <button className="logout-button" type="button" onClick={handleLogout}>
          <FaRightFromBracket aria-hidden="true" />
          Logout
        </button>
      </div>
    </header>
  )
}

function Sidebar() {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-logo">
        <FaBoxArchive aria-hidden="true" />
        <span>CampusFinds</span>
      </div>
      <nav aria-label="Dashboard navigation">
        {navLinks.map((link) => {
          const Icon = link.icon

          return (
            <a key={link.label} href={link.href}>
              <Icon aria-hidden="true" />
              {link.label}
            </a>
          )
        })}
      </nav>
    </aside>
  )
}

function DashboardOverview() {
  return (
    <section className="dashboard-card overview-card">
      <div className="section-heading">
        <FaChartLine aria-hidden="true" />
        <div>
          <p className="eyebrow">Component 1</p>
          <h2>Dashboard Overview</h2>
        </div>
      </div>
      <div className="stats-grid">
        {dashboardStats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function LostItemsSummary() {
  return (
    <section className="dashboard-card">
      <div className="section-heading">
        <FaTag aria-hidden="true" />
        <div>
          <p className="eyebrow">Component 2</p>
          <h2>Lost Items Summary</h2>
        </div>
      </div>
      <div className="item-list">
        {lostItems.map((item) => (
          <article key={item.item}>
            <strong>{item.item}</strong>
            <span>{item.place}</span>
            <small>{item.time}</small>
          </article>
        ))}
      </div>
    </section>
  )
}

function FoundItemsSummary() {
  return (
    <section className="dashboard-card">
      <div className="section-heading">
        <FaListCheck aria-hidden="true" />
        <div>
          <p className="eyebrow">Component 3</p>
          <h2>Found Items Summary</h2>
        </div>
      </div>
      <div className="item-list">
        {foundItems.map((item) => (
          <article key={item.item}>
            <strong>{item.item}</strong>
            <span>{item.place}</span>
            <small>{item.status}</small>
          </article>
        ))}
      </div>
    </section>
  )
}

function QuickActions() {
  return (
    <section className="dashboard-card">
      <div className="section-heading">
        <FaBolt aria-hidden="true" />
        <div>
          <p className="eyebrow">Component 4</p>
          <h2>Quick Actions</h2>
        </div>
      </div>
      <div className="quick-actions">
        <a href="#report-lost">Report lost item</a>
        <a href="#report-found">Report found item</a>
        <a href="#search-items">Search items</a>
        <a href="#claims">Review claims</a>
      </div>
    </section>
  )
}

function ReportLostItem() {
  return (
    <article id="report-lost" className="feature-panel">
      <h3>Report Lost Item</h3>
      <p>Student submits item name, last seen location, date, description, and contact details.</p>
    </article>
  )
}

function ReportFoundItem() {
  return (
    <article id="report-found" className="feature-panel">
      <h3>Report Found Item</h3>
      <p>Finder records the item condition, discovery location, storage area, and photo reference.</p>
    </article>
  )
}

function SearchItems() {
  return (
    <article id="search-items" className="feature-panel">
      <h3>Search Items</h3>
      <p>Students filter reports by category, location, date, status, and matching keywords.</p>
    </article>
  )
}

function ItemDetails() {
  return (
    <article className="feature-panel">
      <h3>Item Details</h3>
      <p>Shows a complete item profile with report history, claim status, and verification notes.</p>
    </article>
  )
}

function SubmitClaim() {
  return (
    <article id="claims" className="feature-panel">
      <h3>Submit Claim</h3>
      <p>Owner explains proof of ownership and submits supporting details for admin review.</p>
    </article>
  )
}

function ClaimHistory() {
  return (
    <article className="feature-panel">
      <h3>Claim History</h3>
      <p>Tracks submitted, approved, rejected, and completed claims in one organized timeline.</p>
    </article>
  )
}

function Notifications() {
  return (
    <article id="notifications" className="feature-panel">
      <h3>Notifications</h3>
      <p>Alerts students about possible matches, claim updates, and admin announcements.</p>
    </article>
  )
}

function AdminPanel() {
  return (
    <article id="admin-panel" className="feature-panel">
      <h3>Admin Panel</h3>
      <p>Admin verifies items, manages claims, updates report statuses, and monitors activity.</p>
    </article>
  )
}

function TeamDistribution() {
  return (
    <section className="team-section" aria-labelledby="team-title">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">12 main components</p>
          <h2 id="team-title">Team Distribution</h2>
        </div>
        <span>Navbar, Sidebar, Login, and Registration are not counted.</span>
      </div>
      <div className="team-grid">
        {teamDistribution.map((group) => (
          <article key={group.member} className="team-card">
            <h3>{group.member}</h3>
            <p>{group.focus}</p>
            <ol>
              {group.components.map((component) => (
                <li key={component}>{component}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  )
}

function Dashboard() {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar />
        <main className="dashboard-content" id="dashboard">
          <section className="dashboard-hero">
            <div>
              <p className="eyebrow">Member 1 dashboard scope</p>
              <h2>Student lost and found activity at a glance.</h2>
              <p>
                The dashboard highlights Louis Drey Castañeto's four assigned components and gives the team
                a clear view of the full CampusFinds feature division.
              </p>
            </div>
            <div className="hero-status">
              <FaClockRotateLeft aria-hidden="true" />
              <strong>Live review queue</strong>
              <span>27 reports need attention</span>
            </div>
          </section>

          <section className="member-dashboard-grid" aria-label="Member 1 dashboard components">
            <DashboardOverview />
            <LostItemsSummary />
            <FoundItemsSummary />
            <QuickActions />
          </section>

          <section className="feature-section" aria-label="Remaining main components">
            <ReportLostItem />
            <ReportFoundItem />
            <SearchItems />
            <ItemDetails />
            <SubmitClaim />
            <ClaimHistory />
            <Notifications />
            <AdminPanel />
          </section>

          <TeamDistribution />
        </main>
      </div>
    </div>
  )
}

export default Dashboard
