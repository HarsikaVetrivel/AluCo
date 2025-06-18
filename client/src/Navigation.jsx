import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Schedule Meeting</Link></li>
        <li><Link to="/meetings">View Meetings</Link></li>
      </ul>
    </nav>
  );
}

export default Navigation;