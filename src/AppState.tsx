import { useState, useCallback, useRef, useEffect } from 'react';
import { useCSInterface } from './hooks/useCSInterface';
import easeInAnimation from './assets/EaseIn.json';
import easeOutAnimation from './assets/EaseOut.json';
import easeBothAnimation from './assets/EaseBoth.json';

export interface AppStateProps {
  children: (state: AppState) => React.ReactNode;
}

export interface AppState {
  // UI State
  activeTab: string;
  showConsole: boolean;
  showSettings: boolean;
  showFpsModal: boolean;
  logs: string[];
  themeColor: string;
  
  // Ease Controls State
  easeInValue: number;
  easeOutValue: number;
  easeBothValue: number;
  activeAnimation: 'in' | 'out' | 'both';
  
  // Comp Settings State
  fps: number;
  setFps: (fps: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  
  // Text Tools State
  activeTextButton: string;
  deleteOriginal: boolean;
  activeTextSection: 'separator' | 'offset';
  
  // Layer Offset State
  offsetType: 'frames' | 'seconds';
  offsetValue: string;
  useRandomOffset: boolean;
  minOffset: string;
  maxOffset: string;
  offsetDirection: 'forward' | 'backward';
  
  // AnchorPoint Mover State
  showAnchorPointMover: boolean;
  pendingAnchorX: number;
  pendingAnchorY: number;

  // Actions
  setActiveTab: (tab: string) => void;
  setShowConsole: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowFpsModal: (show: boolean) => void;
  setThemeColor: (color: string) => void;
  handleLayerControl: (action: string) => void;
  handleProjectControl: (action: string) => void;
  handleFpsSettingsApply: () => void;
  handleCropComp: () => void;
  handleEaseChange: (type: 'in' | 'out' | 'both', value: number) => void;
  handleEaseClick: (type: 'in' | 'out' | 'both') => void;
  applyEase: (type: 'in' | 'out' | 'both', value: number) => void;
  setActiveTextButton: (button: string) => void;
  setDeleteOriginal: (del: boolean) => void;
  setActiveTextSection: (section: 'separator' | 'offset') => void;
  handleSeparateText: () => void;
  setOffsetType: (type: 'frames' | 'seconds') => void;
  setOffsetValue: (value: string) => void;
  setUseRandomOffset: (use: boolean) => void;
  setMinOffset: (value: string) => void;
  setMaxOffset: (value: string) => void;
  setOffsetDirection: (dir: 'forward' | 'backward') => void;
  handleApplyLayerOffset: () => void;
  handleResetLayerOffset: () => void;
  setShowAnchorPointMover: (show: boolean) => void;
  handleAnchorPointChange: (x: number, y: number) => void;
  applyAnchorPointChange: (position: string) => void;
  handleResetAnchorPoint: () => void;
  getAnimationSource: () => any;
  handleApplyKeyframeOffset: () => void;
  handleResetKeyframeOffset: () => void;
  currentOffsetRef: React.MutableRefObject<number>;
}

export function AppState({ children }: AppStateProps) {
  const { callExtendScriptFunction } = useCSInterface();
  
  // UI State
  const [activeTab, setActiveTab] = useState('layers');
  const [showConsole, setShowConsole] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFpsModal, setShowFpsModal] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [themeColor, setThemeColor] = useState('#ABFFA8');
  
  // Ease Controls State
  const [easeInValue, setEaseInValue] = useState(0);
  const [easeOutValue, setEaseOutValue] = useState(0);
  const [easeBothValue, setEaseBothValue] = useState(0);
  const [activeAnimation, setActiveAnimation] = useState<'in' | 'out' | 'both'>('both');
  
  // Comp Settings State
  const [fps, setFps] = useState(30);
  const [duration, setDuration] = useState(300);
  
  // Text Tools State
  const [activeTextButton, setActiveTextButton] = useState('char');
  const [deleteOriginal, setDeleteOriginal] = useState(false);
  const [activeTextSection, setActiveTextSection] = useState<'separator' | 'offset'>('separator');
  
  // Layer Offset State
  const [offsetType, setOffsetType] = useState<'frames' | 'seconds'>('frames');
  const [offsetValue, setOffsetValue] = useState('1');
  const [useRandomOffset, setUseRandomOffset] = useState(false);
  const [minOffset, setMinOffset] = useState('0');
  const [maxOffset, setMaxOffset] = useState('10');
  const [offsetDirection, setOffsetDirection] = useState<'forward' | 'backward'>('forward');
  
  // AnchorPoint Mover State
  const [showAnchorPointMover, setShowAnchorPointMover] = useState(false);
  const [pendingAnchorX, setPendingAnchorX] = useState(50);
  const [pendingAnchorY, setPendingAnchorY] = useState(50);
  
  // Refs
  const currentOffsetRef = useRef<number>(0);
  const lastEaseValues = useRef({ in: 0, out: 0, both: 0 });

  // Initialize lastEaseValues with current state values
  useEffect(() => {
    lastEaseValues.current = {
      in: easeInValue,
      out: easeOutValue,
      both: easeBothValue
    };
  }, []);

  // Console logging setup
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    console.log = (...args) => {
      originalConsoleLog.apply(console, args);
      setLogs(prev => [...prev, args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')]);
    };

    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      setLogs(prev => [...prev, '🔴 Error: ' + args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')]);
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);

  // Layer Controls Handlers
  const handleLayerControl = useCallback((action: string) => {
    callExtendScriptFunction(action)
      .then(result => console.log('Action result:', result))
      .catch(error => console.error('Error executing action:', error));
  }, [callExtendScriptFunction]);

  // Project Controls Handlers
  const handleProjectControl = useCallback((action: string) => {
    callExtendScriptFunction(action)
      .then(result => console.log('Action result:', result))
      .catch(error => console.error('Error executing action:', error));
  }, [callExtendScriptFunction]);

  // Comp Settings Handlers
  const handleFpsSettingsApply = useCallback(() => {
    callExtendScriptFunction('updateCompSettings', fps, duration)
      .then(result => {
        console.log('Settings updated:', result);
        setShowFpsModal(false);
      })
      .catch(error => console.error('Error updating comp settings:', error));
  }, [callExtendScriptFunction, fps, duration]);

  const handleCropComp = useCallback(() => {
    callExtendScriptFunction('cropComp')
      .then(result => console.log('Comp cropped:', result))
      .catch(error => console.error('Error cropping composition:', error));
  }, [callExtendScriptFunction]);

  // Ease Controls Handlers
  const updateEaseAnimation = useCallback((type: 'in' | 'out' | 'both', value: number) => {
    switch(type) {
      case 'in':
        setEaseInValue(value);
        lastEaseValues.current.in = value;
        break;
      case 'out':
        setEaseOutValue(value);
        lastEaseValues.current.out = value;
        break;
      case 'both':
        setEaseBothValue(value);
        lastEaseValues.current.both = value;
        break;
    }
  }, []);

  const applyEase = useCallback((type: 'in' | 'out' | 'both', value: number) => {
    callExtendScriptFunction('updateEase', type, value)
      .then(result => {
        console.log('Updated:', result);
        lastEaseValues.current[type] = value;
      })
      .catch(error => console.error('Error updating ease values:', error));
  }, [callExtendScriptFunction]);

  const handleEaseChange = useCallback((type: 'in' | 'out' | 'both', value: number) => {
    setActiveAnimation(type);
    updateEaseAnimation(type, value);
  }, [updateEaseAnimation]);

  const handleEaseClick = useCallback((type: 'in' | 'out' | 'both') => {
    setActiveAnimation(type);
    const value = lastEaseValues.current[type];
    
    switch(type) {
      case 'in':
        setEaseInValue(value);
        break;
      case 'out':
        setEaseOutValue(value);
        break;
      case 'both':
        setEaseBothValue(value);
        break;
    }

    applyEase(type, value);
  }, [applyEase]);

  // Text Tools Handlers
  const handleSeparateText = useCallback(() => {
    callExtendScriptFunction('separateText', activeTextButton, deleteOriginal)
      .then(result => console.log('Text separated:', result))
      .catch(error => console.error('Error separating text:', error));
  }, [callExtendScriptFunction, activeTextButton, deleteOriginal]);

  // Layer Offset Handlers
  const handleApplyLayerOffset = useCallback(() => {
    currentOffsetRef.current += 1;
    
    callExtendScriptFunction(
      'applyLayerOffset', 
      offsetType, 
      offsetValue, 
      useRandomOffset, 
      minOffset, 
      maxOffset, 
      offsetDirection, 
      currentOffsetRef.current
    )
      .then(result => console.log('Layer offset result:', result))
      .catch(error => console.error('Error applying layer offset:', error));
  }, [
    callExtendScriptFunction, 
    offsetType, 
    offsetValue, 
    useRandomOffset, 
    minOffset, 
    maxOffset, 
    offsetDirection
  ]);

  const handleResetLayerOffset = useCallback(() => {
    currentOffsetRef.current = 0;
    
    callExtendScriptFunction('resetLayerOffset')
      .then(result => console.log('Layer offset reset result:', result))
      .catch(error => console.error('Error resetting layer offset:', error));
  }, [callExtendScriptFunction]);

  // Anchor Point Handlers
  const handleAnchorPointChange = useCallback((x: number, y: number) => {
    setPendingAnchorX(x);
    setPendingAnchorY(y);
  }, []);

  const applyAnchorPointChange = useCallback((position: string) => {
    callExtendScriptFunction('moveAnchorPoint', position)
      .then(result => console.log('Anchor point moved:', result))
      .catch(error => console.error('Error moving anchor point:', error));
  }, [callExtendScriptFunction]);

  const handleResetAnchorPoint = useCallback(() => {
    setPendingAnchorX(50);
    setPendingAnchorY(50);
    
    callExtendScriptFunction('resetAnchorPoint')
      .then(result => console.log('Anchor point reset:', result))
      .catch(error => console.error('Error resetting anchor point:', error));
  }, [callExtendScriptFunction]);

  // Keyframe Offset Handlers
  const handleApplyKeyframeOffset = useCallback(() => {
    currentOffsetRef.current += 1;
    
    callExtendScriptFunction(
      'offsetKeyframes', 
      offsetType, 
      offsetValue, 
      useRandomOffset, 
      minOffset, 
      maxOffset, 
      offsetDirection, 
      currentOffsetRef.current
    )
      .then(result => console.log('Keyframe offset result:', result))
      .catch(error => console.error('Error applying keyframe offset:', error));
  }, [
    callExtendScriptFunction, 
    offsetType, 
    offsetValue, 
    useRandomOffset, 
    minOffset, 
    maxOffset, 
    offsetDirection
  ]);

  const handleResetKeyframeOffset = useCallback(() => {
    currentOffsetRef.current = 0;
    
    callExtendScriptFunction('resetKeyframes')
      .then(result => console.log('Keyframe offset reset result:', result))
      .catch(error => console.error('Error resetting keyframe offset:', error));
  }, [callExtendScriptFunction]);

  // Get animation source based on active animation
  const getAnimationSource = useCallback(() => {
    switch(activeAnimation) {
      case 'in':
        return easeInAnimation;
      case 'out':
        return easeOutAnimation;
      case 'both':
      default:
        return easeBothAnimation;
    }
  }, [activeAnimation]);

  return children({
    // UI State
    activeTab,
    showConsole,
    showSettings,
    showFpsModal,
    logs,
    themeColor,
    
    // Ease Controls State
    easeInValue,
    easeOutValue,
    easeBothValue,
    activeAnimation,
    
    // Comp Settings State
    fps,
    setFps,
    duration,
    setDuration,
    
    // Text Tools State
    activeTextButton,
    deleteOriginal,
    activeTextSection,
    
    // Layer Offset State
    offsetType,
    offsetValue,
    useRandomOffset,
    minOffset,
    maxOffset,
    offsetDirection,
    
    // AnchorPoint Mover State
    showAnchorPointMover,
    pendingAnchorX,
    pendingAnchorY,

    // Actions
    setActiveTab,
    setShowConsole,
    setShowSettings,
    setShowFpsModal,
    setThemeColor,
    handleLayerControl,
    handleProjectControl,
    handleFpsSettingsApply,
    handleCropComp,
    handleEaseChange,
    handleEaseClick,
    applyEase,
    setActiveTextButton,
    setDeleteOriginal,
    setActiveTextSection,
    handleSeparateText,
    setOffsetType,
    setOffsetValue,
    setUseRandomOffset,
    setMinOffset,
    setMaxOffset,
    setOffsetDirection,
    handleApplyLayerOffset,
    handleResetLayerOffset,
    setShowAnchorPointMover,
    handleAnchorPointChange,
    applyAnchorPointChange,
    handleResetAnchorPoint,
    getAnimationSource,
    handleApplyKeyframeOffset,
    handleResetKeyframeOffset,
    currentOffsetRef
  });
}