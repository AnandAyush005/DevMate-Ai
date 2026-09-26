"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger, DialogHeader, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";


export default function CreateProjectButton() {

    const [projectName, setProjectName] = useState("");

    const handleCreateProject = () => {
        if(projectName.trim() === "") {
            alert("Project name cannot be empty.");
            return;
        }
        console.log("Creating project:", projectName);
    }
    
    

    return (
        <Dialog>
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
                <Button className="px-10 py-2 font-bold cursor-pointer mt-4" onClick={handleCreateProject}>
                    Create
                </Button>
            </DialogContent>
        </Dialog>
    )
}