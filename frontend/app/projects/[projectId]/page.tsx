import ProjectWorkspace from "../../../components/projects/Project"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const id = projectId as string;

  return (
    <div>
      <ProjectWorkspace projectId={id} />
    </div>
  );
}