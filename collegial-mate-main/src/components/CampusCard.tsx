import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CampusCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const CampusCard = ({ 
  icon: Icon, 
  title, 
  description, 
  children, 
  className = "",
  onClick 
}: CampusCardProps) => {
  return (
    <Card 
      className={`campus-card rounded-2xl cursor-pointer ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Icon size={24} />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

export default CampusCard;