import React, { useState, useCallback } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { TopBar } from '@/components/timeline/TopBar';
import { FXLibrary } from '@/components/timeline/FXLibrary';
import { TimelineCanvas } from '@/components/timeline/TimelineCanvas';
import { Inspector } from '@/components/timeline/Inspector';
import { Sceneplan, Cue } from '@/types/timeline';

const MOCK_SCENEPLAN: Sceneplan = {
  bpm: 124,
  roles: ['wall', 'pillar_A', 'pillar_B'],
  cues: [
    {
      bar: 1,
      r: 'wall',
      p: { x: 'fade', a: 0, sec: 0.5 },
      label: 'intro fade'
    },
    {
      bar: 4,
      r: 'pillar_A',
      p: { x: 'pulse', a: 255, sec: 1.0 },
      label: 'main pulse'
    }
  ]
};

export default function TimelineEditor() {
  const [sceneplan, setSceneplan] = useState<Sceneplan>(MOCK_SCENEPLAN);
  const [selectedCue, setSelectedCue] = useState<Cue | null>(null);
  const [projectName, setProjectName] = useState('Untitled Scene');

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === 'fx-library' && destination.droppableId.startsWith('timeline-')) {
      // Dragging from FX library to timeline
      const role = destination.droppableId.replace('timeline-', '');
      const bar = Math.floor(destination.index / 4) + 1; // Convert index to bar
      
      const newCue: Cue = {
        bar,
        r: role,
        p: { x: draggableId as any, a: 255, sec: 1.0 },
        label: `${draggableId} ${bar}`
      };

      setSceneplan(prev => ({
        ...prev,
        cues: [...prev.cues, newCue]
      }));
    }
  }, []);

  const updateCue = useCallback((updatedCue: Cue) => {
    setSceneplan(prev => ({
      ...prev,
      cues: prev.cues.map(cue => 
        cue === selectedCue ? updatedCue : cue
      )
    }));
    setSelectedCue(updatedCue);
  }, [selectedCue]);

  const deleteCue = useCallback(() => {
    if (!selectedCue) return;
    
    setSceneplan(prev => ({
      ...prev,
      cues: prev.cues.filter(cue => cue !== selectedCue)
    }));
    setSelectedCue(null);
  }, [selectedCue]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background text-foreground">
        <TopBar
          projectName={projectName}
          onProjectNameChange={setProjectName}
          bpm={sceneplan.bpm}
          onBpmChange={(bpm) => setSceneplan(prev => ({ ...prev, bpm }))}
          sceneplan={sceneplan}
        />
        
        <div className="flex h-[calc(100vh-4rem)]">
          <FXLibrary />
          
          <TimelineCanvas
            sceneplan={sceneplan}
            selectedCue={selectedCue}
            onCueSelect={setSelectedCue}
          />
          
          <Inspector
            selectedCue={selectedCue}
            onUpdateCue={updateCue}
            onDeleteCue={deleteCue}
          />
        </div>
      </div>
    </DragDropContext>
  );
}