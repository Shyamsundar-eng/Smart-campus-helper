import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import GlassNavigation from "@/components/GlassNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Clock, 
  Plus,
  Bell,
  CheckCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  CalendarPlus
} from "lucide-react";

// Mock reminders data
const mockReminders = [
  {
    id: "1",
    title: "CS101 Assignment Due",
    description: "Complete the data structures assignment and submit on portal",
    dueDate: "2024-01-18",
    dueTime: "23:59",
    priority: "high",
    status: "pending",
    type: "assignment",
    course: "Computer Science"
  },
  {
    id: "2",
    title: "Physics Midterm Exam", 
    description: "Thermodynamics and mechanics chapters 1-5",
    dueDate: "2024-01-20",
    dueTime: "14:00",
    priority: "high",
    status: "pending",
    type: "exam",
    course: "Physics"
  },
  {
    id: "3",
    title: "Math Study Group",
    description: "Weekly calculus study session in library room 201",
    dueDate: "2024-01-19",
    dueTime: "16:00",
    priority: "medium",
    status: "pending", 
    type: "study",
    course: "Mathematics"
  },
  {
    id: "4",
    title: "Lab Report Submission",
    description: "Chemistry lab experiment analysis and conclusions",
    dueDate: "2024-01-17",
    dueTime: "18:00",
    priority: "medium",
    status: "completed",
    type: "assignment",
    course: "Chemistry"
  }
];

const Reminders = () => {
  const [activeSection, setActiveSection] = useState(2);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    priority: "medium",
    type: "assignment",
    course: ""
  });

  const filteredReminders = mockReminders.filter(reminder => {
    if (filter === "all") return true;
    if (filter === "pending") return reminder.status === "pending";
    if (filter === "completed") return reminder.status === "completed";
    if (filter === "today") {
      const today = new Date().toISOString().split('T')[0];
      return reminder.dueDate === today;
    }
    return true;
  });

  const handleAddReminder = () => {
    toast({
      title: "Reminder Added!",
      description: "Your reminder has been saved and synced with Google Calendar.",
    });
    setShowAddForm(false);
    setNewReminder({
      title: "",
      description: "", 
      dueDate: "",
      dueTime: "",
      priority: "medium",
      type: "assignment",
      course: ""
    });
  };

  const syncWithGoogleCalendar = () => {
    toast({
      title: "Syncing with Google Calendar",
      description: "All reminders will be added to your Google Calendar.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-400 bg-red-400/10";
      case "medium": return "text-yellow-400 bg-yellow-400/10";
      case "low": return "text-green-400 bg-green-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "exam": return <AlertCircle size={16} />;
      case "assignment": return <Calendar size={16} />;
      case "study": return <Clock size={16} />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-32">
      {/* Header */}
      <header className="pt-8 pb-6">
        <div className="container mx-auto px-6">
          <div className="text-center animate-fade-in mb-6">
            <h1 className="text-4xl font-bold mb-2 neon-text">
              Smart Reminders
            </h1>
            <p className="text-muted-foreground text-lg">
              Never miss a deadline with AI-powered scheduling
            </p>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Button 
                className="flex-1 bg-gradient-primary neon"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus size={16} className="mr-2" />
                Add Reminder
              </Button>
              <Button 
                variant="outline"
                className="flex-1 border-primary/30 hover:border-primary/60"
                onClick={syncWithGoogleCalendar}
              >
                <CalendarPlus size={16} className="mr-2" />
                Sync with Google Calendar
              </Button>
            </div>
          </div>

          {/* Add Reminder Form */}
          {showAddForm && (
            <div className="glass rounded-2xl p-6 mb-6 animate-slide-up">
              <h3 className="text-xl font-semibold mb-4">Add New Reminder</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Reminder title"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    placeholder="Description (optional)"
                    value={newReminder.description}
                    onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <Input
                  type="date"
                  value={newReminder.dueDate}
                  onChange={(e) => setNewReminder({...newReminder, dueDate: e.target.value})}
                  className="bg-background/50 border-border/50"
                />
                <Input
                  type="time"
                  value={newReminder.dueTime}
                  onChange={(e) => setNewReminder({...newReminder, dueTime: e.target.value})}
                  className="bg-background/50 border-border/50"
                />
                <Input
                  placeholder="Course"
                  value={newReminder.course}
                  onChange={(e) => setNewReminder({...newReminder, course: e.target.value})}
                  className="bg-background/50 border-border/50"
                />
                <select 
                  className="px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground"
                  value={newReminder.priority}
                  onChange={(e) => setNewReminder({...newReminder, priority: e.target.value})}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="flex gap-4 mt-6">
                <Button onClick={handleAddReminder} className="bg-gradient-primary neon">
                  Save Reminder
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "today", label: "Today" },
              { key: "completed", label: "Completed" }
            ].map(({ key, label }) => (
              <Badge
                key={key}
                variant={filter === key ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-300 ${
                  filter === key 
                    ? 'bg-primary text-primary-foreground neon' 
                    : 'hover:bg-primary/10 hover:border-primary/50'
                }`}
                onClick={() => setFilter(key)}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6">
        <div className="animate-slide-up">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-xl p-4 text-center">
              <Calendar className="mx-auto mb-2 text-primary" size={24} />
              <div className="text-2xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Clock className="mx-auto mb-2 text-accent" size={24} />
              <div className="text-2xl font-bold text-accent">3</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <AlertCircle className="mx-auto mb-2 text-red-400" size={24} />
              <div className="text-2xl font-bold text-red-400">2</div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <CheckCircle className="mx-auto mb-2 text-green-400" size={24} />
              <div className="text-2xl font-bold text-green-400">15</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>

          {/* Reminders List */}
          {filteredReminders.length > 0 ? (
            <div className="space-y-4">
              {filteredReminders.map((reminder, index) => (
                <Card
                  key={reminder.id}
                  className={`campus-card ${reminder.status === 'completed' ? 'opacity-60' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-primary">
                            {getTypeIcon(reminder.type)}
                          </div>
                          <CardTitle className={`text-xl ${reminder.status === 'completed' ? 'line-through' : ''}`}>
                            {reminder.title}
                          </CardTitle>
                          <Badge className={getPriorityColor(reminder.priority)}>
                            {reminder.priority}
                          </Badge>
                          {reminder.status === 'completed' && (
                            <CheckCircle className="text-green-400" size={20} />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {reminder.dueDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {reminder.dueTime}
                          </span>
                          <Badge variant="outline">{reminder.course}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <ExternalLink size={16} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground">{reminder.description}</p>
                    
                    {reminder.status === "pending" && (
                      <div className="mt-4">
                        <Button 
                          size="sm" 
                          className="bg-gradient-primary neon"
                          onClick={() => toast({
                            title: "Reminder Completed!",
                            description: "Great job staying on top of your tasks!",
                          })}
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Mark Complete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Calendar className="mx-auto mb-4 text-muted-foreground" size={64} />
              <h3 className="text-2xl font-semibold mb-2">No reminders found</h3>
              <p className="text-muted-foreground mb-6">
                Add your first reminder to stay organized
              </p>
              <Button 
                className="bg-gradient-primary neon"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={16} className="mr-2" />
                Add Your First Reminder
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Glass Navigation */}
      <GlassNavigation 
        activeIndex={activeSection} 
        onNavigationChange={setActiveSection} 
      />
    </div>
  );
};

export default Reminders;