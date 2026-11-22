import AmbientBackground from "@/components/landing/AmbientBackground";
import LandingExperience from "@/components/landing/LandingExperience";
import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AmbientBackground />
      <div className="relative z-10">
        <Navbar />
        <LandingExperience />
      </div>
    </div>
  );
}
