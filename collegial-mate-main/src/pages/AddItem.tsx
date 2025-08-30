import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Camera,
  Upload,
  Plus,
  X,
  MapPin,
  DollarSign,
  Tag,
  FileText
} from "lucide-react";

const categories = [
  "Textbooks", "Electronics", "Lab Equipment", "Sports", 
  "Study Materials", "Furniture", "Clothing", "Other"
];

const conditions = ["Like New", "Good", "Fair", "Poor"];

const AddItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
    sellerName: "",
    sellerEmail: "",
    sellerPhone: "",
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (type: 'camera' | 'file') => {
    // Mock image upload - in real app, this would handle actual file upload
    const mockImageUrl = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=300&h=300&fit=crop`;
    setImages(prev => [...prev, mockImageUrl]);
    
    toast({
      title: "Image Added",
      description: `Photo ${type === 'camera' ? 'taken' : 'uploaded'} successfully`,
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.title || !formData.description || !formData.price || 
        !formData.category || !formData.sellerName || !formData.sellerEmail) {
      toast({
        title: "Please fill required fields",
        description: "Title, description, price, category, name and email are required",
        variant: "destructive"
      });
      return;
    }

    // Mock submission
    toast({
      title: "Item Listed Successfully!",
      description: "Your item has been posted to the marketplace",
    });
    
    navigate('/marketplace');
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-8">
      {/* Header */}
      <header className="pt-8 pb-6">
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
          </div>
          
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 neon-text">
              Add New Item
            </h1>
            <p className="text-muted-foreground text-lg">
              List your item on the campus marketplace
            </p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-6 max-w-2xl">
        <div className="space-y-6 animate-slide-up">
          {/* Image Upload Section */}
          <Card className="campus-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="text-primary" size={20} />
                Photos
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Button 
                  variant="outline"
                  className="h-24 flex-col gap-2 border-dashed border-primary/30 hover:border-primary/60"
                  onClick={() => handleImageUpload('camera')}
                >
                  <Camera size={24} />
                  <span className="text-sm">Take Photo</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="h-24 flex-col gap-2 border-dashed border-primary/30 hover:border-primary/60"
                  onClick={() => handleImageUpload('file')}
                >
                  <Upload size={24} />
                  <span className="text-sm">Upload Image</span>
                </Button>
              </div>
              
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Item Details */}
          <Card className="campus-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-primary" size={20} />
                Item Details
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  placeholder="e.g., Calculus Textbook - 11th Edition"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Description *</label>
                <Textarea
                  placeholder="Describe your item's condition, features, and any additional information..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-background/50 border-border/50 min-h-24"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Price * ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-muted-foreground" size={16} />
                    <Input
                      type="number"
                      placeholder="45"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="pl-10 bg-background/50 border-border/50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Category *</label>
                  <select 
                    className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Condition</label>
                  <select 
                    className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground"
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                  >
                    <option value="">Select condition</option>
                    {conditions.map((condition) => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Engineering Building"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="pl-10 bg-background/50 border-border/50"
                    />
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 bg-background/50 border-border/50"
                  />
                  <Button 
                    size="sm" 
                    onClick={addTag}
                    className="bg-gradient-primary neon"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button 
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seller Information */}
          <Card className="campus-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="text-primary" size={20} />
                Contact Information
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Name *</label>
                <Input
                  placeholder="Alex Chen"
                  value={formData.sellerName}
                  onChange={(e) => handleInputChange('sellerName', e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Email *</label>
                <Input
                  type="email"
                  placeholder="alex.chen@university.edu"
                  value={formData.sellerEmail}
                  onChange={(e) => handleInputChange('sellerEmail', e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.sellerPhone}
                  onChange={(e) => handleInputChange('sellerPhone', e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-gradient-primary neon"
              onClick={handleSubmit}
            >
              List Item
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddItem;