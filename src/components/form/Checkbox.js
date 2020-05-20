import React, { Component } from 'react'

/*
 * Checkbox class
 * Works with InMatch class to create checkboxes for end of match form
 * Each checkbox is an instance of checkbox class
 */ 

class Checkbox extends Component {
    /*
     * calls super with parameter props from Component
     * state is either true or false (checkbox)
     */
    constructor(props) {
        super(props);
        this.state = { value: this.props.type === Boolean ? false : null };
    }
    /*
     * Displays checkbox --> if true, display "✓", otherwise nothing (empty checkbox)
     */
    render() {
        return (
            <tr>
                <th style={{ width: "30px", paddingTop: "0px", paddingBottom: "0px" }}>
                    <button
                        onClick={() => {
                            this.setState({ value: !this.state.value });
                            console.log(!this.state.value);
                            this.props.doClick({
                            [this.props.statename]: !this.state.value
                            });
                        }}
                        style={{ border: "1px solid black" }}
                    >
                        <div style={{ height: "20px", width: "10px" }}>
                            {this.state.value ? "✓" : null}
                        </div>
                    </button>
                </th>
                <th style={{ width: "30px", paddingTop: "0px", paddingBottom: "0px" }}>
                    <div style={{ height: "11px" }}></div>
                    <p>{this.props.displayName}</p>
                </th>
            </tr>
        );
    }
}

/*
 * Export class for further outside use of Checkbox class (such as in inMatch.js)
 */
export default Checkbox;