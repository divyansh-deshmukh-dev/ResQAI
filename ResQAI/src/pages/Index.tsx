import DashboardLayout from "@/components/DashboardLayout";
import LiveAlerts from "@/components/LiveAlerts";
import AIChatbot from "@/components/AIChatbot";
import AnnouncementsFeed from "@/components/AnnouncementsFeed";
import EmergencySOS from "@/components/EmergencySOS";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-lg border border-primary/20">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to ResQAI Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time disaster monitoring and response system
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - Alerts */}
          <div className="lg:col-span-2">
            <LiveAlerts />
          </div>

          {/* Right column - Chatbot and Announcements */}
          <div className="space-y-6">
            <AIChatbot />
            <AnnouncementsFeed />
          </div>
        </div>
      </div>

      {/* Emergency SOS Button */}
      <EmergencySOS />
    </DashboardLayout>
  );
};

export default Index;
