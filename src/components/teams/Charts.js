import React, { Component } from 'react';

/*
 * Global array for all teams and their data from blue alliance API
 */
let json = [];
/*
 * Async function that fetches data from blue alliance API
 */
const fetchAndLog = async() => {
  const response = await fetch(`https://www.thebluealliance.com/api/v3/event/2020onosh/teams`, {
    headers: {
      'X-TBA-Auth-Key': `rVSoi1uFgP4KkYnjXvjtFdakv662U7rCi3wtFZ1jwNcQTiphjrlveXAo6fYG7mt7`
    }
  });
  /*
   * temporary variable that takes in the response from the API
   * look through response and store the team number
   */
  const json_temp = await response.json();
  for(let i = 0; i < json_temp.length; i++) {
    json.push(json_temp[i].team_number);
  }
  console.log(json);
}
/*
 * Call fetchAndLog async function to initialize global json variable
 */
fetchAndLog();

/*
 * This is a class Charts component that displays the teams at the current event (teams page)
 */
class Charts extends Component {
  /*
   * Super constructor from Component class
   */
  constructor(props){
    super(props);
    /*
     * State/instance variables incldue array of the teams
     */
    this.state={
      list:[]
    }
  }    

  render() {
    /*
     * local variables for all buttons
     * loop through json and push team number into BUTTONS array
     */
    let BUTTONS=[];
    for(let i = 0; i < json.length; i++) {
      BUTTONS.push(json[i]);
    }
    let BUTTONS1=[];
    for(let i = 19; i <json.length; i++) {
      BUTTONS1.push(json[i]);
    }
    /*
     * debugger for team buttons (display)
     */
    return (
      <div>{console.log(this.state.dataele)}hi</div>
    );
  }
}

export default Charts;