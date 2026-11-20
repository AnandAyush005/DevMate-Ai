import {
    createProjectFile,
    createProjectFolder,
    createProjects,
    deleteProject,
    deleteProjectFile,
    deleteProjectFolder,
    getProject,
    getProjectFileContent,
    getProjectFiles,
    getProjectFolders,
    renameProjectFile,
    renameProjectFolder,
    relocateProjectFile,
    relocateProjectFolder,
    updateProject,
    updateProjectFileContent,
    type CreateProjectFileData,
    type CreateProjectFolderData,
} from "@/lib/project.api";
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

export const useUpdateProjectFile = (projectId : string, fileId: string) =>{

    const queryClient = useQueryClient();

    return useMutation({
        mutationKey : ["projects", projectId, "files", fileId, "Update"],
        mutationFn : (content : string) => updateProjectFileContent(projectId, fileId, content),

        onSuccess : ()=>{
            queryClient.invalidateQueries({
                queryKey : ["projects", projectId, "files", fileId]
            })
        }
    }
)
}

export const useGetProjectFolders = (projectId: string) => {
    return useQuery({
        queryKey: ["projects", projectId, "folders"],
        queryFn: () => getProjectFolders(projectId),
        enabled: !!projectId,
    });
};

export const useCreateProjectFolder = (projectId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["projects", projectId, "folders", "create"],
        mutationFn: (data: CreateProjectFolderData) => createProjectFolder(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["projects", projectId, "folders"],
            });
            queryClient.invalidateQueries({
                queryKey: ["projects", projectId, "files"],
            });
        },
    });
};

export const useRenameProjectFolder = (projectId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["projects", projectId, "folders", "rename"],
        mutationFn: ({ folderId, name }: { folderId: string; name: string }) =>
            renameProjectFolder(projectId, folderId, name),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["projects", projectId, "folders"],
            });
            queryClient.invalidateQueries({
                queryKey: ["projects", projectId, "files"],
            });
        },
    });
};

export const useCreateProjectFile = (projectId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["projects", projectId, "files", "create"],
        mutationFn: (data: CreateProjectFileData) => createProjectFile(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["projects", projectId, "files"],
            });
        },
    });
};

export const useRenameProjectFile = (projectId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["projects", projectId, "files", "rename"],
        mutationFn: ({ fileId, name }: { fileId: string; name: string }) =>
            renameProjectFile(projectId, fileId, name),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["projects", projectId, "files"],
            });
        },
    });
};

export const useRelocateProjectFile = (projectId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["projects", projectId, "files", "relocate"],
        mutationFn: ({ fileId, folderId }: { fileId: string; folderId: string }) =>
            relocateProjectFile(projectId, fileId, folderId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["projects", projectId, "files"],
            });
        },
    });
};

export const useDeleteProjectFile = (projectId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["projects", projectId, "files", "delete"],
        mutationFn: (fileId: string) => deleteProjectFile(projectId, fileId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["projects", projectId, "files"],
            });
        },
    });
};

export const useRelocateProjectFolder = (projectId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["projects", projectId, "folders", "relocate"],
        mutationFn: ({
            folderId,
            parentFolderId,
        }: {
            folderId: string;
            parentFolderId: string;
        }) => relocateProjectFolder(projectId, folderId, parentFolderId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["projects", projectId, "folders"],
            });
            queryClient.invalidateQueries({
                queryKey: ["projects", projectId, "files"],
            });
        },
    });
};

export const useDeleteProjectFolder = (projectId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["projects", projectId, "folders", "delete"],
        mutationFn: (folderId: string) => deleteProjectFolder(projectId, folderId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["projects", projectId, "folders"],
            });
            queryClient.invalidateQueries({
                queryKey: ["projects", projectId, "files"],
            });
        },
    });
};