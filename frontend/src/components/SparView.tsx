import { useState, useEffect, useRef } from "react";
import { 
  Users, 
  Clock, 
  Mic, 
  Sparkles, 
  Volume2, 
  Wifi, 
  Play, 
  Square,
  ChevronRight, 
  Lightbulb, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { DebateMotion, ViewTab } from "../types";

interface SparProps {
  setActiveTab: (tab: ViewTab) => void;
  triggerToast: (msg: string) => void;
  activeMotion: DebateMotion;
  durationOption: "1" | "3" | "5";
}

export default function SparView({ setActiveTab, triggerToast, activeMotion, durationOption }: SparProps) {
  const [isDebating, setIsDebating] = useState<boolean>(false);
  const [activeSpeaker, setActiveSpeaker] = useState<"user" | "ai" | "idle">("idle");
  const [timeLeft, setTimeLeft] = useState<number>(parseInt(durationOption, 10) * 60);
  const [userWaveform, setUserWaveform] = useState<number[]>([4, 6, 8, 4, 3, 5, 4]);
  const [aiWaveform, setAiWaveform] = useState<number[]>([4, 5, 3, 6, 4, 8, 4]);
  const [rebuttals, setRebuttals] = useState<string[]>([
    "Initial rebuttal matrix initialized. Waiting for speaker statement...",
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set time left when duration option updates
  useEffect(() => {
    setTimeLeft(parseInt(durationOption, 10) * 60);
  }, [durationOption]);

  // Debate speech timer
  useEffect(() => {
    if (isDebating && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsDebating(false);
            setActiveSpeaker("idle");
            triggerToast("Waktu Sesi Spar Berakhir!");
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isDebating, timeLeft]);

  // Simulated audio waveforms matching speaker
  useEffect(() => {
    if (isDebating) {
      speechIntervalRef.current = setInterval(() => {
        if (activeSpeaker === "user") {
          setUserWaveform(Array.from({ length: 8 }, () => Math.floor(Math.random() * 32) + 6));
          setAiWaveform(Array.from({ length: 8 }, () => Math.floor(Math.random() * 6) + 4));
        } else if (activeSpeaker === "ai") {
          setAiWaveform(Array.from({ length: 8 }, () => Math.floor(Math.random() * 35) + 6));
          setUserWaveform(Array.from({ length: 8 }, () => Math.floor(Math.random() * 6) + 4));
        } else {
          setUserWaveform([6, 8, 4, 6, 8, 4, 6, 4]);
          setAiWaveform([6, 8, 4, 6, 8, 4, 6, 4]);
        }
      }, 120);
    } else {
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
      setUserWaveform([6, 8, 4, 6, 8, 4, 6, 4]);
      setAiWaveform([6, 8, 4, 6, 8, 4, 6, 4]);
    }

    return () => {
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
    };
  }, [isDebating, activeSpeaker]);

  const toggleDebateState = () => {
    if (!isDebating) {
      setIsDebating(true);
      setActiveSpeaker("user");
      setTimeLeft(parseInt(durationOption, 10) * 60);
      setRebuttals([
        "Analyzing speech markers for Matter integrity...",
        "Identifying core stakeholder framing...",
      ]);
      triggerToast("Sesi Spar dimulai! Anda mendapat giliran bicara pertamamu!");
    } else {
      setIsDebating(false);
      setActiveSpeaker("idle");
      triggerToast("Spar dijeda.");
    }
  };

  const switchSpeaker = () => {
    if (!isDebating) return;
    const nextSpk = activeSpeaker === "user" ? "ai" : "user";
    setActiveSpeaker(nextSpk);
    
    if (nextSpk === "ai") {
      triggerToast("The Critic v4 sedang memberikan tanggapan rebuttals!");
      // Simulate real rebuttals appending logically
      setTimeout(() => {
        setRebuttals((prev) => [
          `Critic v4 counterpoint: "Prioritizing local resource controls fails to resolve the global coordination problem."`,
          ...prev
        ]);
      }, 1500);
      setTimeout(() => {
        setRebuttals((prev) => [
          `Critic v4 structural check: "Acknowledge the model weights policy gap before advancing stakeholder arguments."`,
          ...prev
        ]);
      }, 3500);
    } else {
      triggerToast("Kembali ke giliran berbicara Anda!");
    }
  };

  const endSparSession = () => {
    setIsDebating(false);
    setActiveSpeaker("idle");
    triggerToast("Menyimpan rekaman sesi sparring. Menyiapkan Adjudication Ballot...");
    setTimeout(() => {
      setActiveTab("evaluation");
    }, 1200);
  };

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div id="spar-view" className="flex-1 overflow-y-auto bg-brand-bg text-brand-text font-sans flex flex-col">
      {/* Dynamic Marquee debate category ticker */}
      <div className="bg-brand-secondary/10 border-b border-brand-secondary/20 py-2.5 overflow-hidden whitespace-nowrap select-none">
        <div className="font-mono text-[9px] uppercase tracking-[0.18em] font-extrabold text-brand-secondary inline-block animate-marquee">
          ACTIVE DEBATE SPARK: "{activeMotion.title}" • ARENA ROOM CODE: LABX42 • STANDARD: WUDC PARLIAMENTARY RULES • TRANSCRIPTION PIPELINE STABLE
        </div>
      </div>

      <div className="p-6 md:p-8 flex-1 flex flex-col space-y-6 max-w-7xl mx-auto w-full">
        {/* Header section with connection stats */}
        <div className="flex justify-between items-center bg-brand-surface-high/40 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <h3 className="font-heading text-sm font-bold text-brand-text flex items-center gap-1.5 uppercase tracking-wide">
              Sparring Arena Room-042
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-brand-text-muted flex items-center gap-1">
              <Wifi className="h-4 w-4 text-brand-secondary" />
              Latency: 18ms
            </span>
          </div>
        </div>

        {/* Dynamic Dual Speaker Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* User Card: Anda (PRO) */}
          <div className={`glass-card p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
            activeSpeaker === "user" ? "border-brand-primary bg-brand-primary/[0.02]" : "border-white/[0.08]"
          }`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/[0.01]" />
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPLI0zri2cvNeHpjPhlVpCa7_Pyj9JpbjlRIIMpqS-0FLwe_Qtu5I2uIP4PnoCDSk8_Z0DBWVfxej51fxOtDHI0U40JRD7FeAH62E2tA9iJ78H-D06k1B3MMf5OotR1jbPhyiCpsHym_7fEiU-UzC8hj3gCNTGFAlYk9qXBGpBiMm3MwcpVlpoO1tY7GBX1bIb7LmRd_iwji0WRqpZPAqWeFCG36eHqkkIHfeR7YiwzJz44eRxlYI9n97GfSIbr8yEA8CiD9aKQss"
                  alt="User Avatar"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-brand-primary/20"
                />
                <div>
                  <p className="font-heading text-xs font-mono tracking-wider uppercase text-brand-text-muted">
                    POLISI PRO
                  </p>
                  <p className="font-heading text-md font-extrabold text-brand-text">
                    Anda (Varsity)
                  </p>
                </div>
              </div>
              <span className={`font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                activeSpeaker === "user" ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary" : "bg-white/5 border-white/5 text-brand-text-muted"
              }`}>
                {activeSpeaker === "user" ? "Speaking" : "Muted"}
              </span>
            </div>

            {/* User Waveform visualizer */}
            <div className="my-8 flex justify-center items-center gap-1.5 h-14">
              {userWaveform.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className={`w-2.5 rounded-full transition-all duration-100 ${
                    activeSpeaker === "user" ? "bg-brand-primary shadow-[0_0_8px_rgba(195,192,255,0.4)]" : "bg-brand-surface-high"
                  }`}
                />
              ))}
            </div>

            <p className="font-sans text-xs text-brand-text-muted italic text-center max-w-[280px] mx-auto select-none">
              {activeSpeaker === "user" ? "Mik Anda aktif. Bicaralah secara runtut dan fokus pada argumen utama." : "Bicara dijeda sementara menunggu lawan."}
            </p>
          </div>

          {/* Adversary Card: Critic v4 (CONTRA) */}
          <div className={`glass-card p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
            activeSpeaker === "ai" ? "border-brand-secondary bg-brand-secondary/[0.02]" : "border-white/[0.08]"
          }`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-secondary/[0.01]" />
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200"
                  alt="Cyber AI Enemy Avatar"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-brand-secondary/20"
                />
                <div>
                  <p className="font-heading text-xs font-mono tracking-wider uppercase text-brand-text-muted">
                    POLISI CONTRA
                  </p>
                  <p className="font-heading text-md font-extrabold text-brand-secondary">
                    The Critic v4 (AI)
                  </p>
                </div>
              </div>
              <span className={`font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                activeSpeaker === "ai" ? "bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary" : "bg-white/5 border-white/5 text-brand-text-muted"
              }`}>
                {activeSpeaker === "ai" ? "Speaking" : "Muted"}
              </span>
            </div>

            {/* Adversary Waveform visualizer */}
            <div className="my-8 flex justify-center items-center gap-1.5 h-14">
              {aiWaveform.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className={`w-2.5 rounded-full transition-all duration-100 ${
                    activeSpeaker === "ai" ? "bg-brand-secondary shadow-[0_0_8px_rgba(137,206,255,0.4)]" : "bg-brand-surface-high"
                  }`}
                />
              ))}
            </div>

            <p className="font-sans text-xs text-brand-text-muted italic text-center max-w-[280px] mx-auto select-none">
              {activeSpeaker === "ai" ? "AI sedang berbicara. Analisis struktur rebuttal sedang dioptimalkan..." : "AI sedang mendengarkan argumen Anda..."}
            </p>
          </div>
        </div>

        {/* Real-time AI Rebuttal Logging Box */}
        <div className="glass-card rounded-2xl p-6 border border-white/[0.08] flex-1 flex flex-col justify-between min-h-[200px]">
          <div>
            <h4 className="font-heading text-sm font-bold text-brand-text flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-brand-primary" /> Core Rebuttal Output (Critical Insight Pipeline)
            </h4>
            <div className="space-y-2.5 max-h-[140px] overflow-y-auto">
              {rebuttals.map((r, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-xl border font-mono text-[10px] leading-relaxed flex gap-2 ${
                    i === 0 
                      ? "bg-brand-primary/5 border-brand-primary/20 text-brand-primary" 
                      : "bg-white/[0.01] border-white/5 text-brand-text-muted"
                  }`}
                >
                  <span className="text-brand-tertiary">⚡</span>
                  <div>{r}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Persistent speaking stopwatch & arena controls */}
        <div className="bg-brand-surface border border-white/5 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6 text-brand-primary" />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-brand-text-muted">
                Speech Clock
              </p>
              <p className="font-heading text-xl font-bold text-brand-text mt-0.5 font-mono">
                {formatCountdown(timeLeft)}
              </p>
            </div>
          </div>

          {/* Dynamic state switchers */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={toggleDebateState}
              className={`flex-1 sm:flex-initial py-3.5 px-6 font-heading font-bold text-xs rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                isDebating 
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30" 
                  : "bg-brand-primary text-brand-lowest hover:bg-brand-primary/95 shadow-lg shadow-brand-primary/20"
              }`}
            >
              {isDebating ? <><Square className="h-3.5 w-3.5 fill-current" /> Jeda</> : <><Play className="h-3.5 w-3.5 fill-current" /> Mulai Spar</>}
            </button>

            {isDebating && (
              <button
                onClick={switchSpeaker}
                className="flex-1 sm:flex-initial py-3.5 px-6 font-mono text-[10px] uppercase tracking-wider rounded-xl border border-white/10 hover:bg-white/5 transition-colors cursor-pointer text-center text-brand-text"
              >
                Ganti Turn: {activeSpeaker === "user" ? "AI lawan" : "Anda"}
              </button>
            )}

            <button
              onClick={endSparSession}
              className="flex-1 sm:flex-initial bg-brand-surface-high border border-white/10 hover:border-brand-primary/40 py-3.5 px-6 font-heading font-bold text-xs rounded-xl text-brand-text transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              Akhiri Sesi <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
