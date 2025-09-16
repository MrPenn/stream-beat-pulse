import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Play, Square, Radio } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BeatData {
  bpm: number;
  timestamp: number;
  confidence: number;
  energy: number;
  key?: string;
  timeSignature?: string;
}

export const BeatCounter = () => {
  const { toast } = useToast();
  const [streamUrl, setStreamUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jsonEndpoint, setJsonEndpoint] = useState('');
  const [beatData, setBeatData] = useState<BeatData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Simulate beat detection for demo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAnalyzing && isConnected) {
      interval = setInterval(() => {
        setBeatData({
          bpm: Math.floor(Math.random() * 60) + 90, // 90-150 BPM
          timestamp: Date.now(),
          confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
          energy: Math.random(),
          key: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][Math.floor(Math.random() * 12)] + (Math.random() > 0.5 ? 'm' : ''),
          timeSignature: Math.random() > 0.8 ? '3/4' : '4/4'
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isAnalyzing, isConnected]);

  const handleStartAnalysis = () => {
    if (!streamUrl.trim()) {
      toast({
        title: "Stream URL Required",
        description: "Please enter a valid stream URL",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setIsConnected(true);
    
    // Generate endpoint URL
    const endpointId = Math.random().toString(36).substring(7);
    setJsonEndpoint(`https://api.beatcounter.app/stream/${endpointId}/heartbeat`);
    
    toast({
      title: "Analysis Started",
      description: "Beat detection is now active",
    });
  };

  const handleStopAnalysis = () => {
    setIsAnalyzing(false);
    setIsConnected(false);
    setBeatData(null);
    
    toast({
      title: "Analysis Stopped",
      description: "Beat detection has been stopped",
    });
  };

  const copyEndpoint = () => {
    navigator.clipboard.writeText(jsonEndpoint);
    toast({
      title: "Copied!",
      description: "JSON endpoint URL copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Beat Counter
          </h1>
          <p className="text-muted-foreground">
            Real-time beat detection and music analysis API
          </p>
        </div>

        {/* Stream Input Card */}
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-primary" />
              <Label htmlFor="stream-url" className="text-lg font-semibold">
                Stream URL
              </Label>
            </div>
            
            <div className="flex gap-3">
              <Input
                id="stream-url"
                placeholder="https://stream.example.com/live"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                className="flex-1 bg-input/50 border-border/50 focus:border-primary"
                disabled={isAnalyzing}
              />
              
              {!isAnalyzing ? (
                <Button 
                  onClick={handleStartAnalysis}
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              ) : (
                <Button 
                  onClick={handleStopAnalysis}
                  variant="destructive"
                  className="transition-all duration-300"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Status and Endpoint */}
        {jsonEndpoint && (
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Label className="text-lg font-semibold">Status</Label>
                  <Badge 
                    variant={isConnected ? "default" : "outline"}
                    className={`${isConnected ? 'bg-stream-active text-black' : 'text-stream-idle border-stream-idle'} transition-all duration-300`}
                  >
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  JSON Heartbeat Endpoint
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/30">
                  <code className="flex-1 text-sm font-mono break-all text-foreground">
                    {jsonEndpoint}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyEndpoint}
                    className="shrink-0 hover:text-primary"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Live Beat Data */}
        {beatData && (
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div 
                  className={`w-3 h-3 rounded-full transition-all duration-100 ${
                    beatData.energy > 0.7 ? 'bg-beat-pulse shadow-pulse animate-pulse' : 'bg-beat-glow'
                  }`}
                />
                <Label className="text-lg font-semibold">Live Beat Data</Label>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">BPM</Label>
                  <div className="text-2xl font-bold text-primary font-mono">
                    {beatData.bpm}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Confidence</Label>
                  <div className="text-2xl font-bold text-beat-glow font-mono">
                    {(beatData.confidence * 100).toFixed(0)}%
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Energy</Label>
                  <div className="text-2xl font-bold text-stream-active font-mono">
                    {(beatData.energy * 100).toFixed(0)}%
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Key</Label>
                  <div className="text-2xl font-bold text-accent font-mono">
                    {beatData.key || 'N/A'}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/30">
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  JSON Output Preview
                </Label>
                <pre className="text-xs bg-muted/20 p-3 rounded-lg border border-border/20 overflow-x-auto font-mono">
{JSON.stringify(beatData, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};