import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Copy, Play, Square, Radio, Zap, Clock, Users, Trash2, Wifi, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BeatData {
  bpm: number;
  timestamp: number;
  confidence: number;
  energy: number;
  key?: string;
  timeSignature?: string;
  currentBar: number;
  currentBeat: number;
  bassLevel: number;
  midLevel: number;
  trebleLevel: number;
  nextSuggestedDrop?: number; // bars until suggested drop
}

interface SuggestionData {
  type: 'SUGGEST';
  message: string;
  barsUntilDrop: number;
  confidence: number;
}

interface QueuedDrop {
  id: string;
  dropNumber: 1 | 2 | 3;
  scheduledFor: 'next' | '+1' | '+2';
  barsRemaining: number;
}

interface HudDevice {
  id: string;
  name: string;
  lastSeen: number;
  status: 'online' | 'offline' | 'retry';
  retryCount?: number;
}

export const BeatCounter = () => {
  const { toast } = useToast();
  const [streamUrl, setStreamUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jsonEndpoint, setJsonEndpoint] = useState('');
  const [beatData, setBeatData] = useState<BeatData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestionData | null>(null);
  const [queuedDrops, setQueuedDrops] = useState<QueuedDrop[]>([]);
  const [hudDevices, setHudDevices] = useState<HudDevice[]>([
    { id: 'hud-1', name: 'Main Display', lastSeen: Date.now() - 2000, status: 'online' },
    { id: 'hud-2', name: 'DJ Booth', lastSeen: Date.now() - 15000, status: 'retry', retryCount: 2 },
    { id: 'hud-3', name: 'Mobile Controller', lastSeen: Date.now() - 60000, status: 'offline' },
  ]);
  const [dropCooldowns, setDropCooldowns] = useState({ 1: 0, 2: 0, 3: 0 });
  const [selectedScheduling, setSelectedScheduling] = useState<{ [key: number]: 'next' | '+1' | '+2' }>({
    1: 'next',
    2: 'next', 
    3: 'next'
  });

  // Simulate live music data for demo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let beatCounter = 1;
    let barCounter = 1;
    
    if (isAnalyzing && isConnected) {
      interval = setInterval(() => {
        beatCounter = (beatCounter % 4) + 1;
        if (beatCounter === 1) barCounter++;
        
        const newBeatData = {
          bpm: Math.floor(Math.random() * 20) + 128, // 128-148 BPM (typical club range)
          timestamp: Date.now(),
          confidence: Math.random() * 0.2 + 0.8, // 0.8-1.0
          energy: Math.random(),
          key: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][Math.floor(Math.random() * 12)] + (Math.random() > 0.5 ? 'm' : ''),
          timeSignature: Math.random() > 0.9 ? '3/4' : '4/4',
          currentBar: barCounter,
          currentBeat: beatCounter,
          bassLevel: Math.random() * 100,
          midLevel: Math.random() * 100,
          trebleLevel: Math.random() * 100,
          nextSuggestedDrop: Math.random() > 0.95 ? Math.floor(Math.random() * 8) + 2 : undefined
        };
        
        setBeatData(newBeatData);
        
        // Generate suggestions occasionally
        if (Math.random() > 0.98 && !suggestion) {
          setSuggestion({
            type: 'SUGGEST',
            message: `Chance for a drop in ${Math.floor(Math.random() * 4) + 1} bars`,
            barsUntilDrop: Math.floor(Math.random() * 4) + 1,
            confidence: Math.random() * 0.3 + 0.7
          });
        }
        
        // Clear suggestions after some time
        if (suggestion && Math.random() > 0.85) {
          setSuggestion(null);
        }
      }, 500); // Update every 500ms for smoother beat tracking
    }

    return () => clearInterval(interval);
  }, [isAnalyzing, isConnected, suggestion]);
  
  // Simulate cooldowns and queue updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update cooldowns
      setDropCooldowns(prev => ({
        1: Math.max(0, prev[1] - 1),
        2: Math.max(0, prev[2] - 1), 
        3: Math.max(0, prev[3] - 1)
      }));
      
      // Update queued drops
      setQueuedDrops(prev => prev.map(drop => ({
        ...drop,
        barsRemaining: Math.max(0, drop.barsRemaining - 1)
      })).filter(drop => drop.barsRemaining > 0));
      
      // Update HUD status
      setHudDevices(prev => prev.map(hud => ({
        ...hud,
        status: Date.now() - hud.lastSeen > 30000 ? 'offline' : 
                Date.now() - hud.lastSeen > 10000 ? 'retry' : 'online'
      })));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

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
  
  const scheduleDrop = (dropNumber: 1 | 2 | 3) => {
    if (dropCooldowns[dropNumber] > 0) {
      toast({
        title: "Drop on Cooldown",
        description: `Drop ${dropNumber} is cooling down for ${dropCooldowns[dropNumber]} more beats`,
        variant: "destructive",
      });
      return;
    }
    
    const scheduling = selectedScheduling[dropNumber];
    const barsUntilFire = scheduling === 'next' ? 0 : scheduling === '+1' ? 1 : 2;
    
    const newDrop: QueuedDrop = {
      id: `drop-${Date.now()}-${dropNumber}`,
      dropNumber,
      scheduledFor: scheduling,
      barsRemaining: barsUntilFire + 1
    };
    
    setQueuedDrops(prev => [...prev, newDrop]);
    setDropCooldowns(prev => ({ ...prev, [dropNumber]: 16 })); // 4 bars cooldown
    
    toast({
      title: `Drop ${dropNumber} Scheduled`,
      description: `Will fire ${scheduling === 'next' ? 'on next downbeat' : `in ${scheduling.replace('+', '')} bar(s)`}`,
    });
  };
  
  const armDropFromSuggestion = (dropNumber: 1 | 2 | 3) => {
    if (!suggestion) return;
    
    setSelectedScheduling(prev => ({ ...prev, [dropNumber]: 'next' }));
    scheduleDrop(dropNumber);
    setSuggestion(null);
  };
  
  const cancelDrop = (dropId: string) => {
    setQueuedDrops(prev => prev.filter(drop => drop.id !== dropId));
    toast({
      title: "Drop Cancelled",
      description: "Queued drop has been removed",
    });
  };
  
  const pingHud = (hudId: string) => {
    setHudDevices(prev => prev.map(hud => 
      hud.id === hudId ? { ...hud, lastSeen: Date.now(), status: 'online' } : hud
    ));
    toast({
      title: "HUD Pinged",
      description: "Ping sent successfully",
    });
  };
  
  const removeHud = (hudId: string) => {
    setHudDevices(prev => prev.filter(hud => hud.id !== hudId));
    toast({
      title: "HUD Removed",
      description: "Device removed from registry",
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

        {/* Live Status Panel */}
        {beatData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Status */}
            <Card className="lg:col-span-2 p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-4 h-4 rounded-full transition-all duration-100 ${
                      beatData.currentBeat === 1 ? 'bg-beat-pulse shadow-pulse scale-125' : 'bg-beat-glow'
                    }`}
                  />
                  <Label className="text-xl font-semibold">Live Status</Label>
                </div>
                
                {/* Main Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">BPM</Label>
                    <div className="text-4xl font-bold text-primary font-mono">
                      {beatData.bpm}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Bar:Beat</Label>
                    <div className="text-4xl font-bold text-beat-glow font-mono">
                      {beatData.currentBar}:{beatData.currentBeat}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Key</Label>
                    <div className="text-4xl font-bold text-accent font-mono">
                      {beatData.key}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Next Drop</Label>
                    <div className="text-4xl font-bold text-stream-active font-mono">
                      {beatData.nextSuggestedDrop ? `${beatData.nextSuggestedDrop}b` : '--'}
                    </div>
                  </div>
                </div>
                
                {/* Audio Meters */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Audio Levels</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Bass</span>
                        <span>{beatData.bassLevel.toFixed(0)}%</span>
                      </div>
                      <Progress value={beatData.bassLevel} className="h-3" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Mid</span>
                        <span>{beatData.midLevel.toFixed(0)}%</span>
                      </div>
                      <Progress value={beatData.midLevel} className="h-3" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Treble</span>
                        <span>{beatData.trebleLevel.toFixed(0)}%</span>
                      </div>
                      <Progress value={beatData.trebleLevel} className="h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* HUD Registry */}
            <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <Label className="text-lg font-semibold">HUD Registry</Label>
                </div>
                
                <div className="space-y-3">
                  {hudDevices.map((hud) => (
                    <div key={hud.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/20">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{hud.name}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant={hud.status === 'online' ? 'default' : 'outline'} 
                                 className={`text-xs ${hud.status === 'online' ? 'bg-stream-active text-black' : 
                                           hud.status === 'retry' ? 'text-stream-idle border-stream-idle' : 
                                           'text-destructive border-destructive'}`}>
                            {hud.status}
                          </Badge>
                          {hud.retryCount && (
                            <span className="text-xs text-muted-foreground">
                              ({hud.retryCount} retries)
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => pingHud(hud.id)}>
                          <Wifi className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => removeHud(hud.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {/* Suggestions Banner */}
        {suggestion && (
          <Card className="p-4 bg-gradient-primary/10 backdrop-blur-sm border-primary/30 shadow-glow animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium text-primary">{suggestion.message}</div>
                  <div className="text-sm text-muted-foreground">
                    Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" onClick={() => armDropFromSuggestion(1)} className="bg-primary hover:bg-primary/90">
                  ARM Drop 1
                </Button>
                <Button size="sm" onClick={() => armDropFromSuggestion(2)} className="bg-primary hover:bg-primary/90">
                  ARM Drop 2  
                </Button>
                <Button size="sm" onClick={() => armDropFromSuggestion(3)} className="bg-primary hover:bg-primary/90">
                  ARM Drop 3
                </Button>
              </div>
            </div>
          </Card>
        )}
        
        {/* Drop Controls */}
        {beatData && (
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <Label className="text-xl font-semibold">Drop Controls</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((dropNum) => (
                  <div key={dropNum} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-medium">Drop {dropNum}</Label>
                      {dropCooldowns[dropNum as 1 | 2 | 3] > 0 && (
                        <Badge variant="outline" className="text-stream-idle">
                          {dropCooldowns[dropNum as 1 | 2 | 3]} beats
                        </Badge>
                      )}
                    </div>
                    
                    <Select 
                      value={selectedScheduling[dropNum as 1 | 2 | 3]} 
                      onValueChange={(value: 'next' | '+1' | '+2') => 
                        setSelectedScheduling(prev => ({ ...prev, [dropNum]: value }))}
                    >
                      <SelectTrigger className="bg-input/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="next">Next Downbeat</SelectItem>
                        <SelectItem value="+1">+1 Bar</SelectItem>
                        <SelectItem value="+2">+2 Bars</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 h-12 text-lg font-semibold"
                      onClick={() => scheduleDrop(dropNum as 1 | 2 | 3)}
                      disabled={dropCooldowns[dropNum as 1 | 2 | 3] > 0}
                    >
                      Fire Drop {dropNum}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
        
        {/* Queue & Cooldowns */}
        {(queuedDrops.length > 0 || Object.values(dropCooldowns).some(cd => cd > 0)) && (
          <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <Label className="text-lg font-semibold">Queue & Cooldowns</Label>
              </div>
              
              {queuedDrops.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Pending Drops</Label>
                  {queuedDrops.map((drop) => (
                    <div key={drop.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/20">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-primary text-primary-foreground">
                          Drop {drop.dropNumber}
                        </Badge>
                        <span className="text-sm">
                          {drop.barsRemaining > 0 ? `${drop.barsRemaining} bars remaining` : 'Firing now!'}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => cancelDrop(drop.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};