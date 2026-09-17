'use client';

import React, { useState, useEffect } from 'react';
import { soundEngine } from '@/lib/audio';
import { Volume2, VolumeX, BellRing, Sparkles, Check } from 'lucide-react';

export const AudioAlertManager: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [audioState, setAudioState] = useState<string>('uninitialized');

  useEffect(() => {
    setIsMuted(soundEngine.getIsMuted());
    setAudioState(soundEngine.getAudioContextState());
  }, []);

  const handleEnableAudio = async () => {
    const ok = await soundEngine.enableAudio();
    if (ok) {
      setHasInteracted(true);
      setIsMuted(false);
      setAudioState('running');
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
    if (!next) {
      soundEngine.playTestChime();
    }
  };

  const handleTestSound = () => {
    soundEngine.playNewOrderChime();
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Audio Enable Autoplay Banner if uninitialized */}
      {audioState !== 'running' && !hasInteracted ? (
        <button
          onClick={handleEnableAudio}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#007b9e] hover:bg-[#006e8d] text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all animate-bounce"
        >
          <BellRing className="w-4 h-4 animate-pulse" />
          <span>Aktifkan Audio Notifikasi</span>
        </button>
      ) : (
        <div className="flex items-center gap-2">
          {/* Mute/Unmute Toggle */}
          <button
            onClick={toggleMute}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              !isMuted
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-[#080e12] border-[#1c3340] text-slate-400'
            }`}
            title={isMuted ? 'Suara Dinonaktifkan' : 'Suara Aktif'}
          >
            {!isMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audio Aktif</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span>Audio Mute</span>
              </>
            )}
          </button>

          {/* Test Sound Button */}
          <button
            onClick={handleTestSound}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#080e12] hover:bg-[#14232b] border border-[#1c3340] text-[11px] font-medium text-slate-300 hover:text-white transition-colors"
          >
            <span>Tes Bel Ding</span>
          </button>
        </div>
      )}
    </div>
  );
};
