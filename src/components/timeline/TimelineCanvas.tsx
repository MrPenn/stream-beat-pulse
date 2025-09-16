import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Play } from 'lucide-react';
import { Sceneplan, Cue } from '@/types/timeline';

interface TimelineCanvasProps {
  sceneplan: Sceneplan;
  selectedCue: Cue | null;
  onCueSelect: (cue: Cue | null) => void;
}

export function TimelineCanvas({ sceneplan, selectedCue, onCueSelect }: TimelineCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  
  const maxBars = Math.max(16, Math.max(...sceneplan.cues.map(cue => cue.bar)) + 4);
  const beatWidth = 40 * zoom;
  const barWidth = beatWidth * 4;
  const trackHeight = 60;

  const handleCueClick = (cue: Cue) => {
    onCueSelect(selectedCue === cue ? null : cue);
  };

  const getCueColor = (fx: string) => {
    const colors = {
      pulse: 'bg-blue-600',
      fade: 'bg-purple-600',
      stb: 'bg-yellow-600',
      riser: 'bg-green-600',
      chase: 'bg-orange-600',
      wave: 'bg-cyan-600',
      beam: 'bg-red-600',
      ripple: 'bg-pink-600',
      spark: 'bg-amber-600',
      swarm: 'bg-violet-600',
      tex: 'bg-teal-600',
      pcl: 'bg-rose-600',
      scene: 'bg-indigo-600'
    };
    return colors[fx as keyof typeof colors] || 'bg-gray-600';
  };

  return (
    <div className="flex-1 bg-background overflow-hidden flex flex-col">
      {/* Timeline Controls */}
      <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
          <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(2, zoom + 0.25))}>
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" className="flex items-center gap-1">
            <Play className="h-3 w-3" />
            Preview
          </Button>
          <span className="text-sm text-muted-foreground">{sceneplan.bpm} BPM</span>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-auto relative">
        {/* Beat Grid Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border h-10 flex">
          <div className="w-32 flex items-center justify-center text-sm font-medium">Roles</div>
          <div className="flex">
            {Array.from({ length: maxBars }, (_, barIndex) => (
              <div key={barIndex} className="flex border-r border-border/50">
                {Array.from({ length: 4 }, (_, beatIndex) => (
                  <div
                    key={beatIndex}
                    className={`flex items-center justify-center text-xs ${
                      beatIndex === 0 ? 'border-r-2 border-border font-bold' : 'border-r border-border/30'
                    }`}
                    style={{ width: beatWidth }}
                  >
                    {beatIndex === 0 ? `${barIndex + 1}` : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Tracks */}
        <div className="relative">
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-20 pointer-events-none"
            style={{ left: playheadPosition * beatWidth + 128 }}
          />

          {sceneplan.roles.map((role, roleIndex) => (
            <Droppable key={role} droppableId={`timeline-${role}`} direction="horizontal">
              {(provided, snapshot) => (
                <div
                  className={`flex border-b border-border/50 ${
                    snapshot.isDraggingOver ? 'bg-primary/10' : ''
                  }`}
                  style={{ height: trackHeight }}
                >
                  <div className="w-32 bg-card border-r border-border flex items-center justify-center text-sm font-medium">
                    {role}
                  </div>
                  
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 relative"
                    style={{ minWidth: maxBars * barWidth }}
                  >
                    {/* Beat Grid Background */}
                    <div className="absolute inset-0 flex">
                      {Array.from({ length: maxBars * 4 }, (_, beatIndex) => (
                        <div
                          key={beatIndex}
                          className={`border-r ${
                            beatIndex % 4 === 3 ? 'border-border/50' : 'border-border/20'
                          }`}
                          style={{ width: beatWidth }}
                        />
                      ))}
                    </div>

                    {/* Cues for this role */}
                    {sceneplan.cues
                      .filter(cue => cue.r === role)
                      .map((cue, cueIndex) => (
                        <div
                          key={`${role}-${cueIndex}`}
                          className={`
                            absolute top-1 bottom-1 rounded px-2 py-1 cursor-pointer
                            transition-all hover:shadow-md border-2
                            ${getCueColor(cue.p.x)} ${
                            selectedCue === cue
                              ? 'border-primary shadow-glow'
                              : 'border-transparent hover:border-primary/50'
                          }`}
                          style={{
                            left: (cue.bar - 1) * barWidth + 4,
                            width: Math.max(80, cue.p.sec * (sceneplan.bpm / 60) * beatWidth) - 8
                          }}
                          onClick={() => handleCueClick(cue)}
                        >
                          <div className="text-xs font-medium text-white truncate">
                            {cue.label || cue.p.x}
                          </div>
                          <div className="text-xs text-white/80">
                            {cue.p.sec}s • {cue.p.a}
                          </div>
                        </div>
                      ))}
                    
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </div>
    </div>
  );
}