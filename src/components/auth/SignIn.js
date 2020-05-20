// import neccessary libraries
import React, { Component } from "react";
import { connect } from "react-redux";
import { signIn } from "../../store/actions/authActions";
import { Redirect } from "react-router-dom";

// Login component for authentication 
class SignIn extends Component {
  // State of class
  // email and password
  state = {
    email: "",
    password: ""
  };
  // event handler for handling any changes
  handleChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };
  // event handler for handling the submission
  handleSubmit = e => {
    e.preventDefault();
    this.props.signIn(this.state);
  };
  /*
    Renders and returns signin page for users
    Input validation for text fields
    If successful -> bring them to home page '/'
    If unsuccessful -> return a blank page
  */
  render() {
    const { authError, auth } = this.props;
    if (auth.uid) return <Redirect to="/" />;
    return (
      <div className="container">
        <form className="white" onSubmit={this.handleSubmit}>
          <h5 className="grey-text text-darken-3">Sign In</h5>
          <div className="input-field">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" onChange={this.handleChange} />
          </div>
          <div className="input-field">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" onChange={this.handleChange} />
          </div>
          <div className="input-field">
            <button className="btn pink lighten-1 z-depth-0">Login</button>
            <div className="center red-text">
              {authError ? <p>{authError}</p> : null}
            </div>
          </div>
        </form>
      </div>
    );
  }
}

/* 
  allow this component to be usable in other compoenents
  connect it to an action receiver and reducer
*/
const mapStateToProps = state => {
  return {
    authError: state.auth.authError,
    auth: state.firebase.auth
  };
};

const mapDispatchToProps = dispatch => {
  return {
    signIn: creds => dispatch(signIn(creds))
  };
};

// export to allow for outside use
// use firebase connect for authentication
export default connect(mapStateToProps, mapDispatchToProps)(SignIn);
