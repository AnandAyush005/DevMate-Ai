"use client"

import { useGetProjects } from "@/hooks/useProjects";
import ProjectCard from "./ProjectCard";

export type Project = {
    id : string,
    name : string,
    description ?: string, 
    createdAt : string
}

export default function GetProjects(){

    const { data, isPending, isError, error } = useGetProjects();

    if(isPending){
        return (
            <div className="flex-1 items-center justify-center">
                Loading...
            </div>
        )
    }

    if(isError){

        console.log(error);

        return(
            <p>Error while fetching the project</p>
        )
    }

    return(
        <div className="min-w-full flex flex-wrap justify-center">
            {data.data.length === 0 ? <p>No projects yet..</p> : data.data.map((project : Project) => <ProjectCard project={project} key={project.id} />)}
        </div>
    )
}