import React from "react";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { signOut } from "../../store/actions/authActions";

/*
 * Signed in specific links
 * Include: home, pit scouting, match form, teams, signout button
 * Uses NavLink from ReactJS for redirection
 */
const SignedInLinks = props => {
  return (
    <div>
      <ul className="right">
        <li><NavLink to="/home">Home</NavLink></li>
        <li><NavLink to="/pit-scouting">Pits</NavLink></li>
        <li> <NavLink to="/form">Form</NavLink></li>
        <li><NavLink to="/teams">Teams</NavLink></li>
        <li><a onClick={props.signOut}>Log Out</a></li>
        <li><NavLink to="/" className="btn btn-floating pink lighten-1">{props.profile.initials}</NavLink></li>
      </ul>
    </div>
  );
};

const mapDispatchToProps = dispatch => {
  return {
    signOut: () => dispatch(signOut())
  };
};

export default connect(null, mapDispatchToProps)(SignedInLinks);
