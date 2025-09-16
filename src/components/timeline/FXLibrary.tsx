import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Input } from '@/components/ui/input';
import { Search, Zap, Waves, Target, TrendingUp, RefreshCw, Radio, Sparkles, Star, Grid, Palette, Layers } from 'lucide-react';

const FX_LIBRARY = [
  { id: 'pulse', label: 'Pulse', icon: Zap, category: 'basic' },
  { id: 'fade', label: 'Fade', icon: TrendingUp, category: 'basic' },
  { id: 'stb', label: 'Strobe', icon: Sparkles, category: 'basic' },
  { id: 'riser', label: 'Riser', icon: TrendingUp, category: 'transition' },
  { id: 'chase', label: 'Chase', icon: RefreshCw, category: 'movement' },
  { id: 'wave', label: 'Wave', icon: Waves, category: 'movement' },
  { id: 'beam', label: 'Beam', icon: Target, category: 'focused' },
  { id: 'ripple', label: 'Ripple', icon: Radio, category: 'movement' },
  { id: 'spark', label: 'Spark', icon: Star, category: 'accent' },
  { id: 'swarm', label: 'Swarm', icon: Grid, category: 'complex' },
  { id: 'tex', label: 'Texture', icon: Palette, category: 'complex' },
  { id: 'pcl', label: 'Particle', icon: Sparkles, category: 'complex' },
  { id: 'scene', label: 'Scene', icon: Layers, category: 'preset' }
];

export function FXLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredFX = FX_LIBRARY.filter(fx =>
    fx.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic': return 'border-l-blue-500';
      case 'transition': return 'border-l-purple-500';
      case 'movement': return 'border-l-green-500';
      case 'focused': return 'border-l-yellow-500';
      case 'accent': return 'border-l-orange-500';
      case 'complex': return 'border-l-red-500';
      case 'preset': return 'border-l-pink-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">FX Library</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search effects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>
      </div>

      <Droppable droppableId="fx-library" isDropDisabled={true}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex-1 p-2 overflow-y-auto"
          >
            {filteredFX.map((fx, index) => {
              const Icon = fx.icon;
              return (
                <Draggable key={fx.id} draggableId={fx.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`
                        p-3 mb-2 rounded-md border-l-4 bg-background/30 hover:bg-background/50 
                        cursor-grab active:cursor-grabbing transition-colors
                        ${getCategoryColor(fx.category)}
                        ${snapshot.isDragging ? 'rotate-3 shadow-lg' : ''}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-primary" />
                        <div>
                          <div className="font-medium text-sm">{fx.label}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {fx.category}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}