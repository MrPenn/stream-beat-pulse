import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Settings } from 'lucide-react';
import { Cue } from '@/types/timeline';

interface InspectorProps {
  selectedCue: Cue | null;
  onUpdateCue: (cue: Cue) => void;
  onDeleteCue: () => void;
}

export function Inspector({ selectedCue, onUpdateCue, onDeleteCue }: InspectorProps) {
  if (!selectedCue) {
    return (
      <div className="w-80 bg-card border-l border-border p-6">
        <div className="text-center text-muted-foreground">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a cue to edit its properties</p>
        </div>
      </div>
    );
  }

  const updateParam = (key: string, value: any) => {
    onUpdateCue({
      ...selectedCue,
      p: { ...selectedCue.p, [key]: value }
    });
  };

  const updateCue = (key: string, value: any) => {
    onUpdateCue({
      ...selectedCue,
      [key]: value
    });
  };

  return (
    <div className="w-80 bg-card border-l border-border overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Cue Inspector
        </h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Basic Properties */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={selectedCue.label}
              onChange={(e) => updateCue('label', e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="bar">Bar</Label>
              <Input
                id="bar"
                type="number"
                value={selectedCue.bar}
                onChange={(e) => updateCue('bar', parseInt(e.target.value) || 1)}
                min="1"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={selectedCue.r}
                onChange={(e) => updateCue('r', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="fx">Effect Type</Label>
            <Select value={selectedCue.p.x} onValueChange={(value) => updateParam('x', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pulse">Pulse</SelectItem>
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="stb">Strobe</SelectItem>
                <SelectItem value="riser">Riser</SelectItem>
                <SelectItem value="chase">Chase</SelectItem>
                <SelectItem value="wave">Wave</SelectItem>
                <SelectItem value="beam">Beam</SelectItem>
                <SelectItem value="ripple">Ripple</SelectItem>
                <SelectItem value="spark">Spark</SelectItem>
                <SelectItem value="swarm">Swarm</SelectItem>
                <SelectItem value="tex">Texture</SelectItem>
                <SelectItem value="pcl">Particle</SelectItem>
                <SelectItem value="scene">Scene</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Effect Parameters */}
        <div className="space-y-4">
          <h4 className="font-medium">Effect Parameters</h4>
          
          <div>
            <Label>Intensity: {selectedCue.p.a}</Label>
            <Slider
              value={[selectedCue.p.a]}
              onValueChange={([value]) => updateParam('a', value)}
              max={255}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Duration: {selectedCue.p.sec}s</Label>
            <Slider
              value={[selectedCue.p.sec]}
              onValueChange={([value]) => updateParam('sec', Math.round(value * 10) / 10)}
              max={10}
              step={0.1}
              className="mt-2"
            />
          </div>

          {selectedCue.p.speed !== undefined && (
            <div>
              <Label>Speed: {selectedCue.p.speed}x</Label>
              <Slider
                value={[selectedCue.p.speed]}
                onValueChange={([value]) => updateParam('speed', Math.round(value * 10) / 10)}
                min={0.1}
                max={5}
                step={0.1}
                className="mt-2"
              />
            </div>
          )}

          {selectedCue.p.glow !== undefined && (
            <div>
              <Label>Glow: {selectedCue.p.glow}</Label>
              <Slider
                value={[selectedCue.p.glow]}
                onValueChange={([value]) => updateParam('glow', value)}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
          )}
        </div>

        {/* Color Picker */}
        <div className="space-y-4">
          <h4 className="font-medium">Color</h4>
          <div className="bg-background/50 p-4 rounded-lg">
            <HexColorPicker
              color={selectedCue.p.color || '#ff0000'}
              onChange={(color) => updateParam('color', color)}
            />
            <Input
              value={selectedCue.p.color || '#ff0000'}
              onChange={(e) => updateParam('color', e.target.value)}
              className="mt-3 font-mono text-sm"
              placeholder="#ff0000"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteCue}
            className="w-full flex items-center gap-2"
          >
            <Trash2 className="h-3 w-3" />
            Delete Cue
          </Button>
        </div>
      </div>
    </div>
  );
}