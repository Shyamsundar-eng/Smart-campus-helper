import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import GlassNavigation from "@/components/GlassNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Play, 
  Trophy,
  Clock,
  Target,
  BookOpen,
  CheckCircle,
  XCircle,
  RotateCcw,
  Star
} from "lucide-react";

// Mock quiz data
const mockQuizzes = [
  {
    id: "1",
    title: "Thermodynamics Fundamentals",
    subject: "Physics",
    questions: 15,
    difficulty: "Medium",
    bestScore: 87,
    attempts: 3,
    estimatedTime: "12 min",
    topics: ["Heat Engines", "Entropy", "Carnot Cycle"]
  },
  {
    id: "2", 
    title: "Integration Techniques",
    subject: "Mathematics",
    questions: 20,
    difficulty: "Hard", 
    bestScore: 94,
    attempts: 5,
    estimatedTime: "18 min",
    topics: ["Substitution", "By Parts", "Partial Fractions"]
  },
  {
    id: "3",
    title: "Organic Chemistry Basics",
    subject: "Chemistry",
    questions: 12,
    difficulty: "Easy",
    bestScore: null,
    attempts: 0,
    estimatedTime: "8 min",
    topics: ["Alkanes", "Functional Groups", "Nomenclature"]
  }
];

// Mock question for active quiz
const sampleQuestion = {
  id: 1,
  question: "What is the efficiency of a Carnot engine operating between temperatures of 400K and 300K?",
  options: [
    "25%",
    "33%", 
    "50%",
    "75%"
  ],
  correctAnswer: 0,
  explanation: "Efficiency = 1 - (T_cold/T_hot) = 1 - (300/400) = 1 - 0.75 = 0.25 = 25%"
};

const Quiz = () => {
  const [activeSection, setActiveSection] = useState(1);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [quizInProgress, setQuizInProgress] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);

  const startQuiz = (quizId: string) => {
    setSelectedQuiz(quizId);
    setQuizInProgress(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowAnswer(false);
    toast({
      title: "Quiz Started!",
      description: "Good luck with your quiz!",
    });
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowAnswer(true);
    
    if (answerIndex === sampleQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    setCurrentQuestion(currentQuestion + 1);
    setSelectedAnswer(null);
    setShowAnswer(false);
    
    // End quiz after sample question
    if (currentQuestion >= 0) {
      setQuizInProgress(false);
      toast({
        title: "Quiz Completed!",
        description: `You scored ${score + (selectedAnswer === sampleQuestion.correctAnswer ? 1 : 0)} out of 1 questions.`,
      });
    }
  };

  const generateNewQuiz = () => {
    toast({
      title: "Generating Quiz...",
      description: "AI is creating a new quiz from your notes!",
    });
  };

  if (quizInProgress) {
    return (
      <div className="min-h-screen bg-gradient-hero pb-32 flex items-center justify-center">
        <div className="container mx-auto px-6 max-w-2xl">
          <Card className="campus-card animate-fade-in">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Question {currentQuestion + 1} of 1</CardTitle>
                  <p className="text-muted-foreground">Thermodynamics Fundamentals</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  <span className="text-sm font-medium">2:34</span>
                </div>
              </div>
              <Progress value={(currentQuestion + 1) / 1 * 100} className="mt-4" />
            </CardHeader>
            
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">{sampleQuestion.question}</h3>
                
                <div className="space-y-3">
                  {sampleQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={`w-full justify-start p-4 h-auto text-left ${
                        selectedAnswer === index
                          ? index === sampleQuestion.correctAnswer
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : 'border-red-500 bg-red-500/10 text-red-400'
                          : showAnswer && index === sampleQuestion.correctAnswer
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : ''
                      }`}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-sm font-medium ${
                          selectedAnswer === index
                            ? index === sampleQuestion.correctAnswer
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-red-500 bg-red-500 text-white'
                            : showAnswer && index === sampleQuestion.correctAnswer
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-muted-foreground'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span>{option}</span>
                        {showAnswer && selectedAnswer === index && (
                          index === sampleQuestion.correctAnswer ? 
                            <CheckCircle className="ml-auto text-green-500" size={20} /> :
                            <XCircle className="ml-auto text-red-500" size={20} />
                        )}
                        {showAnswer && selectedAnswer !== index && index === sampleQuestion.correctAnswer && (
                          <CheckCircle className="ml-auto text-green-500" size={20} />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              {showAnswer && (
                <div className="bg-card/50 border border-border/50 rounded-lg p-4 mb-4 animate-fade-in">
                  <h4 className="font-medium text-primary mb-2">Explanation:</h4>
                  <p className="text-sm text-muted-foreground">{sampleQuestion.explanation}</p>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setQuizInProgress(false)}
                >
                  <XCircle size={16} className="mr-2" />
                  Exit Quiz
                </Button>
                {showAnswer && (
                  <Button 
                    onClick={nextQuestion}
                    className="bg-gradient-primary neon"
                  >
                    Complete Quiz
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero pb-32">
      {/* Header */}
      <header className="pt-8 pb-6">
        <div className="container mx-auto px-6">
          <div className="text-center animate-fade-in mb-6">
            <h1 className="text-4xl font-bold mb-2 neon-text">
              AI Quiz Generator
            </h1>
            <p className="text-muted-foreground text-lg">
              Test your knowledge with AI-generated quizzes
            </p>
          </div>

          {/* Generate Quiz Section */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Brain className="text-primary" size={20} />
              Generate New Quiz
            </h3>
            <p className="text-muted-foreground mb-4">
              Create personalized quizzes from your uploaded notes using AI
            </p>
            <Button 
              className="bg-gradient-primary neon"
              onClick={generateNewQuiz}
            >
              <Brain size={16} className="mr-2" />
              Generate Quiz from Notes
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6">
        <div className="animate-slide-up">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-xl p-4 text-center">
              <Trophy className="mx-auto mb-2 text-primary" size={24} />
              <div className="text-2xl font-bold text-primary">87%</div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Target className="mx-auto mb-2 text-accent" size={24} />
              <div className="text-2xl font-bold text-accent">24</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Clock className="mx-auto mb-2 text-neon-blue" size={24} />
              <div className="text-2xl font-bold text-neon-blue">8</div>
              <div className="text-sm text-muted-foreground">Streak Days</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Star className="mx-auto mb-2 text-primary-glow" size={24} />
              <div className="text-2xl font-bold text-primary-glow">1,247</div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
          </div>

          {/* Available Quizzes */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Available Quizzes</h2>
            
            {mockQuizzes.map((quiz, index) => (
              <Card
                key={quiz.id}
                className="campus-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{quiz.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline">{quiz.subject}</Badge>
                        <Badge 
                          variant={quiz.difficulty === 'Easy' ? 'secondary' : 
                                  quiz.difficulty === 'Medium' ? 'default' : 'destructive'}
                        >
                          {quiz.difficulty}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {quiz.questions} questions • {quiz.estimatedTime}
                        </span>
                      </div>
                    </div>
                    <Button 
                      className="bg-gradient-primary neon"
                      onClick={() => startQuiz(quiz.id)}
                    >
                      <Play size={16} className="mr-2" />
                      Start Quiz
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-6">
                      {quiz.bestScore !== null && (
                        <div>
                          <p className="text-sm text-muted-foreground">Best Score</p>
                          <p className="text-lg font-semibold text-primary">{quiz.bestScore}%</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Attempts</p>
                        <p className="text-lg font-semibold">{quiz.attempts}</p>
                      </div>
                    </div>
                    
                    {quiz.attempts > 0 && (
                      <Button size="sm" variant="outline">
                        <RotateCcw size={16} className="mr-2" />
                        Retake
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Topics covered:</p>
                    <div className="flex flex-wrap gap-2">
                      {quiz.topics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

export default Quiz;