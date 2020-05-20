import React from 'react'
import moment from 'moment'

/*
 * Static component for ProjectSummary of how all forms
 * Simply displays which team number the form corresponds to, name of scouter, and time created
 */ 
const ProjectSummary = ({project}) => {
  return (
    <div className="card z-depth-0 project-summary">
      <div className="card-content grey-text text-darken-3">
        <span className="card-title ">{project.team_num}</span>
        <p>Posted by {project.authorFirstName} {project.authorLastName}</p>
        <p className="grey-text">{moment(project.createdAt.toDate()).calendar()}</p>
      </div>
    </div>
  )
}

export default ProjectSummary
