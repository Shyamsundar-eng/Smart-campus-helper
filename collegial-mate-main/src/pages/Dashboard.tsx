import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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
  Trophy,
  ShoppingBag,
  TrendingUp,
  FileText,
  Plus
} from "lucide-react";

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [healthStatus, setHealthStatus] = useState<string | null>(null);

  // Example: Fetch backend health status on mount
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealthStatus(data.status || 'Unknown'))
      .catch(() => setHealthStatus('Error'));
  }, []);
  const navigate = useNavigate();

  const handleUpload = () => {
    navigate('/notes');
    toast({
      title: "Upload Notes",
      description: "Let's upload and process your study materials!",
    });
  };

  const handleQuiz = () => {
    navigate('/quiz');
    toast({
      title: "AI Quiz Generator", 
      description: "Generate smart quizzes from your notes!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-32">
      {/* Header */}
      <header className="pt-8 pb-4">
        {/* Example API status from backend */}
        <div className="text-center mb-2">
          <span className="text-xs text-muted-foreground">Backend status: </span>
          <span className={`text-xs font-bold ${healthStatus === 'OK' ? 'text-green-500' : 'text-red-500'}`}>{healthStatus || '...'}</span>
        </div>
        <div className="container mx-auto px-6">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 neon-text">
              Smart Campus Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Everything you need for academic success
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6">
        <div className="animate-slide-up">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-2xl p-4 text-center">
              <FileText className="mx-auto mb-2 text-primary" size={24} />
              <div className="text-2xl font-bold text-primary">127</div>
              <div className="text-sm text-muted-foreground">Notes</div>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <Calendar className="mx-auto mb-2 text-accent" size={24} />
              <div className="text-2xl font-bold text-accent">8</div>
              <div className="text-sm text-muted-foreground">Reminders</div>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <Trophy className="mx-auto mb-2 text-neon-blue" size={24} />
              <div className="text-2xl font-bold text-neon-blue">92%</div>
              <div className="text-sm text-muted-foreground">Quiz Score</div>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <TrendingUp className="mx-auto mb-2 text-primary-glow" size={24} />
              <div className="text-2xl font-bold text-primary-glow">15</div>
              <div className="text-sm text-muted-foreground">Streak Days</div>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CampusCard
              icon={BookOpen}
              title="Smart Notes"
              description="AI-powered OCR and summarization"
              onClick={() => navigate('/notes')}
            >
              <div className="space-y-2">
                <div className="h-2 bg-primary/20 rounded-full">
                  <div className="h-2 bg-primary rounded-full w-3/4 animate-pulse"></div>
                </div>
                <p className="text-sm text-muted-foreground">23 notes processed this week</p>
              </div>
            </CampusCard>

            <CampusCard
              icon={Brain}
              title="AI Quiz Generator"
              description="Generate MCQs and flashcards from notes"
              onClick={() => navigate('/quiz')}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-accent" />
                  <span className="text-sm">87% average score</span>
                </div>
                <div className="text-xs text-muted-foreground">12 quizzes completed</div>
              </div>
            </CampusCard>

            <CampusCard
              icon={Calendar}
              title="Smart Reminders" 
              description="Sync with Google Calendar"
              onClick={() => navigate('/reminders')}
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
              title="Smart Assistant"
              description="AI chatbot for your notes"
              onClick={() => navigate('/chat')}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  <span className="text-sm">Ask anything about your notes</span>
                </div>
                <div className="text-xs text-muted-foreground">Powered by Gemini AI</div>
              </div>
            </CampusCard>

            <CampusCard
              icon={ShoppingBag}
              title="Marketplace"
              description="Buy & sell second-hand items"
              onClick={() => navigate('/marketplace')}
              className="md:col-span-2"
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">247</div>
                  <div className="text-xs text-muted-foreground">Items Listed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">15</div>
                  <div className="text-xs text-muted-foreground">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-blue">89%</div>
                  <div className="text-xs text-muted-foreground">Happy Buyers</div>
                </div>
              </div>
            </CampusCard>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 glass rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                <Upload className="text-primary" size={16} />
                <div>
                  <p className="text-sm font-medium">Uploaded "Physics Chapter 5"</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                <Brain className="text-accent" size={16} />
                <div>
                  <p className="text-sm font-medium">Completed Math Quiz (Score: 94%)</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                <Plus className="text-neon-blue" size={16} />
                <div>
                  <p className="text-sm font-medium">Listed "Calculus Textbook" in Marketplace</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
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

export default Dashboard;