import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, Clock, Star } from "lucide-react";

// Mock Data
const COURSES = [
  {
    id: 1,
    title: "Advanced Mathematics",
    instructor: "Dr. Sarah Wilson",
    duration: "12 hours",
    rating: 4.8,
    thumbnail: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=60",
    tags: ["Math", "Algebra"]
  },
  {
    id: 2,
    title: "Introduction to Physics",
    instructor: "Prof. James Chen",
    duration: "8 hours",
    rating: 4.6,
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&auto=format&fit=crop&q=60",
    tags: ["Science", "Physics"]
  },
  {
    id: 3,
    title: "World History: 20th Century",
    instructor: "Ms. Emily Parker",
    duration: "15 hours",
    rating: 4.9,
    thumbnail: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop&q=60",
    tags: ["History", "Humanities"]
  }
];

export default function Courses() {
  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display">Online Courses</h1>
          <p className="text-muted-foreground mt-1">Enhance your learning with expert-led content.</p>
        </div>
        <Button>Browse All</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COURSES.map((course) => (
          <Card key={course.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-none shadow-md bg-card">
            <div className="relative aspect-video overflow-hidden">
              {/* Using Unsplash images with descriptive alt text */}
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
            </div>
            
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="text-xs font-normal">
                  {course.tags[0]}
                </Badge>
                <div className="flex items-center text-amber-500 text-xs font-bold">
                  <Star className="w-3 h-3 fill-current mr-1" />
                  {course.rating}
                </div>
              </div>
              <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                {course.title}
              </h3>
            </CardHeader>
            
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
              <p>by {course.instructor}</p>
            </CardContent>
            
            <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {course.duration}
              </div>
              <Button size="sm" variant="ghost" className="h-8 hover:text-primary">
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
