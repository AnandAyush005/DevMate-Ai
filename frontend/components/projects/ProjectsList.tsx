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
        <div className="grid w-full px-16 py-4 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {data.data.length === 0 ? (
        <p className="col-span-full text-center text-zinc-400">
        No projects yet.
        </p>
    ) : (
        data.data.map((project: Project) => (
        <ProjectCard
            key={project.id}
            project={project}
        />
        ))
    )}
    </div>
    )
}