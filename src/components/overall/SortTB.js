import ReactDOM from "react-dom";
import React, { Component } from "react";
import "./style.css";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import firebase from "../../config/fbConfig.js";

/*
 * Function to format table into alternating colours (white and grey)
 */
function rowStyleFormat(row, rowIdx) {
  return {
    backgroundColor: rowIdx % 2 === 0 ? "#F7F7F7" : "#EAEAEA"
  };
}

/*
 * Class component for Sortable table in overall page
 * Uses BootstrapTable to allow for more flexibility
 * By using BootstrapTable, one can input an import any form of valid data and it will display properly
 */
class SortTB extends Component {
  constructor(props) {
    /*
     * Calls super from Component class in ReactJS
     */
    super(props);
    /*
     * These are the instance variables: the robot data and a refresh checker
     */
    this.state = {
      real_data: [],
      refresh: false
    };
  }

  render() {
    /*
     * Lifting state up --> data taken from App.js for all robots and list of all teams that need to be displayed
     * Upon clicking the re-fetch button, the state is uplifted again and fetches data from firestore database again
     * We use the BootstrapTable as it has many built-in features such as sorting and custom row styling
     * We pass in the data taken from upliffting the state and pass it in to display in the overall table
     */
    let data = this.props.that.that2.state.json;
    this.display_list = this.props.that.that2.state.display_list;
    try {
      return (
        <div className="card text-center">
          <button
            onClick={() => {
              this.props.that.props.onRefresh();
            }}
            className="btn btn-danger grey darken-3"
          >
            Re-fetch
          </button>
          <div className="card-body">
            <BootstrapTable
              ref="table"
              data={data}
              trStyle={rowStyleFormat}
              wrapperClasses="table-responsive"
            >
              <TableHeaderColumn
                width="120"
                dataField="TeamNumber"
                isKey={true}
                dataSort={true}
              >
                Team #
              </TableHeaderColumn>
              {this.display_list.map(x => {
                return (
                  <TableHeaderColumn
                    width="120"
                    dataField={x[1]}
                    dataSort={true}
                    key={x[0]}
                  >
                    {x[1]}
                  </TableHeaderColumn>
                );
              })}
            </BootstrapTable>
          </div>
        </div>
      );
    } catch {
      return null;
    }
  }
}

/*
 * Export SortTB to allow other classes to use SortTB
 */
export default SortTB;
