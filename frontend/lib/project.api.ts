import api from "@/lib/api"

export type ProjectCredentials = {
    name : string,
    description ?: string
}

export type UpdateProjectCredentials = ProjectCredentials & {
    projectId : string
}

export const getProject = async ()=>{
    const response = await api.get('/projects')
    return response.data;
}

export const createProjects = async (data : ProjectCredentials)=>{
    const response = await api.post('/projects', data);
    return response.data;
}

export const updateProject = async ({
    projectId,
    name,
    description
} : UpdateProjectCredentials) => {
    const response = await api.patch(`/projects/${projectId}`, {
        name, description
    });
    return response.data;
}
