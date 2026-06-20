import { useState, useEffect, useRef } from "react";
import { 
  Award, 
  Play, 
  Pause, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Volume2, 
  BookOpen, 
  ArrowRight,
  Info,
  Calendar
} from "lucide-react";
import { FALLACY_DATA, FallacyLogItem, ViewTab } from "../types";

interface EvaluationProps {
  setActiveTab: (tab: ViewTab) => void;
  triggerToast: (msg: string) => void;
  activeMotionTitle: string;
  durationOption: string;
}

export default function EvaluationView({ setActiveTab, triggerToast, activeMotionTitle, durationOption }: EvaluationProps) {
  const [activeFeedbackTab, setActiveFeedbackTab] = useState<"rfd" | "strengths" | "steps">("rfd");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioSeekTime, setAudioSeekTime] = useState<number>(12); // seconds
  const [selectedFallacyIndex, setSelectedFallacyIndex] = useState<number | null>(null);

  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxAudioDuration = 120; // 2 minutes representation

  // Audio simulation timer
  useEffect(() => {
    if (isPlayingAudio) {
      audioTimerRef.current = setInterval(() => {
        setAudioSeekTime((prev) => {
          if (prev >= maxAudioDuration) {
            setIsPlayingAudio(false);
            if (audioTimerRef.current) clearInterval(audioTimerRef.current);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    }

    return () => {
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    };
  }, [isPlayingAudio]);

  const toggleAudioPlayback = () => {
    setIsPlayingAudio(!isPlayingAudio);
    triggerToast(isPlayingAudio ? "Audio dijeda." : "Memutar rekaman pidato Spar.");
  };

  const handleFallacyClick = (index: number, fallacy: FallacyLogItem) => {
    setSelectedFallacyIndex(index);
    // Dynamic seek time simulation matching the fallacy
    const parsedMinutes = parseInt(fallacy.timestamp.split(":")[0], 10) || 0;
    const parsedSeconds = parseInt(fallacy.timestamp.split(":")[1], 10) || 0;
    setAudioSeekTime((parsedMinutes * 60 + parsedSeconds) % maxAudioDuration);
    triggerToast(`Mempercepat audio ke timestamp kesalahan logika ${fallacy.fallacyType} (${fallacy.timestamp})`);
  };

  const formatAudioTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div id="evaluation-view" className="flex-1 overflow-y-auto bg-brand-bg text-brand-text p-6 md:p-8 font-sans">
      {/* Upper View heading */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-brand-text tracking-tighter">
            Adjudication &amp; Ballot Summary
          </h2>
          <p className="font-sans text-xs md:text-sm text-brand-text-muted mt-1">
            Official evaluation according to international parliamentary voting guidelines.
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-center select-none shrink-0">
          <p className="font-mono text-[8px] uppercase tracking-widest text-emerald-400 font-semibold mb-0.5">ROUND OUTCOME</p>
          <p className="font-heading text-md font-extrabold text-emerald-400">VICTORY (78/100 Marks)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Official Decision feedback and Audio Timeline */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Motion topic information */}
          <div className="glass-card rounded-2xl p-6 border border-white/[0.08]" id="active-motion-banner">
            <span className="font-mono text-[8px] uppercase tracking-wider text-brand-text-muted font-bold flex items-center gap-1.5 mb-2">
              <Calendar className="h-3.5 w-3.5" /> DEBATED CASEFILE #LAB2026
            </span>
            <h3 className="font-heading text-lg font-extrabold text-brand-text">
              "{activeMotionTitle}"
            </h3>
          </div>

          {/* Interactive Opinion Tabs (RFD, Strengths, Growth) */}
          <div className="glass-card rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex border-b border-white/5 space-x-6 mb-6">
              {[
                { id: "rfd" as const, label: "Reasons for Decision" },
                { id: "strengths" as const, label: "Strengths & Growth" },
                { id: "steps" as const, label: "Suggested Drills" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeedbackTab(tab.id)}
                  className={`pb-3 font-heading font-bold text-xs uppercase tracking-wider cursor-pointer relative transition-all duration-300 ${
                    activeFeedbackTab === tab.id
                      ? "text-brand-primary"
                      : "text-brand-text-muted/65 hover:text-brand-text"
                  }`}
                >
                  {tab.label}
                  {activeFeedbackTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-primary rounded-t" />
                  )}
                </button>
              ))}
            </div>

            {/* Render dynamic category details */}
            <div className="min-h-[160px] flex flex-col justify-between">
              {activeFeedbackTab === "rfd" && (
                <div className="space-y-4">
                  <p className="font-sans text-xs md:text-sm text-brand-text-muted leading-relaxed">
                    The Government Bench takes this debate by soundly proving that the decentralized models alleviate sovereign compliance bottlenecks. The Opposition Bench failed to establish why centralized server centers could operate safely in conflicting jurisdictions.
                  </p>
                  <p className="font-sans text-xs md:text-sm text-brand-text-muted leading-relaxed">
                    While the Opposition claimed central audits prevent malicious deployment, the Government successfully counter-argued that total central trust acts as a singular points of systemic failure.
                  </p>
                </div>
              )}

              {activeFeedbackTab === "strengths" && (
                <div className="space-y-4">
                  <div className="flex gap-2.5 items-start">
                    <span className="text-emerald-400 text-xs">✔</span>
                    <div>
                      <p className="font-heading text-xs font-bold text-brand-text mb-0.5">Exceptional Structural Rigidity</p>
                      <p className="font-sans text-xs text-brand-text-muted">Your separation of matter points across economic and regulatory vectors was highly legible.</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <span className="text-amber-400 text-xs">⚠</span>
                    <div>
                      <p className="font-heading text-xs font-bold text-brand-text mb-0.5">Room for Growth: Stakeholder Weighing</p>
                      <p className="font-sans text-xs text-brand-text-muted">You must explain why impacts to agricultural developing sectors out-prioritize municipal tech capitals.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeFeedbackTab === "steps" && (
                <div className="space-y-4">
                  <p className="font-sans text-xs text-brand-text-muted mb-4">
                    Based on your speech, we recommend practicing these specific modules from the Syllabus suite:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                      onClick={() => { setActiveTab("coaching"); triggerToast("Memuat Syllabus: Comparative Policy Weighing"); }}
                      className="p-3 text-left rounded-xl border border-white/5 bg-brand-surface hover:border-brand-primary/40 transition-colors flex justify-between items-center group cursor-pointer"
                    >
                      <div>
                        <p className="font-heading text-xs font-bold text-brand-text truncate">Comparative Weighing</p>
                        <p className="font-mono text-[9px] text-brand-text-muted mt-0.5">Category: impact • 12 mins</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-brand-text-muted group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => { setActiveTab("coaching"); triggerToast("Memuat Syllabus: Counter-Framing Dynamics"); }}
                      className="p-3 text-left rounded-xl border border-white/5 bg-brand-surface hover:border-brand-primary/40 transition-colors flex justify-between items-center group cursor-pointer"
                    >
                      <div>
                        <p className="font-heading text-xs font-bold text-brand-text truncate">Counter-Framing</p>
                        <p className="font-mono text-[9px] text-brand-text-muted mt-0.5">Category: strategy • 10 mins</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-brand-text-muted group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DRAGGABLE TIMELINE Speech Recording Player */}
          <div className="glass-card rounded-2xl p-6 border border-white/[0.08] space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-heading text-xs uppercase tracking-wider text-brand-text font-bold">
                Speech Playback Analyser
              </h4>
              <span className="font-mono text-[10px] text-brand-text-muted select-none">
                {formatAudioTime(audioSeekTime)} / {formatAudioTime(maxAudioDuration)}
              </span>
            </div>

            {/* Custom Interactive Player Row */}
            <div className="flex items-center gap-5">
              <button
                onClick={toggleAudioPlayback}
                className="w-12 h-12 rounded-full bg-brand-primary hover:bg-brand-primary/95 text-brand-lowest flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                {isPlayingAudio ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
              </button>

              {/* Graphical timeline with linear slider */}
              <div className="flex-1 space-y-2">
                <input 
                  type="range" 
                  min="0" 
                  max={maxAudioDuration} 
                  value={audioSeekTime}
                  onChange={(e) => {
                    const seekVal = parseInt(e.target.value, 10);
                    setAudioSeekTime(seekVal);
                    triggerToast(`Menuju ke waktu ${formatAudioTime(seekVal)}`);
                  }}
                  className="w-full accent-brand-primary shrink-0 bg-brand-surface-high rounded-lg cursor-pointer h-1"
                />
                
                {/* SVG wave background */}
                <div className="h-6 flex items-end gap-[2px] opacity-25">
                  {Array.from({ length: 45 }).map((_, i) => {
                    // Highlight bar index depending on temporal match
                    const progressRatio = audioSeekTime / maxAudioDuration;
                    const isPlayed = i / 45 <= progressRatio;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t ${isPlayed ? "bg-brand-primary" : "bg-white/40"}`}
                        style={{ height: `${(Math.sin(i * 0.2) + 1.2) * 10 + 4}px` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Expert Radar & Logic Fallacy Log */}
        <div className="lg:col-span-5 space-y-6">
          {/* Skill Radar polygon highlights */}
          <div className="glass-card rounded-2xl p-6 border border-white/[0.08] relative overflow-hidden">
            <h3 className="font-heading text-lg font-bold text-brand-text mb-4">
              Performance Radar
            </h3>
            
            {/* Custom Simple Metric Progress Grid */}
            <div className="space-y-3.5">
              {[
                { name: "Matter (Logika & Relevansi)", score: 79, color: "bg-brand-primary" },
                { name: "Manner (Persuasif & Teknik)", score: 76, color: "bg-brand-secondary" },
                { name: "Method (Struktur & Waktu)", score: 74, color: "bg-brand-tertiary" },
                { name: "Logic (Falasi Konsistensi)", score: 82, color: "bg-indigo-400" },
                { name: "Evidence (Kekuatan Sumber)", score: 80, color: "bg-emerald-400" }
              ].map((metric, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-sans font-medium text-brand-text">{metric.name}</span>
                    <span className="font-mono font-bold text-brand-text">{metric.score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-brand-surface-high rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${metric.color} transition-all duration-500`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive LOGIC FALLACY LOG */}
          <div className="glass-card rounded-2xl p-6 border border-white/[0.08]" id="fallacy-log">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-lg font-bold text-brand-text flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-brand-tertiary" /> Logical Fallacy Log
              </h3>
              <span className="font-mono text-[9px] uppercase tracking-wider text-brand-tertiary font-bold bg-brand-tertiary/10 px-2 py-0.5 rounded border border-brand-tertiary/20">
                {FALLACY_DATA.length} Flags
              </span>
            </div>

            <p className="font-sans text-xs text-brand-text-muted mb-4">
              Our AI detected speech patterns that weaken consistency. Click on any flagged item to jump directly to the exact audio segment transcript.
            </p>

            <div className="space-y-2.5">
              {FALLACY_DATA.map((fallacy, idx) => {
                const isSelected = selectedFallacyIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => handleFallacyClick(idx, fallacy)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? "border-brand-tertiary bg-brand-tertiary/10" 
                        : "border-white/[0.04] bg-white/[0.02] hover:bg-white/5"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-mono text-[10px] font-bold text-brand-text uppercase tracking-wide">
                        {fallacy.fallacyType}
                      </span>
                      <span className="font-mono text-[9px] text-brand-text-muted">
                        ⏱ {fallacy.timestamp}
                      </span>
                    </div>
                    
                    <p className="font-sans text-xs text-brand-text-muted mt-1 italic pl-2.5 border-l border-brand-outline">
                      {fallacy.snippet}
                    </p>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-brand-tertiary/20 space-y-2">
                        <div className="flex gap-1.5 items-start">
                          <Info className="h-3.5 w-3.5 text-brand-primary shrink-0 mt-0.5" />
                          <p className="font-sans text-[11px] text-brand-text">
                            <span className="font-semibold text-brand-primary">AI Analysis:</span> {fallacy.aiAnalysis}
                          </p>
                        </div>
                        <div className="flex gap-1.5 items-start">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <p className="font-sans text-[11px] text-emerald-300">
                            <span className="font-semibold text-emerald-400">Lesson:</span> {fallacy.mitigation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
