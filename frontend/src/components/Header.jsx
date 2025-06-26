import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="app-header">
      <nav>
        <ul>
          <li>
            <Link to="/">Welcome</Link>
          </li>
          <li>
            <Link to="/add">Add Mapping</Link>
          </li>
          <li>
            <Link to="/map">View Mappings</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
