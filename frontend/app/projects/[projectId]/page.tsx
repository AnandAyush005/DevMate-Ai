
import TestButton from "@/components/projects/AuthTest";
import { useUpdateProject } from "@/hooks/useProjects";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;


  return (
    <div>
      <h1>Project Workspace</h1>
      <p>Project ID: {projectId}</p>

      <TestButton projectId={projectId} />
    </div>
  );
}