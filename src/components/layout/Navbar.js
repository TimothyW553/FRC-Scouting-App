import React from "react";
import SignedInLinks from "./SignedInLinks";
import SignedOutLinks from "./SignedOutLinks";
import { connect } from "react-redux";

/*
 * Navigation bar at top of app
 * Checks if user is logged in --> if not, display signed out specific links
 *                             --> if is, display signed in specific links
 */
const Navbar = props => {
  const { auth, profile } = props;
  const links = auth.uid ? (
    /*
     * signed in links
     */
    <SignedInLinks profile={profile} />
  ) : (
    /*
     * signout links
     */
    <SignedOutLinks />
  );

  /*
   * gray bar for navbar
   */
  return (
    <nav className="nav-wrapper grey darken-3">
      <div className="container">{links}</div>
    </nav>
  );
};

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth,
    profile: state.firebase.profile
  };
};

export default connect(mapStateToProps)(Navbar);
