import api from "@/lib/api"

export type ProjectCredentials = {
    name : string,
    description ?: string
}

export const getProject = async ()=>{
    const response = await api.get('/projects')
    return response.data;
}

export const createProjects = async (data : ProjectCredentials)=>{
    const response = await api.post('/projects', data);
    return response.data;
}
