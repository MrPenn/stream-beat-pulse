export interface CueParams {
  x: 'pulse' | 'fade' | 'stb' | 'riser' | 'chase' | 'wave' | 'beam' | 'ripple' | 'spark' | 'swarm' | 'tex' | 'pcl' | 'scene';
  a: number; // intensity 0-255
  sec: number; // duration in seconds
  color?: string; // hex color
  speed?: number; // speed multiplier
  glow?: number; // glow intensity
}

export interface Cue {
  bar: number;
  r: string; // role/group
  p: CueParams;
  label: string;
}

export interface Sceneplan {
  bpm: number;
  roles: string[];
  cues: Cue[];
}