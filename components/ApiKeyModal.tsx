import React, { useEffect, useMemo, useState } from 'react';
import { clearGeminiApiKey, getGeminiApiKey, setGeminiApiKey } from '../lib/apiKey.ts';

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onSaved?: () => void;
};

const ApiKeyModal: React.FC<Props> = ({
  open,
  title = 'API key required',
  description = 'For security, GitHub Pages can’t keep a secret API key. Paste your Gemini API key to use CareerPal in this browser.',
  onClose,
  onSaved,
}) => {
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);

  const placeholder = useMemo(() => (show ? 'Paste your key here' : 'AIza…'), [show]);

  useEffect(() => {
    if (!open) return;
    setValue(getGeminiApiKey());
    setShow(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-[#101f22] border border-[#13c8ec]/20 p-8 rounded-2xl max-w-lg w-full shadow-2xl animate-in zoom-in-95">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-[#13c8ec]/10 rounded-2xl flex items-center justify-center text-[#13c8ec] text-xl border border-[#13c8ec]/20 shadow-xl">
            <i className="fas fa-key"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tight">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Gemini API key</label>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            type={show ? 'text' : 'password'}
            className="w-full rounded-xl px-5 py-4 text-sm font-medium outline-none text-slate-200 placeholder:text-slate-700 bg-white/5 border border-white/5 focus:border-[#13c8ec]/40"
            autoFocus
          />

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShow((s) => !s)}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-200 transition-premium"
            >
              {show ? 'Hide key' : 'Show key'}
            </button>

            <button
              onClick={() => {
                clearGeminiApiKey();
                setValue('');
              }}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-400 transition-premium"
            >
              Clear saved key
            </button>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold text-[10px] uppercase tracking-widest transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const trimmed = value.trim();
              if (!trimmed) return;
              setGeminiApiKey(trimmed);
              onSaved?.();
              onClose();
            }}
            disabled={!value.trim()}
            className="flex-1 py-3.5 rounded-xl bg-[#13c8ec] hover:bg-white disabled:opacity-20 text-[#0b1619] font-bold text-[10px] uppercase tracking-widest transition-colors shadow-lg active:scale-95"
          >
            Save key
          </button>
        </div>

        <p className="mt-6 text-[11px] text-slate-600 leading-relaxed">
          This key is stored only in your browser (localStorage). If you’re on a shared computer, use “Clear saved key” when done.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyModal;

