"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger, DialogHeader, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";
import { useCreateProject } from "@/hooks/useProjects";


export default function CreateProjectButton() {

    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [open, setOpen] = useState(false);

    const { mutate, isPending } = useCreateProject();

    const handleCreateProject = () => {

        if(projectName.trim() === "") {
            alert("Project name cannot be empty.");
            return;
        }
        
        mutate({
           name : projectName,
           description : projectDescription
        }, {
            onSuccess : () => {
                setProjectName("");
                setProjectDescription("");
                setOpen(false);
            }
        })

        
    }
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="px-10 py-2 font-bold cursor-pointer border rounded-xl">
                    Create Project
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Project</DialogTitle> 
                </DialogHeader>
                <DialogDescription>
                    Fill out the form below to create a new project.
                </DialogDescription>

                <Input placeholder="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                <Input placeholder="Project description (optional)" value={projectDescription} onChange={(e)=> setProjectDescription(e.target.value)} />

                <Button className="px-10 py-2 font-bold cursor-pointer mt-4" disabled={isPending} onClick={handleCreateProject}>
                    {isPending ? "Creating..." : "Create"}
                </Button>
            </DialogContent>
        </Dialog>
    )
}