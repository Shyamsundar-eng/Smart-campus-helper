import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import HeroSection from "@/components/HeroSection";
import GlassNavigation, { NeonFAB } from "@/components/GlassNavigation";
import CampusCard from "@/components/CampusCard";
import { 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  Upload,
  Brain,
  Users,
  Clock,
  Trophy
} from "lucide-react";

const Index = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [showHero, setShowHero] = useState(true);

  const handleGetStarted = () => {
    window.location.href = '/dashboard';
  };

  const handleUpload = () => {
    toast({
      title: "Upload Feature",
      description: "Document upload coming soon!",
    });
  };

  const handleQuiz = () => {
    toast({
      title: "Quiz Feature", 
      description: "AI-powered quiz generation coming soon!",
    });
  };

  if (showHero) {
    return <HeroSection onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero pb-32">
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="animate-slide-up">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 neon-text">
              Smart Campus Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Everything you need for academic success
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <CampusCard
              icon={BookOpen}
              title="Smart Notes"
              description="AI-powered note organization and search"
            >
              <div className="space-y-2">
                <div className="h-2 bg-primary/20 rounded-full">
                  <div className="h-2 bg-primary rounded-full w-3/4"></div>
                </div>
                <p className="text-sm text-muted-foreground">23 notes this week</p>
              </div>
            </CampusCard>

            <CampusCard
              icon={Calendar}
              title="Smart Reminders" 
              description="Never miss an assignment or exam"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  <span className="text-sm">3 upcoming deadlines</span>
                </div>
                <div className="text-xs text-muted-foreground">Next: CS101 Assignment</div>
              </div>
            </CampusCard>

            <CampusCard
              icon={MessageSquare}
              title="Campus Chat"
              description="Connect with classmates and professors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  <span className="text-sm">5 active conversations</span>
                </div>
                <div className="text-xs text-muted-foreground">Latest: Study Group Discussion</div>
              </div>
            </CampusCard>

            <CampusCard
              icon={Upload}
              title="Document Upload"
              description="Scan and organize lecture materials"
              className="md:col-span-2"
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">127</div>
                  <div className="text-xs text-muted-foreground">Documents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">8</div>
                  <div className="text-xs text-muted-foreground">Subjects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-blue">15GB</div>
                  <div className="text-xs text-muted-foreground">Storage Used</div>
                </div>
              </div>
            </CampusCard>

            <CampusCard
              icon={Brain}
              title="AI Quiz Generator"
              description="Create practice quizzes from your notes"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-accent" />
                  <span className="text-sm">87% avg score</span>
                </div>
                <div className="text-xs text-muted-foreground">12 quizzes completed</div>
              </div>
            </CampusCard>
          </div>
        </div>
      </main>

      {/* Glass Navigation */}
      <GlassNavigation 
        activeIndex={activeSection} 
        onNavigationChange={setActiveSection} 
      />
      
      {/* Neon FAB */}
      <NeonFAB 
        onUploadClick={handleUpload}
        onQuizClick={handleQuiz}
      />
    </div>
  );
};

export default Index;
