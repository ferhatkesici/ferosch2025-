import React from 'react';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import ConsolePanel from './components/ConsolePanel';
import TabNavigation from './components/TabNavigation';
import LayersTab from './components/layers/LayersTab';
import ProjectAndCompTab from './components/project/ProjectAndCompTab';
import KeyframesTab from './components/keyframes/KeyframesTab';
import TextTab from './components/text/TextTab';
import FpsModal from './components/comp/FpsModal';

// Configuration
import { themeColors, tabs, layerControls, projectControls } from './config';

interface AppUIProps {
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

export function AppUI(props: AppUIProps) {
  return (
    <div className="min-h-screen bg-zinc-900 text-gray-100 p-4 flex flex-col gap-4">
      {/* Header */}
      <Header 
        themeColor={props.themeColor}
        showSettings={props.showSettings}
        setShowSettings={props.setShowSettings}
        showConsole={props.showConsole}
        setShowConsole={props.setShowConsole}
      />

      {/* Settings Panel */}
      <SettingsPanel 
        show={props.showSettings}
        themeColor={props.themeColor}
        setThemeColor={props.setThemeColor}
        themeColors={themeColors}
      />

      {/* Debug Console */}
      <ConsolePanel 
        show={props.showConsole}
        logs={props.logs}
      />

      {/* Tabs */}
      <TabNavigation 
        tabs={tabs}
        activeTab={props.activeTab}
        setActiveTab={props.setActiveTab}
        themeColor={props.themeColor}
      />

      {/* Main Content */}
      <div className="flex-1 bg-zinc-800 rounded-lg p-4 overflow-y-auto">
        {props.activeTab === 'layers' && (
          <LayersTab 
            layerControls={layerControls}
            handleLayerControl={props.handleLayerControl}
            themeColor={props.themeColor}
            showAnchorPointMover={props.showAnchorPointMover}
            setShowAnchorPointMover={props.setShowAnchorPointMover}
            pendingAnchorX={props.pendingAnchorX}
            pendingAnchorY={props.pendingAnchorY}
            handleAnchorPointChange={props.handleAnchorPointChange}
            applyAnchorPointChange={props.applyAnchorPointChange}
            handleResetAnchorPoint={props.handleResetAnchorPoint}
            easeInValue={props.easeInValue}
            easeOutValue={props.easeOutValue}
            easeBothValue={props.easeBothValue}
            activeAnimation={props.activeAnimation}
            handleEaseChange={props.handleEaseChange}
            handleEaseClick={props.handleEaseClick}
            applyEase={props.applyEase}
            animationSource={props.getAnimationSource()}
          />
        )}

        {props.activeTab === 'project' && (
          <ProjectAndCompTab 
            projectControls={projectControls}
            handleProjectControl={props.handleProjectControl}
            themeColor={props.themeColor}
            setShowFpsModal={props.setShowFpsModal}
            handleCropComp={props.handleCropComp}
          />
        )}

        {props.activeTab === 'keyframes' && (
          <KeyframesTab 
            offsetType={props.offsetType}
            setOffsetType={props.setOffsetType}
            offsetValue={props.offsetValue}
            setOffsetValue={props.setOffsetValue}
            useRandomOffset={props.useRandomOffset}
            setUseRandomOffset={props.setUseRandomOffset}
            minOffset={props.minOffset}
            setMinOffset={props.setMinOffset}
            maxOffset={props.maxOffset}
            setMaxOffset={props.setMaxOffset}
            offsetDirection={props.offsetDirection}
            setOffsetDirection={props.setOffsetDirection}
            currentOffsetRef={props.currentOffsetRef}
            handleApplyKeyframeOffset={props.handleApplyKeyframeOffset}
            handleResetKeyframeOffset={props.handleResetKeyframeOffset}
            handleApplyLayerOffset={props.handleApplyLayerOffset}
            handleResetLayerOffset={props.handleResetLayerOffset}
            themeColor={props.themeColor}
          />
        )}

        {props.activeTab === 'text' && (
          <TextTab 
            activeTextButton={props.activeTextButton}
            setActiveTextButton={props.setActiveTextButton}
            deleteOriginal={props.deleteOriginal}
            setDeleteOriginal={props.setDeleteOriginal}
            handleSeparateText={props.handleSeparateText}
            themeColor={props.themeColor}
          />
        )}

        {/* FPS Modal */}
        <FpsModal 
          show={props.showFpsModal}
          fps={props.fps}
          setFps={props.setFps}
          duration={props.duration}
          setDuration={props.setDuration}
          handleFpsSettingsApply={props.handleFpsSettingsApply}
          setShowFpsModal={props.setShowFpsModal}
          themeColor={props.themeColor}
        />
      </div>

      {/* Footer */}
      <div className="text-xs text-zinc-500 text-center">
        ferosch v1.0.0
      </div>
    </div>
  );
}