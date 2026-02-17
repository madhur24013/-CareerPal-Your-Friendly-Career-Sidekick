
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { GeneratedVideo } from '../types.ts';
import GuideTooltip from './GuideTooltip.tsx';

const VideoView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [voiceoverScript, setVoiceoverScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [videos, setVideos] = useState<(GeneratedVideo & { audioBlob?: string })[]>([]);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);

  const checkAndGenerate = async () => {
    if (!prompt.trim()) return;
    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      setShowKeyPrompt(true);
      return;
    }
    generateIntro();
  };

  const handleOpenKeySelector = async () => {
    await (window as any).aistudio.openSelectKey();
    setShowKeyPrompt(false);
    generateIntro();
  };

  const generateIntro = async () => {
    setIsGenerating(true);
    setStatus('Getting started...');
    setSystemError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      setStatus('Making your video...');
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt + ", friendly corporate style, high quality",
        config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '16:9' }
      });

      let masteredAudio = '';
      if (voiceoverScript.trim()) {
        const tts = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: voiceoverScript }] }],
          config: { responseModalities: [Modality.AUDIO] },
        });
        masteredAudio = tts.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
      }

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (uri) {
        const resp = await fetch(`${uri}&key=${process.env.API_KEY}`);
        if (!resp.ok) throw new Error("Sync Failed");
        
        const blob = await resp.blob();
        setVideos(prev => [{ id: Date.now().toString(), url: URL.createObjectURL(blob), audioBlob: masteredAudio, prompt, timestamp: new Date() }, ...prev]);
        setPrompt('');
        setVoiceoverScript('');
      }
    } catch (error: any) {
      setSystemError("I hit a bit of a snag. Do you have a paid key selected?");
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b1619] overflow-hidden">
      <header className="px-10 py-6 glass border-b border-white/5 flex items-center justify-between z-20 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-[#13c8ec] rounded-full animate-pulse-soft shadow-[0_0_8px_rgba(19,200,236,0.6)]"></div>
          <h2 className="text-sm font-bold text-slate-300 tracking-tight uppercase tracking-widest">Video Ideas</h2>
        </div>
      </header>

      <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-10">
          
          {showKeyPrompt && (
            <div className="p-10 bg-[#13c8ec]/5 border border-[#13c8ec]/20 rounded-3xl flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-[#13c8ec]/10 flex items-center justify-center text-[#13c8ec] text-2xl border border-[#13c8ec]/20 shadow-xl">
                <i className="fas fa-key"></i>
              </div>
              <div className="max-w-md">
                <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Need a Paid API Key</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">Making videos takes a lot of work, so I need a key from a paid project to get started.</p>
              </div>
              <button 
                onClick={handleOpenKeySelector}
                className="bg-[#13c8ec] hover:bg-white text-[#0b1619] px-10 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-premium shadow-lg"
              >
                Select a Key
              </button>
            </div>
          )}

          {!showKeyPrompt && (
            <div className="command-input-container p-10 rounded-[2rem] space-y-10 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Video Idea</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A cozy office setting with soft sunlight..."
                    className="w-full h-36 rounded-xl px-6 py-5 text-sm font-medium outline-none text-slate-200 placeholder:text-slate-800 bg-white/5"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Voiceover Plan</label>
                  <textarea 
                    value={voiceoverScript}
                    onChange={(e) => setVoiceoverScript(e.target.value)}
                    placeholder="What should the voice say?"
                    className="w-full h-36 rounded-xl px-6 py-5 text-sm font-medium outline-none text-slate-200 placeholder:text-slate-800 bg-white/5"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-white/5">
                <GuideTooltip id="btn_video_execute" title="Make the Video" description="Ready to see your video? Click here and I'll start working on it!">
                  <button 
                    onClick={checkAndGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="bg-[#13c8ec] hover:bg-white disabled:opacity-20 text-[#0b1619] px-12 py-3 rounded-xl transition-premium font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95"
                  >
                    {isGenerating ? status : 'Let\'s see it!'}
                  </button>
                </GuideTooltip>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
            {videos.map(video => (
              <div key={video.id} className="glass rounded-2xl overflow-hidden border border-white/5 shadow-2xl animate-in fade-in group transition-premium">
                <video src={video.url} controls className="w-full aspect-video bg-black" />
                <div className="p-8 bg-[#101f22]/50">
                  <p className="text-[9px] font-bold uppercase text-[#13c8ec] tracking-[0.2em]">Our Creation</p>
                  <p className="text-xs text-slate-500 italic mt-2 line-clamp-1">"{video.prompt}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoView;
