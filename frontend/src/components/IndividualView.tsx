import { useState } from "react";
import { 
  User, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  RotateCw, 
  HelpCircle,
  FileText,
  Clock,
  History,
  CheckCircle,
  Hash
} from "lucide-react";
import { SAMPLE_MOTIONS, DebateMotion, ViewTab } from "../types";

interface IndividualProps {
  setActiveTab: (tab: ViewTab) => void;
  triggerToast: (msg: string) => void;
  activeMotion: DebateMotion;
  setActiveMotion: (motion: DebateMotion) => void;
  setDurationOption: (dur: "1" | "3" | "5") => void;
  durationOption: "1" | "3" | "5";
}

export default function IndividualView({ 
  setActiveTab, 
  triggerToast, 
  activeMotion, 
  setActiveMotion,
  setDurationOption,
  durationOption
}: IndividualProps) {
  const [customMotionText, setCustomMotionText] = useState("");
  const [streakCount, setStreakCount] = useState(14);
  const [completedDrills, setCompletedDrills] = useState<string[]>([
    "Socratic questioning drill",
    "Evidence vetting casefile B",
    "Climate change framing module"
  ]);

  const rollRandomMotion = () => {
    const unselectedValues = SAMPLE_MOTIONS.filter((m) => m.id !== activeMotion.id);
    const chosen = unselectedValues[Math.floor(Math.random() * unselectedValues.length)];
    setActiveMotion(chosen);
    setCustomMotionText("");
    triggerToast(`Memuat Motion Baru: "${chosen.title}"`);
  };

  const handleCustomMotionSubmit = () => {
    if (!customMotionText.trim()) {
      triggerToast("Masukkan topik motion custom terlebih dahulu!");
      return;
    }
    const custom: DebateMotion = {
      id: `CUST-${Math.floor(Math.random()*1000)}`,
      title: customMotionText,
      category: "Custom Topic",
      difficulty: "Medium",
      context: "User-defined dynamic debate laboratory focus topic."
    };
    setActiveMotion(custom);
    triggerToast(`Topik custom dimasukkan sebagai motion aktif!`);
  };

  const incrementStreak = () => {
    setStreakCount((prev) => prev + 1);
    const list = ["Quick rebuttal exercise", ...completedDrills];
    setCompletedDrills(list);
    triggerToast("Latihan Mandiri Selesai! Streak bertambah! ⚡");
  };

  const initializeSpar = () => {
    triggerToast(`Menginisilisasi Sesi Spar Mandiri: "${activeMotion.title}"`);
    setTimeout(() => {
      setActiveTab("spar");
    }, 1000);
  };

  return (
    <div id="individual-view" className="flex-1 overflow-y-auto bg-brand-bg text-brand-text p-6 md:p-8 font-sans">
      {/* View Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-brand-text tracking-tighter">
            Individual Drilling Lab
          </h2>
          <p className="font-sans text-xs md:text-sm text-brand-text-muted mt-1">
            Build structural muscle memory on self-framed arguments, refutations, and public speeches.
          </p>
        </div>
        
        {/* Streak Indicator */}
        <div 
          onClick={incrementStreak}
          className="bg-brand-surface-high border border-white/5 py-2 px-4 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-all duration-300 group"
          title="Selesaikan Latihan Harian Anda!"
        >
          <div className="w-8 h-8 rounded-full bg-brand-tertiary/10 flex items-center justify-center border border-brand-tertiary/20 group-hover:scale-110 transition-transform">
            <Flame className="h-4.5 w-4.5 text-brand-tertiary fill-brand-tertiary/20" />
          </div>
          <div>
            <p className="font-heading text-xs font-bold text-brand-text">
              {streakCount} Days Streak
            </p>
            <p className="font-mono text-[9px] text-brand-text-muted uppercase tracking-wider">
              Practice today to extend
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Motion Selection & Customizer */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Motion Card */}
          <div className="glass-card rounded-2xl p-6 border border-white/[0.08] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-12 -mt-12 blur-2xl" />
            
            <div className="flex justify-between items-center mb-6">
              <span className="font-mono text-[9px] bg-brand-surface-high border border-white/5 py-1 px-3 rounded text-brand-primary font-bold uppercase tracking-widest">
                Active Motion Focus
              </span>
              <button
                onClick={rollRandomMotion}
                className="font-mono text-[9px] uppercase tracking-wider flex items-center gap-1.5 text-brand-text-muted hover:text-brand-primary transition-colors bg-white/5 hover:bg-white/10 p-1.5 px-3 rounded-lg cursor-pointer"
              >
                <RotateCw className="h-3 w-3" /> Acak Motion
              </button>
            </div>

            {/* Display active motion details */}
            <div className="space-y-4">
              <h3 className="font-heading text-xl md:text-2xl font-extrabold text-brand-text leading-snug tracking-tight">
                "{activeMotion.title}"
              </h3>
              
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="font-mono text-[9px] bg-brand-surface-highest border border-white/5 p-1 px-2.5 rounded text-brand-text-muted font-semibold">
                  Cat: {activeMotion.category}
                </span>
                <span className="font-mono text-[9px] bg-brand-surface-highest border border-white/5 p-1 px-2.5 rounded text-brand-secondary font-semibold">
                  Tingkat: {activeMotion.difficulty}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mt-4">
                <div className="flex gap-2 items-start">
                  <HelpCircle className="h-4.5 w-4.5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-mono text-[9.5px] font-bold text-brand-primary uppercase tracking-wide">
                      Context &amp; Warrants
                    </h5>
                    <p className="font-sans text-xs text-brand-text-muted mt-1 leading-relaxed">
                      {activeMotion.context}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Custom Motion Field Input */}
          <div className="glass-card rounded-2xl p-6 border border-white/[0.08] space-y-4">
            <h3 className="font-heading text-lg font-bold text-brand-text">
              Custom Topic Creator
            </h3>
            <p className="font-sans text-xs text-brand-text-muted">
              Enter your own motion statement to practice niche debate categories or special interest rounds.
            </p>
            <div className="space-y-3">
              <textarea
                value={customMotionText}
                onChange={(e) => setCustomMotionText(e.target.value)}
                placeholder='E.g. "We would implement a carbon credit index to regulate fast fashion distribution..."'
                className="w-full bg-brand-surface border border-white/5 focus:border-brand-primary/50 text-xs p-4 rounded-xl min-h-[90px] focus:outline-none transition-colors leading-relaxed placeholder-brand-text-muted/30"
              />
              <button
                onClick={handleCustomMotionSubmit}
                className="bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary font-mono text-[10px] uppercase tracking-wider py-2.5 px-6 rounded-lg border border-brand-primary/20 transition-all cursor-pointer block ml-auto"
              >
                Set Custom Motion
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Timer adjustments & History */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Config and Quick Initialization */}
          <div className="glass-card rounded-2xl p-6 border border-white/[0.08] space-y-6">
            <h3 className="font-heading text-lg font-bold text-brand-text flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-primary" /> Speech Duration
            </h3>

            {/* Speaking Speed and duration selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "1" as const, label: "1 Min", subtitle: "Lightning round" },
                { id: "3" as const, label: "3 Min", subtitle: "Core drill" },
                { id: "5" as const, label: "5 Min", subtitle: "Championship prep" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDurationOption(opt.id)}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer ${
                    durationOption === opt.id
                      ? "bg-brand-primary/15 border-brand-primary text-brand-primary font-bold shadow-[0_0_15px_rgba(195,192,255,0.08)]"
                      : "bg-brand-surface border-white/[0.03] text-brand-text hover:border-white/10"
                  }`}
                >
                  <span className="font-mono text-sm">{opt.label}</span>
                  <span className="text-[8px] text-brand-text-muted/70 mt-1 select-none">{opt.subtitle}</span>
                </button>
              ))}
            </div>

            {/* Spar Initiation Action */}
            <button
              onClick={initializeSpar}
              className="w-full bg-brand-primary hover:bg-brand-primary/95 text-brand-lowest py-4 font-heading font-bold text-xs rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.01] transition-transform duration-300 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              Inisialisasi Spar Room <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Practice History and accomplishments log */}
          <div className="glass-card rounded-2xl p-6 border border-white/[0.08] space-y-4">
            <h3 className="font-heading text-lg font-bold text-brand-text flex items-center gap-2">
              <History className="h-5 w-5 text-brand-secondary" /> Practice Log
            </h3>
            
            <div className="space-y-2.5">
              {completedDrills.map((drill, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <p className="font-sans text-xs text-brand-text tracking-wide truncate max-w-[180px]">
                    {drill}
                  </p>
                  <span className="font-mono text-[8px] text-brand-secondary uppercase font-semibold gap-1 flex items-center bg-brand-secondary/10 px-2 py-0.5 rounded border border-brand-secondary/15">
                    <CheckCircle className="h-3 w-3" /> Completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
