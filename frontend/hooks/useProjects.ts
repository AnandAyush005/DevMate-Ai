import { createProjects, getProject, updateProject } from "@/lib/project.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetProjects = () =>{
    return useQuery({
        queryKey : ["projects"],
        queryFn : getProject
    })
}

export const useCreateProject = () =>{

    const queryClient = useQueryClient();

    return useMutation({
        mutationKey : ["projects", "create"],
        mutationFn : createProjects,

        onSuccess : ()=>{
            queryClient.invalidateQueries({
                queryKey : ["projects"]
            })
        }
    })
}

export const useUpdateProject = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationKey : ["projects", "update"],
        mutationFn : updateProject,

        onSuccess : () =>{
            queryClient.invalidateQueries({
                queryKey : ["projects"]
            })
        }
    })

    
}