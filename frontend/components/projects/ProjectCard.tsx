import { Project } from "./ProjectsList";

type ProjectCardProps = {
    project : Project
}

export default function ProjectCard( {project} : ProjectCardProps){

    return (
        <div
            className="flex flex-col px-4 py-6 m-5 min-w-1/5 border rounded" key={project.id}>
                <p>Project name : {project.name}</p>
                <p>Project description : {project.description}</p>
                <p>Project creationTime : {project.createdAt}</p>
            </div>
    )
}