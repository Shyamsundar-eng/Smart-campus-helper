import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassNavigation from "@/components/GlassNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter,
  Heart,
  MapPin,
  Clock,
  ShoppingBag
} from "lucide-react";

// Mock data for marketplace items
const mockItems = [
  {
    id: "1",
    title: "Calculus Textbook - 11th Edition",
    price: 45,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop",
    seller: "Alex Chen",
    location: "Engineering Building",
    category: "Textbooks",
    postedAt: "2 hours ago",
    likes: 12
  },
  {
    id: "2", 
    title: "Gaming Laptop - RTX 3060",
    price: 800,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
    seller: "Sarah Johnson",
    location: "Computer Science Dept",
    category: "Electronics",
    postedAt: "5 hours ago",
    likes: 28
  },
  {
    id: "3",
    title: "Chemistry Lab Kit",
    price: 25,
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=300&h=300&fit=crop",
    seller: "Mike Wilson", 
    location: "Chemistry Building",
    category: "Lab Equipment",
    postedAt: "1 day ago",
    likes: 8
  },
  {
    id: "4",
    title: "Bicycle - Mountain Bike",
    price: 150,
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=300&h=300&fit=crop",
    seller: "Emma Davis",
    location: "Sports Complex",
    category: "Sports",
    postedAt: "2 days ago", 
    likes: 15
  },
  {
    id: "5",
    title: "Physics Study Notes Bundle",
    price: 20,
    image: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=300&h=300&fit=crop",
    seller: "David Park",
    location: "Physics Department",
    category: "Study Materials",
    postedAt: "3 days ago",
    likes: 6
  },
  {
    id: "6",
    title: "Drawing Tablet - Wacom",
    price: 120,
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop",
    seller: "Lisa Rodriguez",
    location: "Art Building",
    category: "Electronics",
    postedAt: "1 week ago",
    likes: 22
  }
];

const categories = ["All", "Textbooks", "Electronics", "Lab Equipment", "Sports", "Study Materials"];

const Marketplace = () => {
  const [activeSection, setActiveSection] = useState(4);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleLike = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLikedItems = new Set(likedItems);
    if (newLikedItems.has(itemId)) {
      newLikedItems.delete(itemId);
    } else {
      newLikedItems.add(itemId);
    }
    setLikedItems(newLikedItems);
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-32">
      {/* Header */}
      <header className="pt-8 pb-6">
        <div className="container mx-auto px-6">
          <div className="text-center animate-fade-in mb-6">
            <h1 className="text-4xl font-bold mb-2 neon-text">
              Campus Marketplace
            </h1>
            <p className="text-muted-foreground text-lg">
              Buy and sell with fellow students
            </p>
          </div>

          {/* Search and Filters */}
          <div className="glass rounded-2xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <Input
                  placeholder="Search items or sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-border/50 hover:border-primary/50"
                >
                  <Filter size={16} className="mr-2" />
                  Filters
                </Button>
                <Button
                  onClick={() => navigate('/marketplace/add')}
                  className="bg-gradient-primary neon"
                >
                  <Plus size={16} className="mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedCategory === category 
                    ? 'bg-primary text-primary-foreground neon' 
                    : 'hover:bg-primary/10 hover:border-primary/50'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      {/* Items Grid */}
      <main className="container mx-auto px-6">
        <div className="animate-slide-up">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => (
                <Card
                  key={item.id}
                  className="campus-card cursor-pointer overflow-hidden hover-scale"
                  onClick={() => navigate(`/marketplace/item/${item.id}`)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`absolute top-2 right-2 w-8 h-8 rounded-full ${
                        likedItems.has(item.id) 
                          ? 'text-red-500 bg-background/80' 
                          : 'text-muted-foreground bg-background/60 hover:text-red-500'
                      }`}
                      onClick={(e) => toggleLike(item.id, e)}
                    >
                      <Heart 
                        size={16} 
                        fill={likedItems.has(item.id) ? 'currentColor' : 'none'}
                      />
                    </Button>
                    <Badge className="absolute bottom-2 left-2 bg-primary/80 backdrop-blur">
                      {item.category}
                    </Badge>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg leading-tight">{item.title}</h3>
                      <p className="text-2xl font-bold text-primary">${item.price}</p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{item.postedAt}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart size={14} />
                          <span>{item.likes}</span>
                        </div>
                      </div>
                      <p className="font-medium text-foreground">Sold by {item.seller}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <ShoppingBag className="mx-auto mb-4 text-muted-foreground" size={64} />
              <h3 className="text-2xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or browse different categories
              </p>
              <Button
                onClick={() => navigate('/marketplace/add')}
                className="bg-gradient-primary neon"
              >
                <Plus size={16} className="mr-2" />
                Be the first to add an item
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

export default Marketplace;