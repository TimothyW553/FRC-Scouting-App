import React from "react";
import { NavLink } from "react-router-dom";

/*
 * Signed out specific links
 * Includes: signup and login links
 */
const SignedOutLinks = () => {
  return (
    <div>
      <ul className="right">
        <li><NavLink to="/signup">Signup</NavLink></li>
        <li><NavLink to="/signin">Login</NavLink></li>
      </ul>
    </div>
  );
};

export default SignedOutLinks;
