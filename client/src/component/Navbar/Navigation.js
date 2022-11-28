import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav>
      <NavLink to="/" className="header">
        用户主页
      </NavLink>
      <ul
        className="navbar-links"
        style={{ width: "35%", transform: open ? "translateX(0px)" : "" }}
      >
        <li>
          <NavLink to="/Registration" activeClassName="nav-active">
            <i className="far fa-registered" /> 注册
          </NavLink>
        </li>
        <li>
          <NavLink to="/Voting" activeClassName="nav-active">
            <i className="fas fa-vote-yea" /> 投票
          </NavLink>
        </li>
        <li>
          <NavLink to="/Results" activeClassName="nav-active">
            <i className="fas fa-poll-h" /> 结果
          </NavLink>
        </li>
      </ul>
      <i onClick={() => setOpen(!open)} className="fas fa-bars burger-menu"></i>
    </nav>
  );
}
