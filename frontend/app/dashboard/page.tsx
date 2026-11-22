import DashboardView from "@/components/dashboard/DashboardView";
import Navbar from "@/components/layout/Navbar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <DashboardView />
    </div>
  );
}
