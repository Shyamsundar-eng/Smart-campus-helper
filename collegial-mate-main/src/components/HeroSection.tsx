import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/campus-hero.jpg";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Smart Campus" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="text-primary animate-glow-pulse" size={24} />
            <span className="text-primary font-medium">Smart Campus Helper</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 neon-text">
            Your Digital
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Campus </span>
            Companion
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your academic life with AI-powered notes, smart reminders, 
            and instant access to campus resources.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="bg-gradient-primary hover:animate-glow-pulse text-lg px-8 py-6 rounded-2xl neon"
            >
              Get Started
              <ArrowRight className="ml-2" size={20} />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 rounded-2xl border-primary/30 hover:border-primary/60 hover:bg-primary/10"
            >
              Learn More
            </Button>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-xl animate-float" />
        <div className="absolute -bottom-20 -right-20 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
    </section>
  );
};

export default HeroSection;