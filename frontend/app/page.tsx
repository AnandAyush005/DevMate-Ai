import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col gap-4 bg-black text-white">
      <Navbar />
      
      <div className="flex flex-1 flex-col items-center justify-center gap-4">

          <h1 className="text-6xl font-bold">DevMate AI</h1>

          <p className="text-cyan-100">
            Your AI-powered developer workspace
          </p>

          <Button className="px-10 py-2 font-bold">
            Create Project
          </Button>

      </div>
    </div>
  );
}