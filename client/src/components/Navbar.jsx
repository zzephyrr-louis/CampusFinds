import { Link } from 'react-router-dom'

function Navbar() {
    return(
        <header className='header-container'>
            <h1>CampusFinds</h1>
            <ul className="header-nav">
                <li><Link to="/admin">Admin Panel</Link></li>
            </ul>
        </header>
    );
}

export default Navbar;