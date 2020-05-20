import React, { Component } from "react";
import { connect } from "react-redux";
import { firestoreConnect } from "react-redux-firebase";
import { compose } from "redux";
import Chart from "react-google-charts";

/*
 * constants that store images for field, auto circles(blue), and teleop circles(red)
 */
const field = "./field.png";
const circlered = "./circlered.png";
const circleblue = "./circleblue.png";

/*
 * Async function that fetches data from blue alliance API
 */
let json = [];
const fetchAndLog = async () => {
  const response = await fetch(
    `https://www.thebluealliance.com/api/v3/event/2020onosh/teams`,
    {
      headers: {
        "X-TBA-Auth-Key": `rVSoi1uFgP4KkYnjXvjtFdakv662U7rCi3wtFZ1jwNcQTiphjrlveXAo6fYG7mt7`
      }
    }
  );
  /*
   * temporary variable that takes in the response from the API
   * look through response and store the team number
   */
  const json_temp = await response.json();
  for (let i = 0; i < json_temp.length; i++) {
    json.push(json_temp[i].team_number);
  }
};

/*
 * Call fetchAndLog async function to initialize global json variable
 */
fetchAndLog();

/*
 * insert 99999 (placeholder) to front of array to 1 index array
 */
if (window.location.href.substring(7, 16) == "localhost") {
  json.unshift(99999);
}

/*
 * Teams class component for displaying teams and analytics
 */
class Teams extends Component {
  /*
   * constructors super with props as parameters from components
   */
  constructor(props) {
    super(props);
    /*
     * state/instance variables include: array of all charts currently being shown and a boolean variable for refresh checking
     */
    this.state = { charts_shown: [], refresh: false };
  }

  /*
   * display all buttons for teams dynamically by mapping each dimension of json to a variable
   */
  buttons = json.map(x => {
    try {
      return (
        /*
         * button styling with name of team
         *   - width: 75 pixels
         *   - height: 50 pixels
         *   - colour: green
         */
        <button
          key={x}
          style={{
            width: "75px",
            height: "50px",
            background: "green"
          }}
          /*
           * Event handling:
           *    When user clicks on button, a copy of the team data is displayed 
           */
          onClick={() => {
            let chartscopy = [...this.state.charts_shown];
            if (chartscopy.includes(x)) {
              /*
               * Displays items of team data layer by layer
               * Check if amount of data is sufficient
               */
              for (let item = 0; item < chartscopy.length; item++) {
                if (chartscopy[item] == x) {
                  chartscopy.splice(item, 1);
                  break;
                }
              }
            } else if (chartscopy.length < 3) {
              chartscopy.push(x);
            }
            this.setState({ charts_shown: chartscopy });
          }}
        >
          {x}
        </button>
      );
    } catch (err) {
      /*
       * Error catching --> if an error occurs when trying to display analytics, print to the console the error
       */
      console.log(err);
      return null;
    }
  });

  render() {
    /*
     * Using React lifting state up as a way to retreive data from upper components
     * take rawdata and json formatted data
     */
    let that = this.props.appthat;
    let rawData = that.state.rawData;
    let jsonData = that.state.json;

    /*
     * Refresh function that checks if current page is a refresh (updated data)
     */
    let refresh = function() {
      this.setState({ refresh: !this.state.refresh });
    };

    /*
     * We first first if the current data (both raw and json formatted) is able to be displayed and are not null
     */
    if (rawData && jsonData) {
      /*
       * We then create arrays for all the charts to be displayed
       * and an array for all maps to be displayed
       */
      let charts = [];
      let allmaps = [];
      /*
       * Next, we go through all the data that needs to be displayed
       */
      for (let team = 0; team < this.state.charts_shown.length; team++) {
        charts.push([]);
        /*
         * We create a 2d array for autonomous data
         */
        let data1 = [["Match", "Upper", "Lower", "Missed"]];
        for (let i = 0; i < rawData.length; i++) {
          if (rawData[i].team_num == this.state.charts_shown[team]) {
            let rawDatai = rawData[i];
            /*
             * We loop through the data we need to display and we push it into the array for autonomous
             * The data is formatted to fit the display of a table
             */
            data1.push([
              "Match " + rawDatai.match_num,
              +rawDatai["top"],
              +rawDatai["bot"],
              +rawDatai["miss"]
            ]);
          }
        }

        /*
         * Same thing for teleop period, we loop through the data and push each data field into the array
         */
        let data2 = [["Match", "Upper", "Lower", "Missed"]];
        for (let i = 0; i < rawData.length; i++) {
          if (rawData[i].team_num === this.state.charts_shown[team]) {
            let rawDatai = rawData[i];
            data2.push([
              "Match " + rawDatai.match_num,
              +rawDatai["tele_top"],
              +rawDatai["tele_bot"],
              +rawDatai["tele_miss"]
            ]);
          }
        }

        /*
         * Loop through data and push it into an array for different times (cycle, defence, climb)
         */
        let data3 = [["Match", "Cycle", "Defence", "Climb"]];
        for (let i = 0; i < rawData.length; i++) {
          if (rawData[i].team_num == this.state.charts_shown[team]) {
            let rawDatai = rawData[i];
            data3.push([
              "Match " + rawDatai.match_num,
              +rawDatai["average_cycle_time"],
              +rawDatai["defence_time"],
              +rawDatai["climb_time"]
            ]);
          }
        }

        /*
         * Formatting for overall data within teams page
         */
        let overall = [ [ "Stat", "Teleop Cycle Time", "Auto Cycle Time", "Auto Balls Upper", "Auto Balls Lower", "Auto Balls Missed", "Teleop Balls Upper", "Teleop Balls Lower", "Teleop Balls Missed", "Climb Time", "Defence", "Stage 2 Prob", "Stage 3 Prob", "Climb Prob." ]
        ];
        /*
         * Loop through json data and push corresponding data to overall 2d array
         */
        for (let i = 0; i < jsonData.length; i++) {
          if (jsonData[i].TeamNumber === this.state.charts_shown[team]) {
            let jsonDatai = jsonData[i];
            overall.push([ "Team " + jsonDatai.team_num, +jsonDatai["Tele Cycle Time"], +jsonDatai["Auto Cycle Time"], +jsonDatai["Auto Balls Upper"], +jsonDatai["Auto Balls Lower"], +jsonDatai["Auto Balls Missed"], +jsonDatai["Teleop Balls Upper"], +jsonDatai["Teleop Balls Lower"], +jsonDatai["Teleop Balls Missed"], +jsonDatai["Climb Time"], +jsonDatai["Defence Time"], +jsonDatai["Stage 2 Prob."], +jsonDatai["Stage 3 Prob."], +jsonDatai["Climb Prob."] ]);
          }
        }
        /*
         * First section where we display autonmous shots graph
         * We use the Chart object to display the data and analytics of the team and we split the column to 1/3 of the screen
         * The bars are grouped as match by match views
         */
        let c1 =
          data1.length - 1 ? (
            <div key={"0" + team} style={{display: "inline-block", width: (window.screen.width - 300) / 3 + 50 }} >
              <Chart style={{ display: "inline-block" }} width={(window.screen.width - 300) / 3} height={"300px"} chartType="Bar" loader={<div id="chartstillloading">Loading Chart</div>} data={data1} options={{ isStacked: true, chart: { title: "Team " + this.state.charts_shown[team] + " Auto Shots", legend: "none" }}}/>
            </div>
          ) : null;
        /*
         * Next section where we display teleop shots graph
         * We do the same as the auto shots and display it to be 1/3 of the screen
         * The bars are grouped as match by match views
         */
        let c4 =
          data2.length - 1 ? (
            <div key={"0" + team} style={{ display: "inline-block", width: (window.screen.width - 300) / 3 + 50 }}>
              <Chart style={{ display: "inline-block" }} width={(window.screen.width - 300) / 3} height={"300px"} chartType="Bar" loader={<div id="chartstillloading">Loading Chart</div>} data={data2} options={{ isStacked: true, chart: { legend: "none", title: "Team " + this.state.charts_shown[team] + " Teleop Shots" } }}/>
            </div>
          ) : null;
        /*
         * Display all the times (defence, climb, etc...) graphs
         * Once again, we use the Chart object to display the chart 1/3 of the screen
         * The bars are grouped as match by match views
         */
        let c2 =
          data3.length - 1 ? (
            <div key={"1" + team} style={{ display: "inline-block", width: (window.screen.width - 300) / 3 + 50 }}>
              <Chart width={(window.screen.width - 300) / 3} height={"300px"} chartType="Bar" loader={<div id="chartstillloading">Loading Chart</div>} data={data3} options={{ isStacked: true, chart: { legend: "none", title: "Team " + this.state.charts_shown[team] + " Times" }}} />
            </div>
          ) : null;
        /*
         * Display of the overall data for a team
         * We essentially use state uplifting to get the data from higher states in the app
         * and use it to display the data rather than recomputing it every time
         * The data is displayed within the same column as the charts
         */
        let c3 =
          overall.length - 1 ? (
            <div key={"2" + team} style={{ display: "inline-block", width: (window.screen.width - 300) / 3 + 50 }} >
              <table>
                <tbody>
                  {/*
                    * These are a manual display of all the overall data for a team
                    */}
                  <tr>
                    <td> {overall[0][1] + ": " + (typeof +overall[1][1] == "number" && !isNaN(overall[1][1]) ? overall[1][1] : "No data")} </td>
                  </tr>
                  <tr>
                    <td> {overall[0][2] + ": " + (typeof +overall[1][2] == "number" && !isNaN(overall[1][2]) ? overall[1][2] : "No data")} </td>
                  </tr>
                  <tr>
                    <td> {overall[0][3] + ": " + (typeof +overall[1][3] == "number" && !isNaN(overall[1][3]) ? overall[1][3] : "No data")} </td>
                  </tr>
                  <tr>
                    <td> {overall[0][4] + ": " + (typeof +overall[1][4] == "number" && !isNaN(overall[1][4]) ? overall[1][4] : "No data")} </td>
                  </tr>
                  <tr>
                    <td> {overall[0][5] + ": " + (typeof +overall[1][5] == "number" && !isNaN(overall[1][5]) ? overall[1][5] : "No data")} </td>
                  </tr>
                  <tr>
                    <td> {overall[0][5] + ": " + (typeof +overall[1][5] == "number" && !isNaN(overall[1][5]) ? overall[1][5] : "No data")} </td>
                  </tr>
                  <tr>
                    <td> {overall[0][6] + ": " + (typeof +overall[1][6] == "number" && !isNaN(overall[1][6]) ? overall[1][6] : "No data")} </td>
                  </tr>
                  <tr>
                    <td> {overall[0][7] + ": " + (typeof +overall[1][7] == "number" && !isNaN(overall[1][7]) ? overall[1][7] : "No data")} </td>
                  </tr>
                  <tr>
                    <td> {overall[0][8] + ": " + (typeof +overall[1][8] == "number" && !isNaN(overall[1][8]) ? overall[1][8] : "No data")} </td>
                  </tr>
                  <tr>
                    <td> {overall[0][9] + ": " + (typeof +overall[1][9] == "number" && !isNaN(overall[1][9]) ? overall[1][9] : "No data")} </td>
                  </tr>
                  <tr>
                    <td> {overall[0][10] + ": " + (typeof +overall[1][10] == "number" && !isNaN(overall[1][10]) ? overall[1][10] : "No data")} </td>
                  </tr>
                  <tr>
                    <td> {overall[0][11] + ": " + (typeof +overall[1][11] == "number" && !isNaN(overall[1][11]) ? overall[1][11] : "No data")} </td>
                  </tr>
                  <tr>
                    <td> {overall[0][12] + ": " + (typeof +overall[1][12] == "number" && !isNaN(overall[1][12]) ? overall[1][12] : "No data")} </td>
                  </tr>
                  <tr>
                    <td> {overall[0][13] + ": " + (typeof +overall[1][13] == "number" && !isNaN(overall[1][13]) ? overall[1][13] : "No data")} </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null;

        /*
         * function that displays heatmap for a given team
         */
        function heatmap(team) {
          /*
           * Create an array of maps that store the individual positions of a team's shooting locations
           */
          let shot_list = [];
          let shot_list_auto = [];
          let teamcount = 0;
          /*
           * Map the raw data based on whether it is auto or teleop to the corresponding array for shooting positions
           * (Loop through each array and push into shooting pos)
           */
          rawData.map(state => {
            if (state.team_num == team) {
              state.shooting_pos_auto.forEach(ashot => {
                shot_list_auto.push([ashot.x, ashot.y]);
              });
              state.shooting_pos
                .forEach(ashot => {
                  shot_list.push([ashot.x, ashot.y]);
                });
              teamcount += 1;
            }
          });

          /*
           * Display the heatmap to the stream
           * First display the image with source as the field and 1/3 of the field
           */
          let display = (
            <div>
              <img src={require(`${field}`)} id={"match_field_image" + team} style={{ width: (window.screen.width - 300) / 3 }} />
              {shot_list_auto.map(coords => {
              /*
               * display auto shot spots
               * because the heatmap is a scaled version, we take that into account when we display it
               * we make the field half the size of the actual match form field and thus display the {x, y} accordinging
               */
                try {
                  return (
                    <img src={require(`${circleblue}`)} width={rawData[0].circle_size / 2} height={rawData[0].circle_size / 2} style={{ opacity: teamcount == 1 ? 100 : 100 / teamcount + 30, position: "absolute", left: ((coords[0] / rawData[0].field_size) * ((window.screen.width - 300) / 3)) / 112 + document.getElementById("match_field_image" + team).getBoundingClientRect().left - rawData[0].circle_size / 4, top: ((coords[1] / rawData[0].field_size) * ((window.screen.width - 300) / 3)) / 117 + document.getElementById("match_field_image" + team).getBoundingClientRect().top - rawData[0].circle_size / 4}} />
                  );
                  /*
                   * If we try it and it doesn't work, log the error to console
                   */
                } catch (error) {
                  console.log(error);
                  return null;
                }
              })}
              {/*
                * The same is done for the teleop circles(displayed in red)
                * scale to actualy field size
                */}
              {shot_list.map(coords => {
                try {
                  return (
                    <img src={require(`${circlered}`)} width={rawData[0].circle_size / 2} height={rawData[0].circle_size / 2} style={{ opacity: teamcount == 1 ? 100 : 100 / teamcount + 30, position: "absolute", left: ((coords[0] / rawData[0].field_size) * ((window.screen.width - 300) / 3)) / 112 + document.getElementById("match_field_image" + team).getBoundingClientRect().left - rawData[0].circle_size / 4, top: ((coords[1] / rawData[0].field_size) * ((window.screen.width - 300) / 3)) / 117 + document.getElementById("match_field_image" + team).getBoundingClientRect().top - rawData[0].circle_size / 4}} />
                  );
                  /*
                   * If we try it and it doesn't work, log the error to console
                   */
                } catch (error) {
                  console.log(error);
                  return null;
                }
              })}
            </div>
          );
          return display;
        }

        /*
         * This is the array that displays the analytics for a team. 
         * We push what needs to be displayed into the array and show it
         */
        allmaps.push(heatmap(this.state.charts_shown[team]));
        /*
         * Push graphs (shots and time) to array
         */
        charts[charts.length - 1].push(c1);
        charts[charts.length - 1].push(c4);
        /*
         * Push overall data for team to array
         */
        charts[charts.length - 1].push(c2);
        /*
         * Push heatmap for team shooting positions to array
         */
        charts[charts.length - 1].push(c3);
      }
      /*
       * display all analytics(graphs and overall data)
       */
      return (
        <div>
          <br/>
          {/*
            * Display button to show all images for selected team 
            */}
          <button style={{ width: "100%" }} className="btn btn-danger grey darken-3" onClick={() => {  this.setState({ refresh: !this.state.refresh }); }} >
            Load Images
          </button>
          {this.buttons}
          {/*
            * Display all charts and overall data to user
            * Display heatmap for team
            */}
          <table>
            <tbody>
              <tr> {charts.map(x => {return <td style={{ border: "1px solid black" }}>{x[0]}</td>; })} </tr>
              <tr> {charts.map(x => {return <td style={{ border: "1px solid black" }}>{x[1]}</td>; })} </tr>
              <tr> {charts.map(x => {return <td style={{ border: "1px solid black" }}>{x[2]}</td>; })} </tr>
              <tr> {charts.map(x => {return <td style={{ border: "1px solid black" }}>{x[3]}</td>; })} </tr>
              <tr> {allmaps.map(x => {return <td style={{ border: "1px solid black" }}>{x}</td>; })} </tr>
            </tbody>
          </table>
        </div>
      );
      /*
       * If the analytics are unable to load, return an error to screen
       */
    } else {
      return <p>not working...</p>;
    }
  }
}

/*
 * Map state to firestore to allow for read and write
 */
const mapStateToProps = state => {
  return {
    match_forms: state.firestore.ordered.match_forms,
    auth: state.firebase.auth,
    notifications: state.firestore.ordered.notifications
  };
};

export default compose(
  connect(mapStateToProps),
  firestoreConnect([
    { collection: "match_forms", orderBy: ["createdAt", "desc"] },
    { collection: "notifications", limit: 3, orderBy: ["time", "desc"] }
  ])
)(Teams);
