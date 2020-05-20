import { Component } from "react";
import firebase from "../../config/fbConfig.js"; // import firebase configuration file to get access to firebase firestore

class GetFirebase extends Component {
  constructor(props) {
    super(props);
    this.that = this.props.that;
    this.state = { docs: [] };

    /*
     * Maps that allows for public certain codes to be displayed in a certain way
     * For example, `average_cycle_time` when called will become `Tele Cycle Time`
     * Display for overall page and other pages
     */
    let display_list = [
      ["average_cycle_time", "Tele Cycle Time"],
      ["average_auto_cycle_time", "Auto Cycle Time"],
      ["top", "Auto Balls Upper"],
      ["bot", "Auto Balls Lower"],
      ["miss", "Auto Balls Missed"],
      ["tele_top", "Teleop Balls Upper"],
      ["tele_bot", "Teleop Balls Lower"],
      ["tele_miss", "Teleop Balls Missed"],
      ["climbs", "Number of Climbs"],
      ["climb_time", "Climb Time"],
      ["defence_time", "Defence Time"],
      ["stage2_activate", "Stage 2 Prob."],
      ["stage3_activate", "Stage 3 Prob."],
      ["climb", "Climb Prob."]
    ]; 


    let func_list = [];
    /*
     * This loop essentially turns all the quantitative data values from the overall list into numerical data
     * tries to convert x (from overall table) to integer [string->integer]
     * if it cant it returns it as underfined
     */
    for (let i = 0; i < 11; i++) {
      func_list.push(x => {
        try {
          let y = +x;
          y++; y--;
          return y;
        } catch {
          return undefined;
        }
      });
    }
    /*
     * return 1 or 0: true or false
     * converts boolean to 1 or 0 for probability values
     */
    for (let i = 0; i < 3; i++) {
      func_list.push(x => {
        try {
          let y = x ? 1 : 0;
          y++;
          y--;
          return y;
        } catch {
          return undefined;
        }
      });
    }

    /*
     * this function gets averages from the firebase database for the overall table
     * looks into firestore databse collection under "match_forms" and takes a snapshot all of the data
     */
    let getAvg = async that => {
      this.props.that.setState({ display_list: display_list });
      firebase
        .firestore()
        .collection("match_forms")
        .get()
        .then(snapshot => {
          snap_Loaded(snapshot.docs, display_list, that, func_list);
          snap_Loaded1(snapshot.docs, that);
        });
    };

    /*
     * checks if the snapshot taken from firebase has been loaded
     * if it finds a team that isn't in the array of visited/used teams, it finds it and pushes its data into the teamsLIst
     */
    let snap_Loaded = (docs1, varlist, that, func) => {
      // get all the teams
      let teamsList = [];
      let used = [];
      for (let i = 0; i < docs1.length; i++) {
        if (!used.includes(docs1[i].data().team_num)) {
          teamsList.push({ TeamNumber: docs1[i].data().team_num });
          used.push(docs1[i].data().team_num);
        }
      }
      that.setState({
        json: teamsList,
        teamsList: teamsList.map(x => {
          return x.TeamNumber;
        })
      });

      /* 
       * varlist: list containing match form var names and display names
       * displays data to overall table. If it cannot find a value for the specific team it displays "No data."
       */
      for (let j = 0; j < varlist.length; j++) {
        this.that.setState({ docs: docs1, data: docs1[0].data() });
        // loop through varlist
        for (let i = 0; i < that.state.json.length; i++) {
          let docs = this.that.state.docs;
          let avg = 0;
          let listcopy = [...docs]; // copys values from firestore
          let bad = 0;
          for (let I = docs.length - 1; I >= 0; I--) { // parses data into integer or doubles
            if (that.state.json[i].TeamNumber == docs[I].data().team_num) {
              if (
                typeof parseFloat(func[j](docs[I].data()[varlist[j][0]])) ===
                  "number" &&
                !isNaN(parseFloat(func[j](docs[I].data()[varlist[j][0]])))
              ) {
                // apply function to each
                avg += parseFloat(func[j](docs[I].data()[varlist[j][0]]));
                listcopy.splice(I, 1);
              } else {
                listcopy.splice(I, 1);
                bad++;
              }
            }
          }
          // displays values averages at 2 decimals places
          if (listcopy.length != docs.length) {
            if (bad != docs.length - listcopy.length) {
              avg = (avg / (docs.length - listcopy.length - bad)).toFixed(2);
              this.that.setState({ docs: listcopy });
              let jsoncopy = [...that.state.json];
              jsoncopy[i][varlist[j][1]] = avg;
              that.setState({ json: jsoncopy });
            } else {
              let jsoncopy = [...that.state.json];
              jsoncopy[i][varlist[j][1]] = null;
              that.setState({ json: jsoncopy });
            }
          }
        }
        // if values is null/not value for average, dispaly "No data."
        for (let i = 0; i < that.state.teamsList.length; i++) {
          if (that.state.json[i][varlist[j][1]] === null) {
            that.state.json[i][varlist[j][1]] = "No data.";
            that.setState({});
          }
        }
      }
    };

    // takes from dataList and displays accordingly
    let snap_Loaded1 = (docs1, that) => {
      let datalist = [];
      for (let i = 0; i < docs1.length; i++) {
        datalist.push(docs1[i].data());
      }
      that.setState({ rawData: datalist });
    };
    
    // get the average on refresh
    getAvg(this.that);
    this.props.onRefresh();
  }
  render() {
    return null;
  }
}

export default GetFirebase;
