import Navbar from "@/components/layout/Navbar";
import CreateProjectButton from "@/components/projects/CreateProjectButton";
import GetProjects from "@/components/projects/ProjectsList";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col gap-4 bg-black text-white">
      <Navbar />
      
      <div className="flex flex-1 flex-col items-center justify-center gap-4">

          <h1 className="text-6xl font-bold">DevMate AI</h1>

          <p className="text-cyan-100">
            Your AI-powered developer workspace
          </p>

          <CreateProjectButton />

          <GetProjects />

      </div>
    </div>
  );
}