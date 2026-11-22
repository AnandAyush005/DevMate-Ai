"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger, DialogHeader, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";
import { useCreateProject } from "@/hooks/useProjects";
import { toast } from "sonner";
import { Plus } from "lucide-react";


export default function CreateProjectButton() {

    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [open, setOpen] = useState(false);

    const { mutate, isPending } = useCreateProject();

    const handleCreateProject = () => {

        if(projectName.trim() === "") {
            toast.error("Project name cannot be empty..")
            return;
        }
        
        mutate({
           name : projectName.trim(),
           description : projectDescription.trim()
        }, {
            onSuccess : () => {
                setProjectName("");
                setProjectDescription("");
                setOpen(false);

                toast.success("Project is sucessfully created");
            },

            onError : ()=>{
                toast.error("Error while creating this project..");
            }
        }, 
            
        )

        
    }
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#000102]">
                    <Plus className="size-4 transition-transform group-hover:rotate-90" />
                    New project
            </DialogTrigger>
            <DialogContent className="border border-[#1b2732] bg-[#101820] text-slate-100 sm:max-w-md">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-xl">Create a project</DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-slate-400">
                    Give your next idea a dedicated place to grow.
                </DialogDescription>

                <div className="space-y-3">
                    <Input className="border-[#1b2732] bg-[#000102] text-slate-100 placeholder:text-slate-500 focus-visible:border-violet-300/40" placeholder="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                    <Input className="border-[#1b2732] bg-[#000102] text-slate-100 placeholder:text-slate-500 focus-visible:border-violet-300/40" placeholder="Project description (optional)" value={projectDescription} onChange={(e)=> setProjectDescription(e.target.value)} />
                </div>

                <Button className="mt-1 h-10 w-full rounded-lg bg-primary font-semibold text-white hover:bg-violet-400" disabled={isPending} onClick={handleCreateProject}>
                    {isPending ? "Creating..." : "Create project"}
                </Button>
            </DialogContent>
        </Dialog>
    )
}