import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Save, Upload, Download, Music, ArrowLeft } from 'lucide-react';
import { Sceneplan } from '@/types/timeline';

interface TopBarProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  sceneplan: Sceneplan;
}

export function TopBar({ 
  projectName, 
  onProjectNameChange, 
  bpm, 
  onBpmChange, 
  sceneplan 
}: TopBarProps) {
  const [masterTint, setMasterTint] = useState([0]);
  const [masterIntensity, setMasterIntensity] = useState([100]);
  
  const handleTapTempo = () => {
    // Simple tap tempo - would need more sophisticated implementation
    console.log('Tap tempo clicked');
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/sceneplans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sceneplan)
      });
      if (response.ok) {
        console.log('Sceneplan saved successfully');
      }
    } catch (error) {
      console.error('Failed to save sceneplan:', error);
    }
  };

  const handleLoad = () => {
    // TODO: Implement load dialog
    console.log('Load clicked');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(sceneplan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="flex items-center gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Beat Counter
          </Link>
        </Button>
        <Input
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="w-48 bg-background/50"
          placeholder="Project name"
        />
        
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={bpm}
            onChange={(e) => onBpmChange(parseInt(e.target.value) || 120)}
            className="w-20 bg-background/50"
            min="60"
            max="200"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleTapTempo}
            className="flex items-center gap-1"
          >
            <Music className="h-3 w-3" />
            TAP
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tint</span>
          <div className="w-24">
            <Slider
              value={masterTint}
              onValueChange={setMasterTint}
              max={360}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Intensity</span>
          <div className="w-24">
            <Slider
              value={masterIntensity}
              onValueChange={setMasterIntensity}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave} className="flex items-center gap-1">
            <Save className="h-3 w-3" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleLoad} className="flex items-center gap-1">
            <Upload className="h-3 w-3" />
            Load
          </Button>
          <Button size="sm" variant="outline" onClick={handleExport} className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}