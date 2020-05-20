import React, { Component } from "react";
import { connect } from "react-redux";
import { createMatchForm } from "../../store/actions/matchFormActions";
import { Redirect, withRouter } from "react-router-dom";
import "./style.css";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import Timer from "Timer.js";
import Checkbox from "Checkbox.js";

const tele_time =
  window.location.href.substring(7, 16) != "localhost:" ? 5000 : 20000;
// empty arrays for qualification matches
const qm_blue = [[0, 0, 0]];
const qm_red = [[0, 0, 0]];
// label and vlaues for scouters to select
const qm = [
  [
    { label: "R 1: 0", value: 1 },
    { label: "R 2: 0", value: 2 },
    { label: "R 3: 0", value: 3 },
    { label: "B 1: 0", value: 4 },
    { label: "B 2: 0", value: 5 },
    { label: "B 3: 0", value: 6 }
  ]
];

/*
 * async function that loads matches and teams into desired arrays from blue alliance api
 */
const loadMatchesAndTeams = async () => {
  const response = await fetch(
    `https://www.thebluealliance.com/api/v3/event/2020onosh/matches/simple`,
    {
      headers: {
        "X-TBA-Auth-Key": `rVSoi1uFgP4KkYnjXvjtFdakv662U7rCi3wtFZ1jwNcQTiphjrlveXAo6fYG7mt7`
      }
    }
  );
  /*
   * parse through blue alliance json response
   * looks at all the results that have a comp_level of "qm"
   */
  const json_temp = await response.json();
  for (let i = 0; i < json_temp.length; i++) {
    if (json_temp[i].comp_level === "qm") {
      /*
       * for one qualification match takes all the blue alliance teams and pushes into array qm_blue
       * and for qm_red. Takes substring of only the FRC team number
       */
      qm_blue.push([
        parseInt(json_temp[i].alliances.blue.team_keys[0].substring(3)),
        parseInt(json_temp[i].alliances.blue.team_keys[1].substring(3)),
        parseInt(json_temp[i].alliances.blue.team_keys[2].substring(3))
      ]);

      /*
       * Same thing for red alliance for each qualification match
       */
      qm_red.push([
        parseInt(json_temp[i].alliances.red.team_keys[0].substring(3)),
        parseInt(json_temp[i].alliances.red.team_keys[1].substring(3)),
        parseInt(json_temp[i].alliances.red.team_keys[2].substring(3))
      ]);
      qm.push([]);


      /*
       * Display key for each team on blue and red alliances
       * Displays in the format as "<R/B> <#>: <team num>"
       * Each team is the same format
       */
      qm[json_temp[i].match_number] = [
        { label: "R 1: " + parseInt(json_temp[i].alliances.red.team_keys[0].substring(3)), value: 1 },
        { label: "R 2: " + parseInt(json_temp[i].alliances.red.team_keys[1].substring(3)), value: 2 },
        { label: "R 3: " + parseInt(json_temp[i].alliances.red.team_keys[2].substring(3)), value: 3 },
        { label: "B 1: " + parseInt(json_temp[i].alliances.blue.team_keys[0].substring(3)), value: 4 },
        { label: "B 2: " + parseInt(json_temp[i].alliances.blue.team_keys[1].substring(3)), value: 5 },
        { abel: "B 3: " + parseInt(json_temp[i].alliances.blue.team_keys[2].substring(3)), value: 6 }
      ];
    }
  }
};

// load all the matches and teams for current event
loadMatchesAndTeams();

/*
 * import images for field, red circle, blue circle
 */
const red_field = "./field.png";
const blue_field = "./field.png";
const circlered = "./circlered.png";
const circleblue = "./circleblue.png";

const field_size = 5.7; // constant for relative field size

let starting_time; // store starting match form time
let tele_start_time; // store starting match teleop form time

/*
 * autonomous and teleop cycle array for mistakes
 * if cycle has already been made and is recounted, it does not get inputed again
 * essentially a visited array
 */
let auto_cycles = [
  false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false
];

let tele_cycles = [
  false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false
];

/*
 * This is a function that either decreases or increases a counter with two buttons a user can enter (-) or (+)
 * This Counter functions works with the scoreboard to display the number of shots made by a team
 */
function Counter(props) {
  return (
    <div className="counter">
      <button
        className="counter-action decrement"
        onClick={function() {
          props.onChange(props.score > 0 ? -1 : 0);
        }}
      >
        {" "}
        -{" "}
      </button>
      <div className="counter-score">
        {" "}
        <p style={{ fontSize: "15px", marginBottom: "0px" }}>
          {props.displayName}
        </p>
        <div style={{ lineHeight: "20px", maxHeight: "20px" }}>
          {props.score}
        </div>
      </div>
      <button
        className="counter-action increment"
        onClick={function() {
          props.onChange(+1);
        }}
      >
        {" "}
        +{" "}
      </button>
    </div>
  );
}

/*
 * This is a function that displays the score of each shot type (high, low, miss)
 * It updates whenever the user changes one of the scores for a shot
 */
function Shot(props) {
  return (
    <div className="shot">
      <div className="shot-score">
        <Counter
          score={props.score}
          onChange={props.onScoreChange}
          displayName={props.displayName}
        />
      </div>
    </div>
  );
}

// Match Form class
class Form extends Component {
  constructor(props) {
    super(props);
    // Instance variables/state of class
    this.state = {
      team_num: -1, // current team number for match form
      field_size: field_size, // field size scale
      cycle_time: [], // array of cycle times for teleop period
      auto_cycle_time: [], // array of cycle times for autonomous period
      match_start_time: 0.0, // time that the match form starts as a point of reference
      ind_cycle_time: [], // individual cycle times
      average: 0, // average number of shots
      climb_time: 0.0, // time for a team to climb
      noshow: false, // boolean of whether the team was a noshow
      defence_time: 0.0, // cumulative time that a team defends
      balls_scored: 0, // total number of balls scored in teleop
      auto_balls_scored: 0, // total number of balls scored in auto
      floor_pickup: false, // boolean variable whether team can pickup from floor
      station_pickup: false, // boolean variable whether team can do station pickup
      stage2_activate: false, // boolean variable whether team activated stage 2
      stage3_activate: false, // boolean variable whether team activated stage 3
      trench: false, // boolean variable whether team can go under trench
      climb: false, // boolean variable whether team can climb 
      preloads: 0, // number of preloads team carries
      match_view: "AUTON", // type of view current form is in
      shooting_pos: [], // teleop shooting positions {x, y}
      shooting_pos_auto: [], // auto shooting positions {x, y}
      time: 0, // current match time
      isOn: false, 
      start: 0, // match time start
      inMatchView: 0, // type of match view
      circle_size: 50, // size of circle
      // teleop shot types - scoreboard
      shots: [
        { type: "high", score: 0, id: 1 },
        { type: "low",  score: 0, id: 2 },
        { type: "miss", score: 0, id: 3 }
      ],
      // totals for auto
      top: 0, 
      bot: 0,
      miss: 0,
      // auto shot types - scoreboard
      auto_shots: [
        { type: "high", score: 0, id: 1 },
        { type: "low",  score: 0, id: 2 },
        { type: "miss", score: 0, id: 3 }
      ],
      // totals for teleop
      tele_top: 0,
      tele_bot: 0,
      tele_miss: 0,
      // string for which team is currently selected
      teamSelected: null,
      // boolean whether robot disconnected
      dc: false,
      // boolean whether match was a replay
      replay: false
    };
  }

  /*
   * Function that allows circles to be placed on field
   * Checks whether team is red or blue alliance and places corresponding circle
   * Uses relative position of screen and places circles based on where user taps
   */
  Circle(props) {
    try {
      let circle = (index, isRed) => {
        return (
          <img
            key={props.shooting_pos[index].index}
            src={isRed ? require(`${circlered}`) : require(`${circleblue}`)}
            width={props.circle_size}
            height={props.circle_size}
            onClick={() => {
              this.field_onClick(window.event);
            }}
            /*
             * Relative position of tap
             * Returns {x, y} of tap and circle
             */
            style={{
              position: "absolute",
              left:
                props.shooting_pos[index].x +
                document
                  .getElementById("match_field_image")
                  .getBoundingClientRect().left -
                props.circle_size / 2 +
                "px",
              top:
                props.shooting_pos[index].y +
                document
                  .getElementById("match_field_image")
                  .getBoundingClientRect().top -
                props.circle_size / 2 +
                window.scrollY +
                "px"
            }}
          ></img>
        );
      };
      /*
       * Maps to shooting position {x, y} to array of shooting positions
       * Check auto or teleop and maps correspondingly
       */
      let circles = [
        props.shooting_pos_auto.map(index => {
          return circle(index.index, false);
        }),
        props.shooting_pos
          .slice(props.shooting_pos_auto.length, props.shooting_pos.length)
          .map(index => {
            return circle(index.index, true);
          })
      ];
      /*
       * Returns and displays circle
       */
      return <React.Fragment>{circles}</React.Fragment>;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /*
   * State mutator method that updates selected team based on selected value 
   */
  updateTeamChange = () => {
    this.setState({ match_start_time: new Date().getTime() });
    try {
      this.setState({
        teamSelected: +document
          .getElementsByClassName("  css-1uccc91-singleValue")[0]
          .innerText.slice(5)
      });
      this.setState({
        team_num: this.state.teamSelected
      });
    } catch {}
  };

  /*
   * State mutator method that updates score for each shot type (high, low, miss)
   * Checks the current time of match (teleop or auto), thus updating the corresponding state
   * A cycle is considered if 5 balls have been successfully shot: checks if total number of shots is a multiple of 5
   *                                                               updates cycle times and total number of cycles
   *                                                               sets reference time to time at which cycle ends
   * Does so for teleop and auto period
   * Calculates averages for cycle times while updating
   */
  onScoreChange = (index, delta) => {
    /*
     * If current time is within auto period range
     * Update states according to auto or teleop
     * First if is for teleop
     */
    if ((new Date().getTime() - this.state.match_start_time) / 1000 <= 20) {
      this.state.auto_shots[index].score += delta;
      if (index === 0 || index === 1) {
        this.state.auto_balls_scored += delta;
      }
      /*
       * Cycle time calculator
       * If total number of balls if a multiple of 5 track time between cycle
       * Uses auto_cycles array to keep track if cycle already happened to not create false data (e.g. 0.1s cycle times)
       */
      if (this.state.auto_balls_scored % 5 === 0) {
        if (auto_cycles[this.state.auto_balls_scored / 5 - 1] === false) {
          auto_cycles[this.state.auto_balls_scored / 5 - 1] = true;
          this.state.auto_cycle_time.push(
            (new Date().getTime() - starting_time) / 1000
          );
          starting_time = new Date().getTime();
        }
      }
      this.setState(this.state);
    /*
     * Same is done for teleop period
     */
    } else {
      this.state.shots[index].score += delta;
      if (index === 0 || index === 1) {
        this.state.balls_scored += delta;
      }
      if (this.state.balls_scored % 5 === 0) {
        if (tele_cycles[this.state.balls_scored / 5 - 1] === false) {
          tele_cycles[this.state.balls_scored / 5 - 1] = true;
          this.state.cycle_time.push(
            (new Date().getTime() - tele_start_time) / 1000
          );
          tele_start_time = new Date().getTime();
        }
      }
      this.setState(this.state);
    }

    /*
     * Calculate averages for cycle times(teleop and auto)
     * Updates state to match with user inputed data
     */
    this.state.average_cycle_time =
      this.arraySum(this.state.cycle_time) / this.state.cycle_time.length;
    this.state.average_auto_cycle_time =
      this.arraySum(this.state.auto_cycle_time) /
      this.state.auto_cycle_time.length;
    this.state.top = this.state.auto_shots[0].score;
    this.state.bot = this.state.auto_shots[1].score;
    this.state.miss = this.state.auto_shots[2].score;
    this.state.tele_top = this.state.shots[0].score;
    this.state.tele_bot = this.state.shots[1].score;
    this.state.tele_miss = this.state.shots[2].score;
    this.setState(this.state);
  };

  // Method that passes in array as parameter and calculates average
  arraySum = arr => {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum;
  };

  // Method that updates match view to prematch form (team selection)
  showPreMatch = e => {
    e.preventDefault();
    this.setState({ inMatchView: 1 });
    console.log(this.state);
  };

  useEffect = () => {
    window.scrollTo(0, 0);
  };

  // Method that updates match view to in match form (shots and shooting positions)
  showInMatch = e => {
    this.useEffect();
    e.preventDefault();
    this.setState({ inMatchView: 2, preloads: this.state.preloads });
    starting_time = new Date().getTime();
    tele_start_time = new Date().getTime() + 20 * 1000;
    this.setState({
      team_num: this.state.teamSelected === null ? -1 : this.state.teamSelected
    });
    this.showMatchType();
    console.log(this.state);
  };

  // Method that updates match view to end match form (boolean (y/n) for team)
  showEndMatch = e => {
    this.state.shooting_pos.splice(0,
      this.state.shooting_pos_auto.length
    );
    e.preventDefault();
    this.setState({ inMatchView: 3 });
    this.setState({
      climb_time: this.state.climb_time / 1000,
      defence_time: this.state.defence_time / 1000
    });
    console.log(this.state);
  };

  /*
   * handles changes for state/instance variables 
   * parses value to update if it is an integer
   */
  handleChange = e => {
    if (isNaN(e.target.value)) {
      this.setState({
        [e.target.id]: e.target.value
      });
    } else {
      this.setState({
        [e.target.id]: Number(e.target.value)
      });
    }
    console.log(this.state);
  };

  // handle next button to next match view
  handleNext = e => {
    e.preventDefault();
    console.log(this.state);
  };

  /* handle submit button: 
   *  - submits form and creates match form in firestore database
   *  - returns user back to home page
   */ 
  handleSubmit = e => {
    e.preventDefault();
    this.props.createMatchForm(this.state);
    this.props.history.push("/home");
  };

  // toggle for circle shooting position display
  togglecircledisplay = () => {
    this.setState({ circle_show: !this.state.circle_show });
  };

  /*
   * first determines the position {x, y} of user click
   * gets relative position from 0, 0 (top left of screen)
   * checks if position clicked is on field
   * pushes shooting positon into array of shooting positions
   * updates state of shooting_pos array
   */
  field_onClick = e => {
    let x = e.clientX;
    let y = e.clientY;
    x = Number(x - document.getElementById("match_field_image").getBoundingClientRect().left).toFixed(0);
    y = Number(y - document.getElementById("match_field_image").getBoundingClientRect().top).toFixed(0);
    if (
      x >= 0 &&
      y >= 0 &&
      x <= document.getElementById("match_field_image").getBoundingClientRect().right - document.getElementById("match_field_image").getBoundingClientRect().left &&
      y <= document.getElementById("match_field_image").getBoundingClientRect().bottom - document.getElementById("match_field_image").getBoundingClientRect().top
    ) {
      let shooting_pos_copy = [...this.state.shooting_pos];
      shooting_pos_copy.push({
        x: Number(x),
        y: Number(y),
        index: this.state.shooting_pos.length
      });
      this.setState({ shooting_pos: shooting_pos_copy });
      if (new Date().getTime() - this.state.match_start_time < tele_time) {
        this.setState({ shooting_pos_auto: shooting_pos_copy });
      }
    }
  };

  /* 
   * For prematch form: increments number of preloads
   * does not allow number of preloads to exceed 3
   * updates state of number of preloads
   */
  incrementPreload = e => {
    e.preventDefault();
    if (this.state.preloads + 1 > 3) {
      this.setState({
        preloads: 3
      });
    } else {
      this.setState({
        preloads: this.state.preloads + 1
      });
    }
  };

  /*
   * If user added too many preloads -> allows user to reset number of preloads
   * updates and resets number of preloads to 0
   */
  resetPreload = e => {
    e.preventDefault();
    this.setState({
      preloads: 0
    });
  };

  // displays current match type
  showMatchType = e => {
    this.interval = setInterval(
      () => this.setState({ match_view: "TELEOP" }),
      window.location.href.substring(7, 16) == "localhost" ? 5000 : tele_time
    );
  };

  // clears match type
  clearMatchType = e => {
    clearInterval(this.interval);
  };

  /*
   * Check if user is logged in. If not, direct them to /signin
   * Displays first page of match form and aligns all components
   * Cannot go to next page if all components (team selection and match number) have not been filled out
   */
  render() {
    const { auth } = this.props;
    if (!auth.uid) return <Redirect to="/signin" />;
    let newMatchForm =
      this.state.inMatchView === 0 ? (
        <form
          className="white"
          onSubmit={this.showPreMatch}
          style={{
            marginTop: "0px"
          }}
        >
          <div className="input-field" style={{ marginBottom: "0px" }}>
            <p style={{ fontWeight: "bold", fontSize: 25 }}>
              Enter the current match number:
            </p>
            <input
              type="number"
              id="match_num"
              onChange={this.handleChange}
              placeholder="Match number"
            />
          </div>
          <div className="input-field">
            <button
              className="btn pink lighten-1"
              id="button1"
              style={{ opacity: +this.state.match_num ? 100 : 0 }}
            >
              Next
            </button>
          </div>
        </form>
      ) : null;

    /*
     * Drop down bar for team selection
     * calls updateTeamChange method when team is selected
     * updates state variable to team selected
     * Uses Select object in ReactJS
     */
    let CompetingTeams =
      this.state.inMatchView === 1 ? (
        <div className="spacer">
          <h1> </h1>
          <div className="row">
            <div className="col-md-4" style={{ marginLeft: "15px" }}>
              <h5 style={{ fontWeight: "bold" }}>
                Select The Team You're Scouting
              </h5>
              <div onClick={this.updateTeamChange} id="teamSelect2">
                <Select
                  isSearchable={false}
                  options={qm[this.state.match_num]}
                  id="teamSelect"
                  ref="teamselect"
                />
                {console.log()}
              </div>
            </div>
            <div className="col-md-4"></div>
          </div>
        </div>
      ) : null;

    /*
     * Prematch form for match form
     * First checks if inMatchView variable is 1
     * Displays boxes for increment, reset, and number of preloads
     * Updates state variable for number of preloads
     */
    let prematch =
      this.state.inMatchView === 1 ? (
        <form
          className="white"
          onSubmit={this.showInMatch}
          style={{
            marginTop: "0px",
            paddingTop: "0px"
          }}
        >
          <div className="input-field">
            <p style={{ fontWeight: "bold", fontSize: 25 }}>
              Number of Preloads
            </p>
            <button
              type="number"
              id="increment_preloads"
              onClick={this.incrementPreload}
              className="preload increment"
            >
              Preloads: {this.state.preloads}
            </button>
            <button
              type="number"
              id="reset_preloads"
              onClick={this.resetPreload}
              className="preload decrement"
            >
              Reset Preloads
            </button>
          </div>
          <div className="input-field">
            <button
              onClick={this.updateTeamChange}
              className="btn pink lighten-1"
              onSubmit={() => {
                this.getCurrentTime();
              }}
              id="button2"
            >
              Next
            </button>
          </div>
        </form>
      ) : null;

    /*
     * match field display with specific ratio with field_size   
     */
    let matchField = (
      <img
        src={require(`${red_field}`)}
        width={86 * 1.3 * field_size}
        height={47 * 1.3 * field_size}
        onClick={this.field_onClick}
        id="match_field_image"
      ></img>
    );

    /*
     * mapping display names to id names for checkboxes for end of match form
     * this allows for modularity within the app. If one adds another pair, 
     * the pair would show up on the end of match form
     */
    let boolCheckMap = () => {
      let boolCheckMapList = [
        ["Did Floor Pickup", "floor_pickup"],
        ["Did Station Pickup", "station_pickup"],
        ["Climb Successful", "climb"],
        ["Stage 2 Activated - Turn Table Light", "stage2_activate"],
        ["Stage 3 Activated - Turn Table Light", "stage3_activate"],
        ["Did Go Under Trench", "trench"],
        ["Did They D/C", "dc"],
        ["Match is a replay", "replay"],
        ["Robot was a no show", "noshow"]
      ];
      /*
       * Return and display as checkboxes for end of match form
       */
      return boolCheckMapList.map(index => (
        <Checkbox
          key={index[0]}
          type={Boolean}
          displayName={index[0]}
          doClick={state => {
            this.setState(state);
          }}
          statename={index[1]}
          key={index[1]}
        />
      ));
    };

    /*
     * Display for end of match form.
     * Checks if user is currently in inMatchView 3
     * Displays all checkboxes (y/n)
     * Submit buttom -> calls on handleSubmit method that returns user to home page and send data to firestore database
     */
    let endMatchForm =
      this.state.inMatchView === 3 ? (
        <div className="container">
          <div className="input-field">
            <p style={{ fontWeight: "bold", fontSize: 25 }}>
              End of Match Form
            </p>
          </div>
          <table>
            <tbody>{boolCheckMap()}</tbody>
          </table>

          <form className="white" onSubmit={this.handleSubmit}>
            <div className="input-field">
              <button className="btn pink lighten-1" id="button4">
                Submit
              </button>
            </div>
          </form>
        </div>
      ) : null;

    /*
     * Checks if user is currently in inMatchView 2
     * If so, returns matchField and allows user to scout robot.
     * Otherwise, return nothing to screen
     */
    let inMatchForm = this.state.inMatchView === 2 ? matchField : null;

    /*
     * Debugging method that allows user to turn off or on circles where robot shoots from.
     */
    let showncircle = this.state.circle_show ? this.Circle(this.state) : null;

    /*
     * Array that stores the names of the different types of shots
     * Includes: Top, Bot, Miss
     */
    let shotNames = ["Top", "Bot", "Miss"];

    /*
     * First checks if current match is inMatchView 2 -> robots are in play
     * If the current time of the match is in auto time, the scoreboard updates and maps
     * to state/instance variables corresponding to an auto period.
     * Otherwise, maps to teleop state/instance variables.
     */
    let scoreboard =
      this.state.inMatchView === 2 ? (
        /*
         * Checks if current time is auto from reference time of match start
         */
        new Date().getTime() - this.state.match_start_time <= 20 * 1000 ? (
          <span className="scoreboard">
            <span className="shots">
              {this.state.auto_shots.map(
                function(shot, index) {
                  return (
                    <Shot
                      onScoreChange={function(delta) {
                        this.onScoreChange(index, delta);
                      }.bind(this)}
                      score={shot.score}
                      key={index}
                      displayName={shotNames[index]}
                    />
                  );
                }.bind(this)
              )}
            </span>
          </span>
        ) : (
          /*
           * Update variables for teleop period
           */
          <span className="scoreboard">
            <span className="shots">
              {this.state.shots.map(
                function(shot, index) {
                  return (
                    <Shot
                      onScoreChange={function(delta) {
                        this.onScoreChange(index, delta);
                      }.bind(this)}
                      score={shot.score}
                      key={index}
                      displayName={shotNames[index]}
                    />
                  );
                }.bind(this)
              )}
            </span>
          </span>
        )
      ) : null;

    /*
     * Field image and shooting position input
     * Displays timer, in match form, and next button for end of match form
     * Uses Timer objects to display the total(cumulative) time for defence and climb
     */
    let field_input =
      this.state.inMatchView === 2 ? (
        <div>
          <table className="FieldInput">
            <tbody>
              <tr>
                <td style={{ width: "200px" }}>
                  <h1>{this.state.match_view}</h1>
                  {/*
                   * Timer for cumulative defence time
                   * Updates state/instance variable for total defence time
                   */}
                  <Timer
                    this={this}
                    name={this.state.defence_time}
                    displayName="Defence Timer"
                    id="defence_time"
                  />
                  <div style={{ height: "15px" }} />
                  {/*
                   * Scoreboard for different shots
                   * High, bot, miss
                  */}
                  {scoreboard}
                  {/*
                   * Timer for cumulative climb time
                   * Updates state/instance variable for total climb time
                  */}
                  <Timer
                    this={this}
                    name={this.state}
                    displayName="Climb Timer"
                    id="climb_time"
                  />
                </td>
                <td width="500px">{inMatchForm}</td>
              </tr>
            </tbody>
          </table>
          {showncircle}
          <div className="input-field">
            {/*
             * Next button and displays end of match form
            */}
            <button
              className="btn pink lighten-1"
              onClick={this.showEndMatch}
              id="button3"
            >
              Next
            </button>
          </div>
        </div>
      ) : null;

    /*
     * Display all components for match form
     * new match form for creation, drop down menu for competing teams, prematch form, 
     * in match form, and end of match form
     */
    return (
      <div>
        <div>{}</div>
        <span>
          {newMatchForm}
          {CompetingTeams}
          {prematch}
          {field_input}
          {endMatchForm}
        </span>
      </div>
    );
  }

  /*
   * method is called as soon as components are mounted
   * allows for loading data from remote endpoint
   */
  componentDidMount() {
    document.getElementById("button1").focus();
  }

  /*
   * if the current match view view is not the previous match view, 
   * the button that is displayed ("next") allows user to go to next
   */
  componentDidUpdate(prevProps, prevState) {
    if (prevState.inMatchView != this.state.inMatchView) {
      document.getElementById("button" + (this.state.inMatchView + 1)).focus();
    }
  }
}

/*
 * Map state to firestore database
 * Checks for authentication first
 */
const mapStateToProps = state => {
  return {
    auth: state.firebase.auth
  };
};

/*
 * sends data to firestore database by calling action and reducer createMatchForm
 */
const mapDispatchToProps = dispatch => {
  return {
    createMatchForm: project => dispatch(createMatchForm(project))
  };
};

/*
 * user firebase connect to connect match form to firestore database
 */
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));
