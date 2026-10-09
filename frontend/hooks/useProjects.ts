import { createProjects, deleteProject, getProject, getProjectFileContent, getProjectFiles, updateProject } from "@/lib/project.api";
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

export const useDeleteProject = () =>{

    const queryClient = useQueryClient();

    return useMutation({
        mutationKey : ["projects", "delete"],
        mutationFn : deleteProject,

        onSuccess : ()=>{
            queryClient.invalidateQueries({
                queryKey : ["projects"]
            })
        }
    })
}

export const useGetProjectFiles = (projectId: string)=>{

    return useQuery({
        queryKey : ["projects", projectId, "files"],
        queryFn : () => getProjectFiles(projectId)
    })
}

export const useGetProjectFileContent = (projectId : string, fileId : string)=>{
    return useQuery({
        queryKey : ["projects", projectId, "files", fileId],
        queryFn : () => getProjectFileContent(projectId, fileId),
        enabled : !!projectId && !!fileId
    })
}