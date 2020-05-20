// import neccessary components from other files and libraries
import React, { Component } from "react";
import ProjectList from "../projects/ProjectList";
import Notifications from "./Notifications";
import { connect } from "react-redux";
import { firestoreConnect } from "react-redux-firebase";
import { compose } from "redux";
import { Redirect } from "react-router-dom";

/*
 * Home back dashboard for submissions
 * Updates once submissions are made
 * Lists all notifications and expert scouting data
 */
class Dashboard extends Component {
  render() {
    /*
     * Maps projects, auth, and notifs to props
     */
    const { projects, auth, notifications } = this.props;
    if (!auth.uid) return <Redirect to="/signin" />; // check if user is logged in
                                                     // if they're not they get directed to "/signin" page
    // displays projects and notifications
    return (
      <div className="dashboard container">
        <div className="row">
          <div className="col s12 m6">
            <ProjectList projects={projects} />
          </div>
          <div className="col s12 m5 offset-m1">
            <Notifications notifications={notifications} />
          </div>
        </div>
      </div>
    );
  }
}

/* 
 * Map the state to props in firebase
 * projects include firbease projects in sorted order same for notifications
 */
const mapStateToProps = state => {
  // console.log(state);
  return {
    projects: state.firestore.ordered.projects,
    auth: state.firebase.auth,
    notifications: state.firestore.ordered.notifications
  };
};

/*
 * connects dashboard with firebase to read and write data
 * collection names in firebase are "projects" and "notifications"
 */
export default compose(
  connect(mapStateToProps),
  firestoreConnect([
    { collection: "projects", orderBy: ["createdAt", "desc"] },
    { collection: "notifications", limit: 3, orderBy: ["time", "desc"] }
  ])
)(Dashboard);
