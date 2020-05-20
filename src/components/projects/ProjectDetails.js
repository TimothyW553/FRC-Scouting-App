import React from "react";
import { connect } from "react-redux";
import { firestoreConnect } from "react-redux-firebase";
import { compose } from "redux";
import { Redirect } from "react-router-dom";
import moment from "moment";

/*
 * This is a static component that displays the details of a match form
 */
const ProjectDetails = props => {
  const { project, auth } = props;
  /*
   * Checks if user is signed in, if not --> direct to "/signin"
   */
  if (!auth.uid) return <Redirect to="/signin" />;
  /*
   * If project exists and is loaded, display it
   */
  if (project) {
    return (
      /*
       * Displays robot details from firestore database
       */
      <div className="container section project-details">
        <div className="card z-depth-0">
          <div className="card-content">
            {/*
              * Display of details
              */}
            <span className="card-title">{project.team_num}</span>
            <p>Drive Train Speed: {project.drive_speed}</p>
            <p>Shooter Mechanism: {project.shooter_mech}</p>
            <p>Climbing Mechanism: {project.climb_mech}</p>
            <p>Spinner Mechanism: {project.spin_mech}</p>
            <p>Type of Play: {project.type}</p>
            <p>Additional Comments: {project.comments}</p>
          </div>
          <div className="card-action grey lighten-4 grey-text">
            {/*
              * Display who posted form
              */}
            <div>
              Posted by {project.authorFirstName} {project.authorLastName}
            </div>
              {/*
              * Display time created
              */}
            <div>{moment(project.createdAt.toDate()).calendar()}</div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="container center">
        <p>Loading project...</p>
      </div>
    );
  }
};

/*
 * map state to props with firestore database to be able to use
 * take id, projects, and project collections
 */
const mapStateToProps = (state, ownProps) => {
  const id = ownProps.match.params.id;
  const projects = state.firestore.data.projects;
  const project = projects ? projects[id] : null;
  return {
    project: project,
    auth: state.firebase.auth
  };
};

/*
 * compose method with firebase to create collection documents in database
 */
export default compose(
  connect(mapStateToProps),
  firestoreConnect([
    {
      collection: "projects"
    }
  ])
)(ProjectDetails);
