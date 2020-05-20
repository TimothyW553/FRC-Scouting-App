import React, { Component } from 'react'

/*
 * Timer class for displaying any time based actions on screen
 * include: climb time and defence time
 */

class Timer extends Component {
    /*
     * Instance/state variables and constructor to super for component class
     */
    constructor(props) {
        super(props);
        /*
         * We use the timer_running state to track if the timer is currently running or not
         *        and timer for the duration of time the current Timer has
         */
        this.state = {
            timer_running: null,
            timer: 0 / 1000
        };
    }
    render() {
        let that = this.props.this;
        let stopTimer = () => {
        /*
         * We make sure that the time within the game is in teleop period
         * If user accidentally clicks the timer in auto, it will not work 
         */
        if (new Date().getTime() - that.state.match_start_time > 15000) {
            /*
             * We chceck if the timer is currently running, if so, we constantly update the time
             * by calling new Date().getTime() which returns the current time in a certain format
             */
            if (!this.state.timer_running) {
                this.setState({ timer_running: new Date().getTime() });
            /*
             * Otherwise, we don't update the time constantly
             */
            } else {
                this.setState({
                    timer_running: null,
                    timer:
                    this.state.timer + new Date().getTime() - this.state.timer_running
                });
            this.state.timer = this.state.timer + new Date().getTime() - this.state.timer_running;
            }
            that.setState({ [this.props.id]: this.state.timer });
            }
        };
        /*
         * Here we return what the button will look like for each instance of the Timer class
         */
        return (
            <button
            className="btn btn-danger"
            style={{ height: "60px" }}
            onClick={stopTimer}
            >
            {(this.state.timer_running === null
                ? this.props.displayName
                : "Stop Timer") +
                ": " +
                (this.state.timer / 1000).toFixed(3) +
            "s"}
            </button>
        );
    }
}

export default Timer;