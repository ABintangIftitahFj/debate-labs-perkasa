import { 
  Search, 
  Bell, 
  Settings, 
  CheckCircle2, 
  GraduationCap, 
  User, 
  Users, 
  Sparkles, 
  TrendingUp, 
  Award, 
  ChevronRight,
  Menu
} from "lucide-react";
import { ViewTab } from "../types";
import { useState } from "react";

interface DashboardProps {
  setActiveTab: (tab: ViewTab) => void;
  triggerToast: (msg: string) => void;
}

export default function DashboardView({ setActiveTab, triggerToast }: DashboardProps) {
  const [drillCompleted, setDrillCompleted] = useState(false);

  const startDrillHandler = () => {
    setDrillCompleted(true);
    triggerToast("Memulai Latihan Focus: Refine Impact Links!");
    setTimeout(() => {
      setActiveTab("individual");
    }, 1200);
  };

  return (
    <div id="dashboard-view" className="flex-1 flex flex-col relative overflow-y-auto bg-brand-bg text-brand-text font-sans">
      {/* Top Header */}
      <header className="flex justify-between items-center px-6 md:px-8 w-full sticky top-0 z-40 bg-brand-bg/85 backdrop-blur-md h-16 border-b border-white/[0.08]">
        <div className="flex items-center gap-4">
          <Menu className="h-5 w-5 text-brand-primary cursor-pointer hover:rotate-12 transition-transform duration-300" />
          <h2 className="font-heading text-lg md:text-xl font-bold text-brand-text tracking-tighter">
            Command Center
          </h2>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex bg-brand-surface-high px-4 py-1.5 rounded-full items-center gap-2 border border-white/5 shadow-inner">
            <Search className="h-4 w-4 text-brand-text-muted" />
            <input 
              type="text" 
              placeholder="Search case files..." 
              className="bg-transparent border-none text-xs focus:outline-none w-48 text-brand-text placeholder-brand-text-muted/50"
            />
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => triggerToast("Tidak ada notifikasi baru")}
              className="p-2 text-brand-text-muted hover:text-brand-primary transition-colors cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-tertiary rounded-full" />
            </button>
            <button 
              onClick={() => triggerToast("Buka pengaturan")}
              className="p-2 text-brand-text-muted hover:text-brand-primary transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-20 flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Ambient Neon Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-[300px] h-[300px] bg-brand-secondary/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-brand-primary/10 border border-brand-primary/20 shadow-sm animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
            <span className="font-mono text-[9px] md:text-xs text-brand-primary uppercase tracking-[0.15em] font-medium">
              Next Generation Debate Intelligence
            </span>
          </div>

          <h1 className="font-heading text-4xl md:text-7xl font-extrabold text-brand-text mb-6 tracking-tight leading-tight">
            <span className="text-glow bg-gradient-to-r from-white via-brand-primary to-brand-secondary bg-clip-text text-transparent">
              Debate Labs
            </span>
          </h1>

          <p className="font-sans text-sm md:text-lg text-brand-text-muted max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Master the Art of Argument with AI-Powered Insights. Transform raw rhetoric into surgical precision with real-time feedback and high-fidelity analysis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => setActiveTab("coaching")}
              className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary/95 text-brand-lowest px-10 py-4 font-heading font-bold text-sm md:text-md rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.03] active:scale-95 transition-all duration-300 cursor-pointer"
            >
              Mulai Latihan
            </button>
            <button 
              onClick={() => triggerToast("Fitur Tour: Menjelajahi Analisis Debat Baru!")}
              className="w-full sm:w-auto glass-card px-10 py-4 font-heading font-bold text-sm md:text-md rounded-xl hover:bg-white/5 active:scale-95 transition-all duration-300 cursor-pointer text-brand-text"
            >
              Tour Features
            </button>
          </div>
        </div>
      </section>

      {/* Ecosystem Bento Cards */}
      <section className="px-6 md:px-8 py-10 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h3 className="font-heading text-xl md:text-2xl font-bold text-brand-text">
            Training Ecosystem
          </h3>
          <p className="font-sans text-xs md:text-sm text-brand-text-muted mt-1">
            Three distinct modes designed to sharpen your edge in the arena.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coaching Mode */}
          <div className="glass-card p-6 rounded-2xl flex flex-col h-full relative group overflow-hidden border border-white/[0.08]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -mr-8 -mt-8 blur-xl group-hover:bg-brand-primary/15 transition-all duration-500" />
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-6 border border-brand-primary/20">
              <GraduationCap className="h-6 w-6 text-brand-primary" />
            </div>
            <h4 className="font-heading text-lg font-bold text-brand-text mb-2 tracking-tight">
              Coaching Mode
            </h4>
            <p className="font-sans text-xs text-brand-text-muted min-h-[50px] mb-6 leading-relaxed">
              Guided sessions with AI mentors who dissect your logic in real-time, offering instant structural improvements.
            </p>
            <ul className="space-y-3 mb-6 mt-auto">
              <li className="flex items-center gap-2.5 font-mono text-[10px] text-brand-text">
                <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0" />
                <span>Logic Consistency Check</span>
              </li>
              <li className="flex items-center gap-2.5 font-mono text-[10px] text-brand-text">
                <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0" />
                <span>Rebuttal Scenarios</span>
              </li>
            </ul>
            <button 
              onClick={() => setActiveTab("coaching")}
              className="w-full py-2.5 mt-auto border border-brand-primary/30 rounded-xl font-mono text-[10px] uppercase tracking-wider text-brand-primary hover:bg-brand-primary/15 transition-colors cursor-pointer text-center"
            >
              Select Module
            </button>
          </div>

          {/* Individual Mode */}
          <div className="glass-card p-6 rounded-2xl flex flex-col h-full relative group overflow-hidden border border-white/[0.08]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-secondary/5 rounded-full -mr-8 -mt-8 blur-xl group-hover:bg-brand-secondary/15 transition-all duration-500" />
            <div className="w-12 h-12 rounded-xl bg-brand-secondary/10 flex items-center justify-center mb-6 border border-brand-secondary/20">
              <User className="h-6 w-6 text-brand-secondary" />
            </div>
            <h4 className="font-heading text-lg font-bold text-brand-text mb-2 tracking-tight">
              Individual Mode
            </h4>
            <p className="font-sans text-xs text-brand-text-muted min-h-[50px] mb-6 leading-relaxed">
              Solo drill laboratory. Upload transcripts or record live to receive deep-dive analytics on your Matter and Manner.
            </p>
            <ul className="space-y-3 mb-6 mt-auto">
              <li className="flex items-center gap-2.5 font-mono text-[10px] text-brand-text">
                <CheckCircle2 className="h-4 w-4 text-brand-secondary shrink-0" />
                <span>Vocal Clarity Analysis</span>
              </li>
              <li className="flex items-center gap-2.5 font-mono text-[10px] text-brand-text">
                <CheckCircle2 className="h-4 w-4 text-brand-secondary shrink-0" />
                <span>Evidence Strength Scoring</span>
              </li>
            </ul>
            <button 
              onClick={() => setActiveTab("individual")}
              className="w-full py-2.5 mt-auto border border-brand-secondary/30 rounded-xl font-mono text-[10px] uppercase tracking-wider text-brand-secondary hover:bg-brand-secondary/15 transition-colors cursor-pointer text-center"
            >
              Open Lab
            </button>
          </div>

          {/* Debat Kusir */}
          <div className="glass-card p-6 rounded-2xl flex flex-col h-full relative group overflow-hidden border border-white/[0.08]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-tertiary/5 rounded-full -mr-8 -mt-8 blur-xl group-hover:bg-brand-tertiary/15 transition-all duration-500" />
            <div className="w-12 h-12 rounded-xl bg-brand-tertiary/10 flex items-center justify-center mb-6 border border-brand-tertiary/20">
              <Users className="h-6 w-6 text-brand-tertiary" />
            </div>
            <h4 className="font-heading text-lg font-bold text-brand-text mb-2 tracking-tight">
              Debat Kusir
            </h4>
            <p className="font-sans text-xs text-brand-text-muted min-h-[50px] mb-6 leading-relaxed">
              High-pressure, low-stakes experimental arena. Master the art of persuasion in chaotic, multi-party environments.
            </p>
            <ul className="space-y-3 mb-6 mt-auto">
              <li className="flex items-center gap-2.5 font-mono text-[10px] text-brand-text">
                <CheckCircle2 className="h-4 w-4 text-brand-tertiary shrink-0" />
                <span>Rhetorical Flair Metrics</span>
              </li>
              <li className="flex items-center gap-2.5 font-mono text-[10px] text-brand-text">
                <CheckCircle2 className="h-4 w-4 text-brand-tertiary shrink-0" />
                <span>Audience Engagement</span>
              </li>
            </ul>
            <button 
              onClick={() => setActiveTab("spar")}
              className="w-full py-2.5 mt-auto border border-brand-tertiary/30 rounded-xl font-mono text-[10px] uppercase tracking-wider text-brand-tertiary hover:bg-brand-tertiary/15 transition-colors cursor-pointer text-center"
            >
              Join Arena
            </button>
          </div>
        </div>
      </section>

      {/* Value Proposition & SVG Radar Section */}
      <section className="py-12 bg-brand-surface-low/30 border-y border-white/[0.03]">
        <div className="px-6 md:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Radar Chart Visual Container */}
          <div className="relative flex justify-center items-center">
            <div className="glass-card aspect-square w-full max-w-[400px] rounded-3xl p-8 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-brand-primary/[0.02] pointer-events-none" />
              
              {/* Complex custom SVG radar chart simulation */}
              <div className="relative w-full h-full flex items-center justify-center">
                <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(195,192,255,0.25)]" viewBox="0 0 100 100">
                  {/* Outer and Inner grid polygons */}
                  <polygon fill="none" points="50,5 95,37 78,85 22,85 5,37" stroke="#464555" strokeWidth="0.5" />
                  <polygon fill="none" points="50,20 83,44 71,76 29,76 17,44" stroke="#464555" strokeWidth="0.5" />
                  <polygon fill="none" points="50,35 72,51 64,68 36,68 28,51" stroke="#464555" strokeWidth="0.5" strokeDasharray="1 1" />
                  
                  {/* Axis lines */}
                  <line stroke="#464555" strokeWidth="0.5" x1="50" x2="50" y1="50" y2="5" />
                  <line stroke="#464555" strokeWidth="0.5" x1="50" x2="95" y1="50" y2="37" />
                  <line stroke="#464555" strokeWidth="0.5" x1="50" x2="78" y1="50" y2="85" />
                  <line stroke="#464555" strokeWidth="0.5" x1="50" x2="22" y1="50" y2="85" />
                  <line stroke="#464555" strokeWidth="0.5" x1="50" x2="5" y1="50" y2="37" />
                  
                  {/* Data overlay polygon with beautiful neon color highlight */}
                  <polygon 
                    className="radar-line fill-brand-primary/20 stroke-brand-primary" 
                    points="50,15 88,38 70,80 35,70 15,40" 
                    strokeWidth="1.5" 
                  />
                  {/* Data markers */}
                  <circle cx="50" cy="15" r="2" className="fill-brand-text stroke-brand-primary" strokeWidth="1" />
                  <circle cx="88" cy="38" r="2" className="fill-brand-text stroke-brand-primary" strokeWidth="1" />
                  <circle cx="70" cy="80" r="2" className="fill-brand-text stroke-brand-primary" strokeWidth="1" />
                  <circle cx="35" cy="70" r="2" className="fill-brand-text stroke-brand-primary" strokeWidth="1" />
                  <circle cx="15" cy="40" r="2" className="fill-brand-text stroke-brand-primary" strokeWidth="1" />
                </svg>

                {/* Absolute Labels paired with Geist system styling */}
                <div className="absolute top-0 font-mono text-[9px] font-semibold text-brand-primary uppercase tracking-[0.1em] -translate-y-2">MATTER</div>
                <div className="absolute top-[32%] right-1 font-mono text-[9px] font-semibold text-brand-primary uppercase tracking-[0.1em] translate-x-2">MANNER</div>
                <div className="absolute bottom-1 right-12 font-mono text-[9px] font-semibold text-brand-primary uppercase tracking-[0.1em]">METHOD</div>
                <div className="absolute bottom-1 left-12 font-mono text-[9px] font-semibold text-brand-primary uppercase tracking-[0.1em]">LOGIC</div>
                <div className="absolute top-[32%] left-1 font-mono text-[9px] font-semibold text-brand-primary uppercase tracking-[0.1em] -translate-x-2">EVIDENCE</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-2xl md:text-3.5xl font-extrabold text-brand-text mb-4 leading-tight tracking-tight">
              AI Adjudication &amp; 3-Pillar Analysis
            </h3>
            <p className="font-sans text-brand-text-muted text-sm md:text-md mb-8 leading-relaxed">
              Our proprietary LLM framework analyzes every word through the WUDC standard, focusing on the essential core of competitive debating.
            </p>

            <div className="space-y-6">
              {/* Matter Analysis */}
              <div className="flex gap-4 group cursor-default">
                <div className="w-10 h-10 shrink-0 rounded-full bg-brand-primary-container flex items-center justify-center text-brand-primary font-heading font-bold text-sm transition-transform duration-300 group-hover:scale-110 shadow-sm border border-brand-primary/20">
                  01
                </div>
                <div>
                  <h5 className="font-heading text-md font-bold text-brand-text mb-1 flex items-center gap-1.5">
                    Matter Analysis
                  </h5>
                  <p className="font-sans text-xs text-brand-text-muted leading-relaxed">
                    Deep logical verification of arguments and relevance of evidence presented.
                  </p>
                </div>
              </div>

              {/* Manner Evaluation */}
              <div className="flex gap-4 group cursor-default">
                <div className="w-10 h-10 shrink-0 rounded-full bg-brand-surface-highest flex items-center justify-center text-brand-text-muted font-heading font-bold text-sm transition-transform duration-300 group-hover:scale-110 border border-white/5">
                  02
                </div>
                <div>
                  <h5 className="font-heading text-md font-bold text-brand-text mb-1">
                    Manner Evaluation
                  </h5>
                  <p className="font-sans text-xs text-brand-text-muted leading-relaxed">
                    Tone, persuasion, and stylistic elements that define your impact in the room.
                  </p>
                </div>
              </div>

              {/* Method Strategic Review */}
              <div className="flex gap-4 group cursor-default">
                <div className="w-10 h-10 shrink-0 rounded-full bg-brand-surface-highest flex items-center justify-center text-brand-text-muted font-heading font-bold text-sm transition-transform duration-300 group-hover:scale-110 border border-white/5">
                  03
                </div>
                <div>
                  <h5 className="font-heading text-md font-bold text-brand-text mb-1">
                    Method Strategic Review
                  </h5>
                  <p className="font-sans text-xs text-brand-text-muted leading-relaxed">
                    Structure, time management, and the overall flow of your team's case.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats and Focus Zone */}
      <section className="px-6 md:px-8 py-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Progress Bar Plot */}
          <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between border border-white/[0.08]">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h5 className="font-mono text-[9px] text-brand-text-muted uppercase tracking-widest mb-1 font-semibold">
                  Performance Trend
                </h5>
                <p className="font-heading text-lg font-bold text-brand-text">
                  Weekly Progress
                </p>
              </div>
              <span className="font-mono text-[10px] font-semibold text-brand-secondary bg-brand-secondary/10 px-3 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-brand-secondary" />
                +12.4% vs Last Week
              </span>
            </div>

            {/* Custom Bar Chart Visualizer */}
            <div className="h-44 w-full relative flex items-end gap-2 md:gap-3">
              {[
                { day: "MON", score: 62 },
                { day: "TUE", score: 68 },
                { day: "WED", score: 64 },
                { day: "THU", score: 76 },
                { day: "FRI", score: 72 },
                { day: "SAT", score: 82, active: true },
                { day: "SUN", score: 79 },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center h-full group relative cursor-pointer">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none transform -translate-y-1 bg-brand-surface-highest/90 text-brand-text text-[9px] font-mono px-2 py-0.5 rounded border border-white/10 z-20">
                    S: {bar.score}
                  </div>
                  
                  {/* Bar fill element */}
                  <div 
                    className={`w-full mt-auto rounded-t transition-all duration-500 hover:opacity-100 ${
                      bar.active 
                        ? "bg-brand-primary opacity-100 h-[85%] shadow-[0_-4px_15px_rgba(195,192,255,0.3)]" 
                        : "bg-brand-primary/20 h-[" + Math.floor(bar.score * 0.95) + "%] opacity-80"
                    }`}
                  />
                  <span className="font-mono text-[8px] md:text-[10px] text-brand-text-muted/75 mt-3 select-none">
                    {bar.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Account Status and Daily Drill Callout */}
          <div className="flex flex-col gap-6">
            {/* Rank Card */}
            <div className="glass-card p-6 rounded-2xl flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden border border-white/[0.08] group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-secondary to-brand-primary" />
              <h5 className="font-mono text-[9px] text-brand-text-muted uppercase tracking-widest mb-3 font-semibold">
                Current Rank
              </h5>
              
              <div className="w-16 h-16 rounded-full border-2 border-brand-secondary/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(137,206,255,0.15)] group-hover:scale-105 transition-transform duration-300">
                <Award className="h-8 w-8 text-brand-secondary fill-brand-secondary/20" />
              </div>

              <p className="font-heading text-lg font-bold text-brand-secondary tracking-tight">
                Silver II
              </p>
              <p className="font-mono text-[9px] text-brand-text-muted mt-1 font-semibold">
                1,240 XP to Gold I
              </p>
            </div>

            {/* Daily Focus zone */}
            <div className="glass-card p-6 rounded-2xl flex-1 border border-white/[0.08]">
              <h5 className="font-mono text-[9px] text-brand-primary uppercase tracking-widest mb-3 font-semibold">
                Daily Focus
              </h5>
              <p className="font-heading text-md font-bold text-brand-text mb-1">
                Refine Impact Links
              </p>
              <p className="font-sans text-[11px] text-brand-text-muted mb-5 leading-relaxed">
                You've been losing points on 'Matter Relevance'. Practice explaining exactly why your argument matters to the judge's burden.
              </p>
              
              <button 
                onClick={startDrillHandler}
                disabled={drillCompleted}
                className={`w-full py-2.5 font-mono text-[10px] uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer ${
                  drillCompleted 
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                    : "bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20"
                }`}
              >
                {drillCompleted ? "Latihan Selesai! Dialihkan..." : "Mulai Latihan"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="mt-auto px-6 py-6 border-t border-white/[0.03] text-center select-none">
        <p className="font-mono text-[9px] text-brand-text-muted tracking-widest uppercase">
          © 2024 DEBATE LABS • ANALYTICAL COMMAND UNIT
        </p>
      </footer>
    </div>
  );
}
