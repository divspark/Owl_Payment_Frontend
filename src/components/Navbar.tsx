import { Link, useLocation } from 'react-router-dom'

export function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <span className="nav-logo">⚡</span> PaddleStore
      </Link>
      <div className="nav-links">
        <Link to="/" className={pathname === '/' ? 'nav-link active' : 'nav-link'}>
          Products
        </Link>
      </div>
    </nav>
  )
}
