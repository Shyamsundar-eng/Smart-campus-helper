import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import GlassNavigation from "@/components/GlassNavigation";
import CampusCard from "@/components/CampusCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  Search,
  Eye,
  Download,
  Trash2,
  Camera,
  Scan,
  Brain,
  Clock,
  BookOpen
} from "lucide-react";

// Mock notes data
const mockNotes = [
  {
    id: "1",
    title: "Physics Chapter 5 - Thermodynamics",
    subject: "Physics",
    uploadDate: "2024-01-15",
    summary: "Covers laws of thermodynamics, heat engines, and entropy. Key concepts include Carnot cycle and efficiency calculations.",
    pages: 12,
    processingStatus: "completed",
    ocrAccuracy: 94
  },
  {
    id: "2",
    title: "Calculus Integration Methods",
    subject: "Mathematics", 
    uploadDate: "2024-01-14",
    summary: "Comprehensive notes on integration techniques including substitution, integration by parts, and partial fractions.",
    pages: 8,
    processingStatus: "completed",
    ocrAccuracy: 98
  },
  {
    id: "3",
    title: "Chemistry Lab Report Template",
    subject: "Chemistry",
    uploadDate: "2024-01-13",
    summary: "Currently processing OCR and AI summarization...",
    pages: 6,
    processingStatus: "processing",
    ocrAccuracy: 0
  }
];

const Notes = () => {
  const [activeSection, setActiveSection] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");

  const subjects = ["All", "Physics", "Mathematics", "Chemistry", "Computer Science"];

  const filteredNotes = mockNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All" || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleUpload = (type: 'camera' | 'file') => {
    toast({
      title: `Upload via ${type === 'camera' ? 'Camera' : 'File'}`,
      description: "OCR processing will begin automatically after upload.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-32">
      {/* Header */}
      <header className="pt-8 pb-6">
        <div className="container mx-auto px-6">
          <div className="text-center animate-fade-in mb-6">
            <h1 className="text-4xl font-bold mb-2 neon-text">
              Smart Notes
            </h1>
            <p className="text-muted-foreground text-lg">
              AI-powered OCR and note summarization
            </p>
          </div>

          {/* Upload Section */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="text-primary" size={20} />
              Upload New Notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                className="h-20 bg-gradient-primary neon flex-col gap-2"
                onClick={() => handleUpload('camera')}
              >
                <Camera size={24} />
                <span>Take Photo</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 border-primary/30 hover:border-primary/60 flex-col gap-2"
                onClick={() => handleUpload('file')}
              >
                <Scan size={24} />
                <span>Upload PDF/Image</span>
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="glass rounded-2xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <Input
                  placeholder="Search your notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
            </div>
            
            {/* Subject Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {subjects.map((subject) => (
                <Badge
                  key={subject}
                  variant={selectedSubject === subject ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedSubject === subject 
                      ? 'bg-primary text-primary-foreground neon' 
                      : 'hover:bg-primary/10 hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedSubject(subject)}
                >
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Notes Grid */}
      <main className="container mx-auto px-6">
        <div className="animate-slide-up">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-xl p-4 text-center">
              <FileText className="mx-auto mb-2 text-primary" size={24} />
              <div className="text-2xl font-bold text-primary">127</div>
              <div className="text-sm text-muted-foreground">Total Notes</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Brain className="mx-auto mb-2 text-accent" size={24} />
              <div className="text-2xl font-bold text-accent">94%</div>
              <div className="text-sm text-muted-foreground">OCR Accuracy</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <BookOpen className="mx-auto mb-2 text-neon-blue" size={24} />
              <div className="text-2xl font-bold text-neon-blue">8</div>
              <div className="text-sm text-muted-foreground">Subjects</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Clock className="mx-auto mb-2 text-primary-glow" size={24} />
              <div className="text-2xl font-bold text-primary-glow">15GB</div>
              <div className="text-sm text-muted-foreground">Storage</div>
            </div>
          </div>

          {/* Notes List */}
          {filteredNotes.length > 0 ? (
            <div className="space-y-4">
              {filteredNotes.map((note, index) => (
                <Card
                  key={note.id}
                  className="campus-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{note.title}</CardTitle>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline">{note.subject}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {note.pages} pages • Uploaded {note.uploadDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {note.processingStatus === "processing" ? (
                          <Badge variant="secondary" className="animate-pulse">
                            Processing...
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">
                            Ready
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{note.summary}</p>
                    
                    {note.processingStatus === "processing" ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>OCR Processing...</span>
                          <span>73%</span>
                        </div>
                        <Progress value={73} className="h-2" />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-muted-foreground">
                            OCR Accuracy: <span className="text-primary font-medium">{note.ocrAccuracy}%</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye size={16} className="mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Download size={16} className="mr-2" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <FileText className="mx-auto mb-4 text-muted-foreground" size={64} />
              <h3 className="text-2xl font-semibold mb-2">No notes found</h3>
              <p className="text-muted-foreground mb-6">
                Upload your first document to get started with AI-powered note processing
              </p>
              <Button 
                className="bg-gradient-primary neon"
                onClick={() => handleUpload('file')}
              >
                <Upload size={16} className="mr-2" />
                Upload Your First Note
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

export default Notes;