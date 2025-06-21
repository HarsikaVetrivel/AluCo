import { Link } from 'react-router-dom';
const Navigation = () => {
  const role = localStorage.getItem("role");

  return (
    <nav>
      <Link to="/">Home</Link>
        <li><Link to="/">Schedule Meeting</Link></li>
        <li><Link to="/meetings">View Meetings</Link></li>
      <Link to="/scholarships">Scholarships</Link>
      {role === "alumni" && <Link to="/post-scholarship">Post Scholarship</Link>}
    </nav>
  );
};

export default Navigation;