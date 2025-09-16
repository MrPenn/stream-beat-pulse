import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";
import { BeatCounter } from '@/components/BeatCounter';

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute top-4 right-4 z-50">
        <Button asChild variant="outline" className="flex items-center gap-2">
          <Link to="/timeline">
            <CalendarClock className="h-4 w-4" />
            Timeline Editor
          </Link>
        </Button>
      </div>
      <BeatCounter />
    </div>
  );
};

export default Index;
