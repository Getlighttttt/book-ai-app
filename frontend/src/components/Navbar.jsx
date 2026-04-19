import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/result', label: 'Result' },
  { to: '/history', label: 'History' },
]

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-content container">
        <NavLink to="/" className="brand">
          AI Book Insight
        </NavLink>
        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
