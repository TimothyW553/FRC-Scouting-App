import React, { Component } from "react";
import { connect } from "react-redux";
import { createProject } from "../../store/actions/projectActions";
import { Redirect } from "react-router-dom";
import SortTB from "./SortTB";

/*
 * This is the main compoennt called TeamList that displays all the teams playing at an event in the overall table
 * It works with the SortTB class to display the table
 */
class TeamList extends Component {
  /*
   * Call supper with props parameter from Component class
   */
  constructor(props) {
    super(props);
  }

  /*
   * Debugging statement for uplifting state with project
   */
  that2 = this.props.that3;

  /*
   * Instance/State variables include: title of team and content within
   */
  state = {
    title: "",
    content: "",
    docs: null
  };

  /*
   * Event handler for any changes within the app --> updates corresponding state variable
   */
  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };


  /*
   * Event handler for submitting changes witihin the current state
   */
  handleSubmit = e => {
    e.preventDefault();
    this.props.createProject(this.state);
    this.props.history.push("/");
  };

  /*
   * Renders the overall table to user
   * Checks if user is signed in or not --> must be signed in, otherwise directs user to "/signin" page
   * Calls SortTB with uplifted state data
   */
  render() {
    const { auth } = this.props;
    if (!auth.uid) return <Redirect to="/signin" />;
    return (
      <div>
        <SortTB that={this} />
      </div>
    );
  }
}

/*
 * Connect with firebase authentication and project dispatch cration
 */
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

/*
 * Use firebase connect to map states and reducers/action handlers with TeamList class
 */
export default connect(mapStateToProps, mapDispatchToProps)(TeamList);
