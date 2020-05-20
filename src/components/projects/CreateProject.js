import React, { Component } from "react";
import { connect } from "react-redux";
import { createProject } from "../../store/actions/projectActions";
import { Redirect } from "react-router-dom";

/*
 * This is the class component that allows users to create pit scouting forms
 */
class CreateProject extends Component {
  /*
   * State/instance variables which inlucde: 
   * team number, drive train speed, shooter mechanism, climbing mechanism, defence/offence/all type of robot and any additional comments
   */
  state = {
    team_num: "",
    drive_speed: "",
    shooter_mech: "",
    climb_mech: "",
    spin_mech: "",
    type: "",
    comments: ""
  };

  /*
   * Event handler for handling any changes within each section which updates the corresponding state
   */
  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  /*
   * Event handler for submitting the form --> pushes the state of form to firestore and directs user back to home back
   */
  handleSubmit = e => {
    e.preventDefault();
    this.props.createProject(this.state);
    this.props.history.push("/");
  };
  /*
   * Display of form
   * Only allows users that are logged in to use current page, otherwise directs user to "/signin" page
   */
  render() {
    const { auth } = this.props;
    if (!auth.uid) return <Redirect to="/signin" />;
    return (
      <div className="container">
        <form className="white" onSubmit={this.handleSubmit}>
          {/*
            * Text field for inputting team number
            */}
          <h5 className="grey-text text-darken-3">Pit Scouting Comments</h5>
          <div className="input-field">
            <input type="text" id="team_num" onChange={this.handleChange} />
            <label htmlFor="team_num">Team Number</label>
          </div>
          {/*
            * Text field for inputting drive train speed
            */}
          <div className="input-field">
            <input type="text" id="drive_speed" onChange={this.handleChange} />
            <label htmlFor="drive_speed">Drive Train Speed</label>
          </div>
          {/*
            * Text field for inputting robot shooter mechanism
            */}
          <div className="input-field">
            <input type="text" id="shooter_mech" onChange={this.handleChange} />
            <label htmlFor="shooter_mech">Shooter Mechanism</label>
          </div>
          {/*
            * Text field for inputting robot climbing mechanism
            */}
          <div className="input-field">
            <input type="text" id="climb_mech" onChange={this.handleChange} />
            <label htmlFor="climb_mech">Climbing Mechanism</label>
          </div>
          {/*
            * Text field for inputting robot spinner mechanism
            */}
          <div className="input-field">
            <input type="text" id="spin_mech" onChange={this.handleChange} />
            <label htmlFor="spin_mech">Spinner Mechanism</label>
          </div>
          {/*
            * Text field for inputting type of robot
            */}
          <div className="input-field">
            <input type="text" id="type" onChange={this.handleChange} />
            <label htmlFor="type">Defense, Offensive, or Both</label>
          </div>
          {/*
            * Text field for inputting any additional comments
            */}
          <div className="input-field">
            <textarea
              id="comments"
              className="materialize-textarea"
              onChange={this.handleChange}
            ></textarea>
            <label htmlFor="comments">Comments</label>
          </div>
          {/*
            * Button for submitting form and pushing to firestore database
            */}
          <div className="input-field">
            <button className="btn pink lighten-1">Create</button>
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createProject: project => dispatch(createProject(project))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateProject);
