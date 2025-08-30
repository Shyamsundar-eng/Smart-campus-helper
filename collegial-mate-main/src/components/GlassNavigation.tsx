import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  FileText, 
  Calendar, 
  MessageCircle,
  ShoppingBag,
  Upload,
  Brain,
  Plus,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GlassNavigationProps {
  activeIndex: number;
  onNavigationChange: (index: number) => void;
}

const GlassNavigation = ({ activeIndex, onNavigationChange }: GlassNavigationProps) => {
  const navigate = useNavigate();

  const handleNavigation = (index: number, route: string) => {
    onNavigationChange(index);
    navigate(route);
  };

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-nav rounded-3xl px-6 py-3">
        <div className="flex items-center gap-2">
          <NavButton 
            icon={Home} 
            label="Dashboard" 
            active={activeIndex === 0} 
            onClick={() => handleNavigation(0, '/dashboard')}
          />
          <NavButton 
            icon={FileText} 
            label="Notes" 
            active={activeIndex === 1} 
            onClick={() => handleNavigation(1, '/notes')}
          />
          
          {/* Spacing for FAB */}
          <div className="w-16" />
          
          <NavButton 
            icon={Calendar} 
            label="Reminders" 
            active={activeIndex === 2} 
            onClick={() => handleNavigation(2, '/reminders')}
          />
          <NavButton 
            icon={MessageCircle} 
            label="Chat" 
            active={activeIndex === 3} 
            onClick={() => handleNavigation(3, '/chat')}
          />
          <NavButton 
            icon={ShoppingBag} 
            label="Marketplace" 
            active={activeIndex === 4} 
            onClick={() => handleNavigation(4, '/marketplace')}
          />
        </div>
      </div>
    </nav>
  );
};

interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavButton = ({ icon: Icon, label, active, onClick }: NavButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
        ${active 
          ? 'bg-primary/20 text-primary neon-text' 
          : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
        }
      `}
    >
      <Icon size={18} />
      {active && (
        <span className="text-sm font-medium animate-fade-in">{label}</span>
      )}
    </Button>
  );
};

interface NeonFABProps {
  onUploadClick: () => void;
  onQuizClick: () => void;
}

export const NeonFAB = ({ onUploadClick, onQuizClick }: NeonFABProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-[4.5rem] left-1/2 transform -translate-x-1/2 z-50">
      <div className="relative">
        {/* Action Buttons */}
        <div className={`
          absolute -top-24 left-1/2 transform -translate-x-1/2
          flex flex-col gap-3 transition-all duration-500
          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}>
          <ActionButton
            icon={Upload}
            label="Upload"
            onClick={() => {
              onUploadClick();
              setIsOpen(false);
            }}
          />
          <ActionButton
            icon={Brain}
            label="Quiz"
            onClick={() => {
              onQuizClick();
              setIsOpen(false);
            }}
          />
        </div>

        {/* Main FAB */}
        <Button
          size="lg"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-16 h-16 rounded-full bg-gradient-primary neon
            hover:animate-glow-pulse transition-all duration-300
            ${isOpen ? 'rotate-45' : 'hover:scale-110'}
          `}
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </Button>
      </div>
    </div>
  );
};

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

const ActionButton = ({ icon: Icon, label, onClick }: ActionButtonProps) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-foreground bg-card px-3 py-1 rounded-lg border border-border whitespace-nowrap">
        {label}
      </span>
      <Button
        size="sm"
        onClick={onClick}
        className="w-12 h-12 rounded-full bg-card border border-border hover:border-primary/50 hover:bg-primary/10 hover-glow"
      >
        <Icon size={18} />
      </Button>
    </div>
  );
};

export default GlassNavigation;