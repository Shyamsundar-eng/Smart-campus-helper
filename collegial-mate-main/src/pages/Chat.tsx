import { useState } from "react";
import GlassNavigation from "@/components/GlassNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot,
  User,
  Sparkles,
  FileText,
  Clock,
  MessageSquare
} from "lucide-react";

// Mock chat messages
const mockMessages = [
  {
    id: "1",
    type: "bot",
    content: "Hi! I'm your Smart Campus Assistant. I can help you with questions about your uploaded notes, study materials, and academic topics. What would you like to know?",
    timestamp: "10:30 AM",
    sources: []
  },
  {
    id: "2", 
    type: "user",
    content: "Can you explain the first law of thermodynamics from my physics notes?",
    timestamp: "10:32 AM"
  },
  {
    id: "3",
    type: "bot", 
    content: "Based on your Physics Chapter 5 notes, the first law of thermodynamics states that energy cannot be created or destroyed, only transferred or converted from one form to another. \n\nMathematically, it's expressed as: ΔU = Q - W\n\nWhere:\n- ΔU = change in internal energy\n- Q = heat added to the system\n- W = work done by the system\n\nThis law is fundamental to understanding heat engines and energy conservation in all thermal processes.",
    timestamp: "10:32 AM",
    sources: ["Physics Chapter 5 - Thermodynamics"]
  },
  {
    id: "4",
    type: "user",
    content: "What about Carnot engines?", 
    timestamp: "10:35 AM"
  },
  {
    id: "5",
    type: "bot",
    content: "Great question! From your notes, a Carnot engine is an idealized heat engine that operates on the Carnot cycle. It represents the most efficient possible heat engine operating between two thermal reservoirs.\n\nKey points:\n• It consists of two isothermal and two adiabatic processes\n• Its efficiency depends only on the temperatures of the hot and cold reservoirs\n• Efficiency = 1 - (T_cold/T_hot)\n• No real engine can be more efficient than a Carnot engine\n\nWould you like me to explain any specific aspect in more detail?",
    timestamp: "10:35 AM", 
    sources: ["Physics Chapter 5 - Thermodynamics"]
  }
];

const Chat = () => {
  const [activeSection, setActiveSection] = useState(3);
  const [messages, setMessages] = useState(mockMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: "user" as const,
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: "bot" as const,
        content: "I understand you're asking about that topic. Based on your uploaded notes, I can provide relevant information. However, this is a demo version, so I'm showing sample responses. In the full version, I would analyze your specific notes using Gemini AI to provide accurate, personalized answers.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: ["Your uploaded notes"]
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-32 flex flex-col">
      {/* Header */}
      <header className="pt-8 pb-6">
        <div className="container mx-auto px-6">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 neon-text">
              Smart Assistant
            </h1>
            <p className="text-muted-foreground text-lg">
              Ask questions about your notes and get AI-powered answers
            </p>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="container mx-auto px-6 mb-6">
        <div className="glass rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <FileText className="text-primary" size={20} />
              <div>
                <div className="text-lg font-semibold">127</div>
                <div className="text-sm text-muted-foreground">Notes Indexed</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MessageSquare className="text-accent" size={20} />
              <div>
                <div className="text-lg font-semibold">2,450</div>
                <div className="text-sm text-muted-foreground">Questions Answered</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="text-neon-blue" size={20} />
              <div>
                <div className="text-lg font-semibold">98%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-6 flex flex-col">
        <div className="flex-1 glass rounded-2xl p-6 mb-6 flex flex-col">
          {/* Messages */}
          <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[60vh]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-fade-in ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'bot' && (
                  <Avatar className="w-8 h-8 bg-primary/20 border border-primary/30">
                    <AvatarFallback>
                      <Bot size={16} className="text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                  <Card className={`${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground border-primary/50' 
                      : 'bg-card/80 backdrop-blur border-border/50'
                  }`}>
                    <CardContent className="p-4">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <p className="text-xs text-muted-foreground mb-2">Sources:</p>
                          <div className="flex flex-wrap gap-1">
                            {message.sources.map((source, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock size={10} />
                          {message.timestamp}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {message.type === 'user' && (
                  <Avatar className="w-8 h-8 bg-secondary border border-border">
                    <AvatarFallback>
                      <User size={16} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <Avatar className="w-8 h-8 bg-primary/20 border border-primary/30">
                  <AvatarFallback>
                    <Bot size={16} className="text-primary" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-card/80 backdrop-blur border-border/50">
                  <CardContent className="p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border/30 pt-4">
            <div className="flex gap-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your notes..."
                className="flex-1 bg-background/50 border-border/50"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-primary neon"
              >
                <Send size={16} />
              </Button>
            </div>
            
            {/* Suggested Questions */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs"
                onClick={() => setInputMessage("Summarize my latest physics notes")}
              >
                Summarize my latest physics notes
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs"
                onClick={() => setInputMessage("Create a study plan for my upcoming exams")}
              >
                Create a study plan for exams
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs"
                onClick={() => setInputMessage("Explain calculus integration methods")}
              >
                Explain calculus methods
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Glass Navigation */}
      <GlassNavigation 
        activeIndex={activeSection} 
        onNavigationChange={setActiveSection} 
      />
    </div>
  );
};

export default Chat;