import { Layers, Box, Square, Combine, Box as Box3d, Scissors, Copy, Clipboard, FolderOpen, FileText, Trash2, Type, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ThemeColor {
  color: string;
  label: string;
}

export interface Tab {
  id: string;
  icon: LucideIcon;
  label: string;
}

export interface Control {
  id: string;
  icon: LucideIcon;
  label: string;
  action: string;
}

export const themeColors: ThemeColor[] = [
  { color: '#ABFFA8', label: 'Default' },
  { color: '#f06b2e', label: 'Orange' },
  { color: '#ff8ffb', label: 'Pink' },
  { color: '#c92e2e', label: 'Red' },
  { color: '#ffe600', label: 'Yellow' }
];

export const tabs: Tab[] = [
  { id: 'layers', icon: Layers, label: 'Layers' },
  { id: 'project', icon: Box, label: 'Project & Comp' },
  { id: 'keyframes', icon: Clock, label: 'Keyframes' },
  { id: 'text', icon: Type, label: 'Text' }
];

export const layerControls: Control[] = [
  { id: 'solid', icon: Square, label: 'Solid', action: 'createSolidLayer' },
  { id: 'adjustment', icon: Combine, label: 'Adjustment Layer', action: 'createAdjustmentLayer' },
  { id: 'null', icon: Box3d, label: 'Null', action: 'createNullLayer' },
  { id: 'trimleft', icon: Scissors, label: 'Trim Left', action: 'trimLeft' },
  { id: 'trimboth', icon: Scissors, label: 'Trim Both', action: 'trimBoth' },
  { id: 'trimright', icon: Scissors, label: 'Trim Right', action: 'trimRight' },
  { id: 'masktolayers', icon: Layers, label: 'Mask to Layers', action: 'masksToLayers' },
  { id: 'easecopy', icon: Copy, label: 'Ease Copy', action: 'easeCopy' },
  { id: 'easepaste', icon: Clipboard, label: 'Ease Paste', action: 'easePaste' }
];

export const projectControls: Control[] = [
  { id: 'organize', icon: FolderOpen, label: 'Organize Project', action: 'organizeProject' },
  { id: 'addinfo', icon: FileText, label: 'Add Comp Info', action: 'addCompInfo' },
  { id: 'clean', icon: Trash2, label: 'Clean Project', action: 'cleanProject' }
];