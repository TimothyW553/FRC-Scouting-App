// import neccessary libraries
import React, { Component } from "react";
import { connect } from "react-redux";
import { createEvent } from "../../store/actions/teamActions";
import { Redirect } from "react-router-dom";

let fetch_teams = []; // iniitalize array for teams
let event = '2020onwat' // event id
/*
 *  Async function for grapping event information on teams
 */
const fetchAndLog = async() => {
  const response = await fetch(`https://www.thebluealliance.com/api/v3/event/${event}/teams`, { // link to api
    headers: {
      'X-TBA-Auth-Key': `rVSoi1uFgP4KkYnjXvjtFdakv662U7rCi3wtFZ1jwNcQTiphjrlveXAo6fYG7mt7` // authentication key for api
    }
  });
  const json_temp = await response.json(); // grap response for api and turn it into a json
  /*
   * For loop goes through json and adds it to the teams list
   */
  for(let i = 0; i < json_temp.length; i++) {
    fetch_teams.push(
      json_temp[i].team_number
    );
  }
}

class InitTeams extends Component {
  constructor(props) {
    super(props); // call super() with parent element with props as parameter
    /*
     * state for class as eventID and array of all the teams for event
     */ 
    this.state = {
      event_id: "",
      teams: []
    }
    fetchAndLog(); // clal async function fetchAndLog() to grab all teams
    this.state.teams = fetch_teams; // create instance variable for all teams
  }
  /*
   * Event handlers for any changes and submissions
   * handleChange --> updates state/instance variables
   * handleSubmit --> after submissions takes user back to home back ("/")
   */ 
  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };
  handleSubmit = e => {
    e.preventDefault();
    this.props.createEvent(this.state);
    console.log(this.state);
    console.log(this.state.teams);
    this.props.history.push("/");
  };
  /*
   * Render and returns page for configurations --> creating event for users to interact
   * text box for event ID
   * button for creating event and submission
   */
  render() {
    const { auth } = this.props;
    if (!auth.uid) return <Redirect to="/signin" />;
    return (
      <div className="container">
        <form className="white" onSubmit={this.handleSubmit}>
          <h5 className="grey-text text-darken-3">Create Teams For Event</h5>
          <div className="input-field">
            <input type="text" id="event_id" onChange={this.handleChange} />
            <label htmlFor="event_id">Event ID</label>
          </div>
          <div className="input-field">
            <button className="btn pink lighten-1">Create</button>
          </div>
        </form>
      </div>
    );
  }
}

/*
 * Allows submission form to be connected with firebase
 * Maps state to props in firebase
 * connects with actions and reducers
 */
const mapStateToProps = state => {
  return {
    auth: state.firebase.auth
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createEvent: project => dispatch(createEvent(project))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(InitTeams);
