import React from "react";
import moment from "moment"; // react moment to check when an action was made

/*
 * Displays notifiaations
 * displays them with user who created it and when it was created using moment react
 */
const Notifications = props => {
  const { notifications } = props;

  // display user, date created, and information on teams
  return (
    <div className="section">
      <div className="card z-depth-0">
        <div className="card-content">
          <span className="card-title">Pit Scouting</span>
          <ul className="online-users">
            {notifications &&
              notifications.map(item => {
                return (
                  <li key={item.id}>
                    <span className="pink-text">{item.user} </span>
                    <span>{item.comments}</span>
                    <div className="note-date grey-text">
                      {moment(item.time.toDate()).fromNow()}
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
      <div></div>
    </div>
  );
};

// allow other classes to use Notifications
export default Notifications;
