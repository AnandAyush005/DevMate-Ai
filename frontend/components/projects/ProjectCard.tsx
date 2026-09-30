"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { CalendarDays, FolderGit2, Pencil, Save } from "lucide-react";
import { Project } from "./ProjectsList";
import { useRouter } from "next/navigation";
import { useState }  from "react";
import { useDeleteProject, useUpdateProject } from "@/hooks/useProjects";
import { Input } from "../ui/input";
import { toast } from "sonner";
import  axios  from "axios";
import { Trash } from "lucide-react"


type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const createdDate = new Date(project.createdAt).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [projectDescription, setProjectDescription] = useState(project.description);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {mutate, isPending} = useUpdateProject();
  const {mutate : deleteProject, isPending : isDeleting} = useDeleteProject();

  return (
    <Card className="group cursor-pointer border-zinc-800 bg-zinc-950 transition-all duration-200 hover:-translate-y-1 hover:border-zinc-600 hover:shadow-lg " onClick={isEditing ? (e)=>e.stopPropagation : ()=>router.push(`/projects/${project.id}`)}>
      <CardHeader>

        <div className="mb-2 flex h-5 w-full rounded-lg justify-between">
          <FolderGit2 className=" text-zinc-300  " />
          <Trash className=" text-zinc-300" onClick={(e)=>{
            e.stopPropagation();
            setDeleteDialogOpen(true);
          }} /> 
        </div>

        {isEditing ? 
          <Input 
            className=" py-1 text-white px-3" 
            placeholder="Project Name" 
            value={projectName} 
            onChange={(e)=>setProjectName(e.target.value)} 
            onClick={(e)=> e.stopPropagation()}/> 
          : <CardTitle className="truncate text-lg text-white ">
          {project.name}
        </CardTitle>}

        {isEditing ? 
          <Input  
            className=" py-1 text-white px-3 " 
            placeholder="Project Description (optional) " 
            value={projectDescription} 
            onChange={(e)=>setProjectDescription(e.target.value)} 
            onClick={(e)=> e.stopPropagation()}/> 

          : <CardDescription className="line-clamp-2 min-h-10 text-zinc-400">
          {project.description || "No description provided"}
        </CardDescription>}
        
      </CardHeader>

      <CardContent className="flex">
        <div className="flex items-center gap-2 text-sm text-zinc-500 flex-1">
          <CalendarDays className="h-4 w-4" />
          <span>Created {createdDate}</span>
        </div>

        {isEditing ? 
          <button disabled={isPending}
            className="cursor-pointer disabled:cursor-not-allowed"
            onClick={(e)=>{
              e.stopPropagation();

              if(projectName.trim() === ""){
                toast.error("Project name cannot be empty");
                return;
              }

              mutate({
                projectId : project.id,
                name : projectName.trim(),
                description : projectDescription?.trim()
            },
             {

              onSuccess : ()=>{
                setIsEditing(false);
                toast.success("Project is updated");
              },

              onError: (error) => {
                if (axios.isAxiosError(error)) {
                  toast.error(error.response?.data?.error?.message || "Failed to update project");
                  return;
                }

                toast.error("Failed to update project");
              }
             }
            
            )
            }}>
              {isPending ? '...' : <Save className="w-5 h-5  text-zinc-500" />}
          </button>
        : <button className="cursor-pointer" onClick={(e)=>{
            e.stopPropagation();
            setIsEditing(true);
          }}>
          <Pencil className="h-5 w-5  text-zinc-500 "/>
        </button>
        }
      </CardContent>

      <Dialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Project?</DialogTitle>

      <DialogDescription>
        Are you sure you want to delete "{project.name}"?
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>

    <div className="flex justify-end gap-3">
      <button
        className="rounded-md border px-4 py-2"
        onClick={(e) => (
          e.stopPropagation(),
          setDeleteDialogOpen(false))}
      >
        Cancel
      </button>

      <button
            className="rounded-md bg-red-600 px-4 py-2 text-white"
            onClick={(e) => {
              e.stopPropagation(),
              deleteProject({ projectId: project.id }
                , {
                  onSuccess : ()=>{
                    setDeleteDialogOpen(false);
                    toast.success("Project is successfully deleted");
                  }, 

                  onError : (error)=>{
                    if (axios.isAxiosError(error)) {
                      toast.error(error.response?.data?.error?.message || "Failed to delete project");
                      return;
                    }

                    toast.error("Failed to update project");
                  }
                }
              );
            }}
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
    </Card>
  );
}