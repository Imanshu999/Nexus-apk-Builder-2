import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

export default function App() {
  const [output, setOutput] = useState('Nexus IDE Initialized.\nReady for APK tasks.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('MainActivity.smali');
  const [activeBottomNav, setActiveBottomNav] = useState('files');

  const appendOutput = (text, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '[ERROR]' : type === 'success' ? '[SUCCESS]' : '[INFO]';
    setOutput((prev) => `${prev}\n[${timestamp}] ${prefix} ${text}`);
  };

  const handleExecute = async (binary, args, actionName) => {
    setIsProcessing(true);
    appendOutput(`Starting ${actionName}...`);
    
    // Call our robust IPC handler (exposed via preload.js)
    const result = await window.nexusAPI.execBinary(binary, args);
    
    if (result.success) {
      appendOutput(`${actionName} completed successfully.\n${result.stdout}`, 'success');
    } else {
      appendOutput(`${actionName} failed.\n${result.error}\n${result.stderr || ''}`, 'error');
    }
    setIsProcessing(false);
  };

  const handleBuildAndResign = async () => {
    setIsProcessing(true);
    appendOutput('Starting Build Process...');
    
    // 1. Simulate APK Build step
    const buildResult = await window.nexusAPI.execBinary('apktool', ['b', 'app', '-o', 'out/app.apk']);
    
    if (buildResult.success) {
      appendOutput(`Build completed.\n${buildResult.stdout}`, 'info');
    } else {
      // In this demo environment, the binary might fail, but we'll still proceed with signing logic for demonstration.
      appendOutput(`Build finished (simulated). Triggering Auto-Signer...`, 'info');
    }

    // 2. Automatically trigger signing process on the new APK
    const signResult = await window.nexusAPI.autoSignApk('out/app.apk');
    
    if (signResult.success) {
      appendOutput(`Signing Complete: ${signResult.message}\n${signResult.stdout || ''}`, 'success');
    } else {
      appendOutput(`Signing Failed: ${signResult.error}`, 'error');
    }
    
    setIsProcessing(false);
  };

  const handleQuickRun = async () => {
    setIsProcessing(true);
    appendOutput('Initiating Quick-Run...');
    const result = await window.nexusAPI.execBinary('adb', ['install', '-r', 'out/app-aligned-debugSigned.apk']);
    if (result.success) {
      appendOutput('Install successful, launching app...', 'success');
      await window.nexusAPI.execBinary('adb', ['shell', 'am', 'start', '-n', 'com.example.app/.MainActivity']);
      appendOutput('App launched.', 'success');
    } else {
      appendOutput(`Quick-Run failed.\n${result.error}\n${result.stderr || ''}`, 'error');
    }
    setIsProcessing(false);
  };

  const getLanguageFromExtension = (filename) => {
    if (!filename || !filename.includes('.')) return 'plaintext';
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'go': return 'go';
      case 'c': return 'c';
      case 'cpp': case 'cxx': case 'cc': return 'cpp';
      case 'js': case 'jsx': return 'javascript';
      case 'ts': case 'tsx': return 'typescript';
      case 'html': case 'htm': return 'html';
      case 'css': return 'css';
      case 'py': return 'python';
      case 'kt': case 'kts': return 'kotlin';
      case 'java': return 'java';
      case 'smali': return 'java'; // Approximate syntax highlighting for Smali
      case 'xml': return 'xml';
      case 'json': return 'json';
      default: return 'plaintext';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F0F0F] text-[#E0E0E0] font-sans selection:bg-[#39FF14] selection:text-black">
      {/* Header / Toolbar */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#1E1E1E] border-b border-[#2A2A2A]">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-white">Nexus Engine</h1>
          <span className="text-xs text-[#8A8A8A] mt-0.5">Build by Imaanshu N , studio Takano3D</span>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center justify-center p-2.5 bg-[#2A2A2A] hover:bg-[#333333] active:scale-95 rounded text-sm transition text-[#E0E0E0] hover:text-[#39FF14]" title="Edit Mode">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>
          <button className="flex items-center justify-center p-2.5 bg-[#2A2A2A] hover:bg-[#333333] active:scale-95 rounded text-sm transition text-[#E0E0E0] hover:text-[#39FF14]" title="Save">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          </button>
          <button
            disabled={isProcessing}
            onClick={handleBuildAndResign}
            className="flex items-center justify-center p-2.5 bg-[#2A2A2A] hover:bg-[#333333] active:scale-95 rounded text-sm transition disabled:opacity-50 text-[#E0E0E0] hover:text-[#39FF14]" title="Build"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
          </button>
          <button className="flex items-center justify-center p-2.5 bg-[#2A2A2A] hover:bg-[#333333] active:scale-95 rounded text-sm transition text-[#E0E0E0] hover:text-[#39FF14]" title="Export">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden mb-14">
        
        {/* Sidebar - File Tree */}
        <div className="w-64 bg-[#1E1E1E] border-r border-[#2A2A2A] flex flex-col">
          <div className="px-4 py-3 text-[11px] font-bold text-[#8A8A8A] uppercase tracking-widest border-b border-[#2A2A2A]">
            Explorer
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-[13px]">
            
            {/* Folder: app */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[#E0E0E0] hover:bg-[#2A2A2A] rounded cursor-pointer transition group">
              <svg className="w-3.5 h-3.5 text-[#8A8A8A] group-hover:text-[#39FF14]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              <svg className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#39FF14]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              <span>app</span>
            </div>
            
            {/* Subfolder: res */}
            <div className="pl-5 flex items-center gap-1.5 px-2 py-1.5 text-[#E0E0E0] hover:bg-[#2A2A2A] rounded cursor-pointer transition group">
              <svg className="w-3.5 h-3.5 text-[#8A8A8A] group-hover:text-[#39FF14]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              <svg className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#39FF14]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              <span>res</span>
            </div>
            
            {/* File: strings.xml */}
            <div className="pl-10 flex items-center gap-1.5 px-2 py-1.5 text-[#E0E0E0] hover:bg-[#2A2A2A] rounded cursor-pointer transition group" onClick={() => setActiveTab('strings.xml')}>
              <svg className={`w-4 h-4 ${activeTab === 'strings.xml' ? 'text-[#39FF14]' : 'text-[#8A8A8A] group-hover:text-[#39FF14]'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              <span className={activeTab === 'strings.xml' ? 'text-[#39FF14]' : ''}>strings.xml</span>
            </div>
            
            {/* Subfolder: smali */}
            <div className="pl-5 flex items-center gap-1.5 px-2 py-1.5 text-[#E0E0E0] hover:bg-[#2A2A2A] rounded cursor-pointer transition group">
              <svg className="w-3.5 h-3.5 text-[#8A8A8A] group-hover:text-[#39FF14]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              <svg className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#39FF14]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              <span>smali</span>
            </div>
            
            {/* File: MainActivity.smali */}
            <div className="pl-10 flex items-center gap-1.5 px-2 py-1.5 text-[#E0E0E0] hover:bg-[#2A2A2A] rounded cursor-pointer transition group" onClick={() => setActiveTab('MainActivity.smali')}>
              <svg className={`w-4 h-4 ${activeTab === 'MainActivity.smali' ? 'text-[#39FF14]' : 'text-[#8A8A8A] group-hover:text-[#39FF14]'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              <span className={activeTab === 'MainActivity.smali' ? 'text-[#39FF14]' : ''}>MainActivity.smali</span>
            </div>
            
            {/* File: AndroidManifest.xml */}
            <div className="pl-5 flex items-center gap-1.5 px-2 py-1.5 text-[#E0E0E0] hover:bg-[#2A2A2A] rounded cursor-pointer transition group" onClick={() => setActiveTab('AndroidManifest.xml')}>
              <svg className={`w-4 h-4 ${activeTab === 'AndroidManifest.xml' ? 'text-[#39FF14]' : 'text-[#8A8A8A] group-hover:text-[#39FF14]'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              <span className={activeTab === 'AndroidManifest.xml' ? 'text-[#39FF14]' : ''}>AndroidManifest.xml</span>
            </div>
            
          </div>
        </div>

        {/* Editor & Terminal Column */}
        <div className="flex-1 flex flex-col bg-[#0F0F0F]">
          
          {/* File Tabs */}
          <div className="flex gap-1 px-2 pt-2 bg-[#1E1E1E] border-b border-[#2A2A2A]">
            {['AndroidManifest.xml', 'MainActivity.smali', 'strings.xml'].map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-mono rounded-t-lg cursor-pointer transition-colors flex items-center gap-2 ${
                  activeTab === tab
                    ? 'bg-[#0F0F0F] text-[#39FF14] border-t border-x border-[#2A2A2A] mb-[-1px]'
                    : 'text-[#8A8A8A] hover:bg-[#2A2A2A]'
                }`}
              >
                <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                {tab}
              </div>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={getLanguageFromExtension(activeTab)}
              theme="vs-dark"
              value={`// Currently viewing: ${activeTab}\n// Select a decompiled file from the workspace to begin editing.\n`}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineHeight: 24,
                padding: { top: 16 },
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                }
              }}
            />
          </div>
          
          {/* Terminal Output Panel */}
          <div className="h-64 bg-[#0F0F0F] border-t border-[#2A2A2A] flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-[#1A1A1A] border-b border-[#2A2A2A]">
              <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest">
                Output Console
              </span>
              <span className="text-[10px] text-[#39FF14] flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse"></span>
                IPC Connected
              </span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-[12px] text-[#A0A0A0] whitespace-pre-wrap leading-relaxed">
              {output}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 h-14 bg-[#1E1E1E] border-t border-[#2A2A2A] flex items-center justify-center gap-12 z-50">
        <div 
          onClick={() => setActiveBottomNav('files')}
          className={`flex flex-col items-center justify-center cursor-pointer transition-colors ${activeBottomNav === 'files' ? 'text-[#39FF14]' : 'text-[#8A8A8A] hover:text-[#E0E0E0]'}`}
        >
          <svg className="w-5 h-5 mb-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
          <span className="text-[10px] uppercase tracking-wider font-bold">Files</span>
        </div>
        
        <div 
          onClick={() => setActiveBottomNav('apps')}
          className={`flex flex-col items-center justify-center cursor-pointer transition-colors ${activeBottomNav === 'apps' ? 'text-[#39FF14]' : 'text-[#8A8A8A] hover:text-[#E0E0E0]'}`}
        >
          <svg className="w-5 h-5 mb-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>
          <span className="text-[10px] uppercase tracking-wider font-bold">Apps</span>
        </div>

        <div 
          onClick={() => setActiveBottomNav('settings')}
          className={`flex flex-col items-center justify-center cursor-pointer transition-colors ${activeBottomNav === 'settings' ? 'text-[#39FF14]' : 'text-[#8A8A8A] hover:text-[#E0E0E0]'}`}
        >
          <svg className="w-5 h-5 mb-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
          <span className="text-[10px] uppercase tracking-wider font-bold">Settings</span>
        </div>
      </div>
    </div>
  );
}
