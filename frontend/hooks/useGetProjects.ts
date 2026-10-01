import {
    getProject,
    createProjects,
    updateProject,
    deleteProject,
    getProjectById
} from "@/lib/project.api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export const useGetProjectbyId = (projectId : string) => {
    return useQuery({
        queryKey : ['project', projectId],
        queryFn : ()=> getProjectById(projectId),
        enabled : !!projectId
    })
}
