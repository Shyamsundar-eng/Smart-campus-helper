import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft,
  Heart,
  Share2,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  User,
  Flag
} from "lucide-react";

// Mock item data (in real app, this would come from API)
const mockItem = {
  id: "1",
  title: "Calculus Textbook - 11th Edition",
  price: 45,
  images: [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop"
  ],
  seller: {
    name: "Alex Chen",
    email: "alex.chen@university.edu", 
    phone: "+1 (555) 123-4567",
    whatsapp: "+15551234567",
    avatar: "AC",
    rating: 4.8,
    itemsSold: 12,
    joinedDate: "Sep 2023"
  },
  description: "Excellent condition calculus textbook, barely used. Perfect for Calc I and Calc II courses. All pages intact, no highlighting or writing inside. Includes access code for online resources (unused).\n\nISBN: 978-1285741550\nAuthor: James Stewart\nEdition: 11th\n\nIdeal for students taking MATH 101, MATH 102, or equivalent calculus courses.",
  location: "Engineering Building",
  category: "Textbooks",
  condition: "Like New",
  postedAt: "2 hours ago",
  views: 24,
  likes: 12,
  tags: ["Calculus", "Mathematics", "Stewart", "Engineering"]
};

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const handleContact = (method: 'email' | 'phone' | 'whatsapp') => {
    const { seller } = mockItem;
    
    switch (method) {
      case 'email':
        window.open(`mailto:${seller.email}?subject=Interested in ${mockItem.title}&body=Hi ${seller.name}, I'm interested in your ${mockItem.title} listed for $${mockItem.price}. Is it still available?`);
        break;
      case 'phone':
        window.open(`tel:${seller.phone}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${seller.whatsapp.replace(/[^\d]/g, '')}?text=Hi ${seller.name}! I'm interested in your ${mockItem.title} listed for $${mockItem.price}. Is it still available?`);
        break;
    }
    
    toast({
      title: "Contact Initiated",
      description: `Opening ${method} to contact ${seller.name}`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mockItem.title,
        text: `Check out this ${mockItem.category.toLowerCase()} for $${mockItem.price}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Item link copied to clipboard",
      });
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? "Item removed from your favorites" : "Item saved to your favorites",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-8">
      {/* Header */}
      <header className="pt-8 pb-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="border-border/50 hover:border-primary/50"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            
            <div className="flex-1" />
            
            <Button
              size="sm"
              variant="outline"
              onClick={toggleLike}
              className={`border-border/50 hover:border-primary/50 ${
                isLiked ? 'text-red-500 border-red-500/50' : ''
              }`}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="border-border/50 hover:border-primary/50"
            >
              <Share2 size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <img
                src={mockItem.images[currentImageIndex]}
                alt={mockItem.title}
                className="w-full h-96 object-cover"
              />
            </Card>
            
            <div className="flex gap-2">
              {mockItem.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-1 rounded-lg overflow-hidden border-2 transition-colors ${
                    currentImageIndex === index ? 'border-primary' : 'border-border/50'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${mockItem.title} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <Card className="campus-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{mockItem.title}</CardTitle>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline">{mockItem.category}</Badge>
                      <Badge variant="secondary">{mockItem.condition}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">${mockItem.price}</div>
                    <div className="text-sm text-muted-foreground">Fixed Price</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {mockItem.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {mockItem.postedAt}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {mockItem.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {mockItem.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Information */}
            <Card className="campus-card">
              <CardHeader>
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>{mockItem.seller.avatar}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold">{mockItem.seller.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>⭐ {mockItem.seller.rating} rating</span>
                      <span>{mockItem.seller.itemsSold} items sold</span>
                      <span>Joined {mockItem.seller.joinedDate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button 
                    className="bg-gradient-primary neon"
                    onClick={() => handleContact('whatsapp')}
                  >
                    <MessageCircle size={16} className="mr-2" />
                    WhatsApp
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleContact('email')}
                    className="border-primary/30 hover:border-primary/60"
                  >
                    <Mail size={16} className="mr-2" />
                    Email
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleContact('phone')}
                    className="border-primary/30 hover:border-primary/60"
                  >
                    <Phone size={16} className="mr-2" />
                    Call
                  </Button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border/50">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs text-muted-foreground"
                  >
                    <Flag size={14} className="mr-2" />
                    Report this listing
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Item Stats */}
            <Card className="campus-card">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{mockItem.views}</div>
                    <div className="text-sm text-muted-foreground">Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">{mockItem.likes}</div>
                    <div className="text-sm text-muted-foreground">Likes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neon-blue">#{id}</div>
                    <div className="text-sm text-muted-foreground">Item ID</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ItemDetail;