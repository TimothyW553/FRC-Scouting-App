import React from 'react'
import ProjectSummary from './ProjectSummary'
import { Link } from 'react-router-dom'

/*
 * Static componenet for listing all "projects" aka pit scouting forms
 */
const ProjectList = ({projects}) => {
  return (
    /*
     * Map all projects from projects collection database to display all forms
     * display with url 'project/id'
     * Use ProjectSummary component to show some details of form (name, date)
     */
    <div className="project-list section">
      { projects && projects.map(project => {
        return (
          <Link to={'/project/' + project.id} key={project.id}>
            <ProjectSummary project={project} />
          </Link>
        )
      })}  
    </div>
  )
}

export default ProjectList
