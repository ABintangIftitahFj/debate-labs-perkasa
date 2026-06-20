import { useState, useEffect, useRef } from "react";
import { 
  GraduationCap, 
  Clock, 
  Sliders, 
  Mic, 
  Sparkles, 
  ChevronRight, 
  ArrowRight,
  Wifi, 
  AlertCircle,
  Volume2,
  CheckCircle,
  Hash
} from "lucide-react";
import { SYLLABUS_DATA, SyllabusItem, ViewTab } from "../types";

interface CoachingProps {
  setActiveTab: (tab: ViewTab) => void;
  triggerToast: (msg: string) => void;
  selectedSyllabus: string | null;
  setSelectedSyllabus: (id: string | null) => void;
}

export default function CoachingView({ setActiveTab, triggerToast, selectedSyllabus, setSelectedSyllabus }: CoachingProps) {
  const [syllabusTab, setSyllabusTab] = useState<"web" | "coach">("web");
  const [role, setRole] = useState<"pro" | "contra">("pro");
  const [speakerPosition, setSpeakerPosition] = useState<"P1" | "P2" | "P3">("P1");
  const [roomCode, setRoomCode] = useState<string>("");
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [sessionTime, setSessionTime] = useState<number>(0);
  const [waveformHeights, setWaveformHeights] = useState<number[]>([12, 24, 32, 16, 8, 20, 24, 30, 18, 12]);
  const [analyzingState, setAnalyzingState] = useState<"none" | "uploading" | "crunching">("none");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const waveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter syllabus list based on custom tabs
  const filteredSyllabi = SYLLABUS_DATA.filter((s) => s.category === syllabusTab);

  // Custom audio waveform simulation
  useEffect(() => {
    if (isSessionActive) {
      waveIntervalRef.current = setInterval(() => {
        setWaveformHeights(
          Array.from({ length: 11 }, () => Math.floor(Math.random() * 45) + 10)
        );
      }, 150);
    } else {
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
      setWaveformHeights([8, 14, 20, 12, 6, 16, 20, 26, 14, 8]);
    }

    return () => {
      if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
    };
  }, [isSessionActive]);

  // Elapsed stopwatch timer trigger and countdown
  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive]);

  const toggleSession = () => {
    if (!isSessionActive) {
      setIsSessionActive(true);
      setSessionTime(0);
      triggerToast("Latihan Coaching dengan mentor AI dimulai!");
    } else {
      // Transition out of session -> trigger analysis
      setIsSessionActive(false);
      setAnalyzingState("uploading");
      triggerToast("Mentransfer berkas audio ke Analytical Engine...");
      
      setTimeout(() => {
        setAnalyzingState("crunching");
        triggerToast("AI sedang mengevaluasi Manner dan Matter Anda...");
        
        setTimeout(() => {
          setAnalyzingState("none");
          triggerToast("Evaluasi selesai! Membuka Laporan Evaluasi...");
          setActiveTab("evaluation");
        }, 2200);
      }, 1800);
    }
  };

  const handleSyllabusSelect = (item: SyllabusItem) => {
    setSelectedSyllabus(item.title);
    triggerToast(`Syllabus terpilih: ${item.title}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div id="coaching-view" className="flex-1 overflow-y-auto bg-brand-bg text-brand-text p-6 md:p-8 font-sans">
      {/* Top Header Label */}
      <div className="mb-8">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-brand-text tracking-tighter">
          Coaching Laboratory
        </h2>
        <p className="font-sans text-xs md:text-sm text-brand-text-muted mt-1">
          Interactive syllabus structures curated by elite university debaters &amp; AI co-pilots.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Syllabus System */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/[0.08]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-lg font-bold text-brand-text">
                Program &amp; Syllabus
              </h3>
              {/* Syllabus Web & Coach Toggle Tabs */}
              <div className="bg-brand-surface-high p-1 rounded-full flex gap-1 border border-white/5">
                <button
                  onClick={() => setSyllabusTab("web")}
                  className={`px-4 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                    syllabusTab === "web"
                      ? "bg-brand-primary text-brand-lowest font-semibold"
                      : "text-brand-text-muted hover:text-brand-text"
                  }`}
                >
                  Kurikulum Web
                </button>
                <button
                  onClick={() => setSyllabusTab("coach")}
                  className={`px-4 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                    syllabusTab === "coach"
                      ? "bg-brand-primary text-brand-lowest font-semibold"
                      : "text-brand-text-muted hover:text-brand-text"
                  }`}
                >
                  Kurikulum Coach
                </button>
              </div>
            </div>

            {/* Syllabus Listing Content */}
            <div className="space-y-4">
              {filteredSyllabi.map((item) => {
                const isSelected = selectedSyllabus === item.title;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSyllabusSelect(item)}
                    className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex justify-between items-center relative overflow-hidden group ${
                      isSelected
                        ? "bg-brand-primary/10 border-brand-primary"
                        : "bg-brand-surface border-white/[0.03] hover:border-white/10"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-[8px] bg-brand-surface-high border border-white/5 py-0.5 px-2 rounded text-brand-secondary font-semibold">
                          {item.type}
                        </span>
                        <span className="font-mono text-[9px] text-brand-text-muted flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.duration}
                        </span>
                      </div>
                      <h4 className="font-heading text-md font-bold text-brand-text">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <CheckCircle className="h-5 w-5 text-brand-primary" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-surface-high border border-white/5 flex items-center justify-center transform group-hover:translate-x-1 transition-transform duration-300">
                          <ChevronRight className="h-4 w-4 text-brand-text" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connected Coach Panel */}
          <div className="glass-card rounded-2xl p-6 border border-white/[0.08]">
            <h3 className="font-heading text-lg font-bold text-brand-text mb-4">
              Your Assigned Coach
            </h3>
            <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-brand-surface">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                  alt="Coach Julia"
                  className="w-12 h-12 rounded-full object-cover border border-brand-primary/20"
                />
              </div>
              <div className="flex-1">
                <p className="font-heading text-sm font-bold text-brand-text">
                  Julia Vance, Esq.
                </p>
                <p className="font-sans text-[11px] text-brand-text-muted">
                  WUDC Semi-Finalist • Oxford Debate Coach
                </p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1 font-mono text-[9px] text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                ONLINE
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Drill Control & Setup */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Drilling Simulation Workspace */}
          {isSessionActive || analyzingState !== "none" ? (
            <div className="glass-card rounded-2xl p-6 border border-brand-primary/20 bg-brand-surface-low relative overflow-hidden flex flex-col justify-between min-h-[380px] shadow-lg shadow-brand-primary/5">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary animate-pulse" />
              
              {/* Header inside Drill */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="font-mono text-[9px] text-brand-primary uppercase tracking-widest font-semibold">
                    Live Session
                  </span>
                  <h4 className="font-heading text-md font-bold text-brand-text mt-1">
                    {selectedSyllabus || "Standard Argument Loop"}
                  </h4>
                </div>
                <div className="bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 rounded-full flex items-center gap-1.5 font-mono text-[10px] text-brand-primary">
                  <Wifi className="h-3 w-3 animate-pulse" />
                  CONNECTED
                </div>
              </div>

              {/* Central Visualization Wave */}
              {analyzingState === "none" ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8">
                  {/* Digital timer */}
                  <p className="font-mono text-4xl font-bold text-brand-text tracking-widest text-center mb-4 transition-all duration-300">
                    {formatTime(sessionTime)}
                  </p>
                  
                  {/* Dynamic digital waveform loops */}
                  <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-[280px]">
                    {waveformHeights.map((h, index) => (
                      <div
                        key={index}
                        style={{ height: `${h}px` }}
                        className="w-2 rounded-full bg-brand-primary/80 shadow-[0_0_10px_rgba(195,192,255,0.4)] transition-all duration-150"
                      />
                    ))}
                  </div>
                  <p className="font-sans text-[11px] text-brand-text-muted mt-5 text-center flex items-center gap-1.5 bg-white/[0.03] border border-white/5 px-4 py-1.5 rounded-full select-none">
                    <Mic className="h-3.5 w-3.5 text-brand-primary animate-pulse" />
                    AI is analyzing your Matter...
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-4">
                  {/* Loading spinner for uploading and analyzing feedback */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
                    <Sparkles className="h-6 w-6 text-brand-primary absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div>
                    <h5 className="font-heading text-sm font-bold text-brand-text">
                      {analyzingState === "uploading" 
                        ? "Uploading Voice Transcript..." 
                        : "Crunching Logic Fallacies..."}
                    </h5>
                    <p className="font-mono text-[10px] text-brand-text-muted mt-1 max-w-[220px] mx-auto uppercase tracking-wide">
                      {analyzingState === "uploading" 
                        ? "Establishing connection with secure database..." 
                        : "Checking consistency and evidence linkages..."}
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Complete Trigger buttons */}
              {analyzingState === "none" && (
                <button
                  onClick={toggleSession}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-brand-lowest py-3.5 font-heading font-bold text-xs rounded-xl shadow-lg shadow-brand-primary/20 transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <StopIcon /> Akhiri Sesi
                </button>
              )}
            </div>
          ) : (
            /* Standby Configuration Card */
            <div className="glass-card rounded-2xl p-6 border border-white/[0.08] space-y-6">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand-primary" />
                <h3 className="font-heading text-lg font-bold text-brand-text">
                  Session Config
                </h3>
              </div>

              {/* Position Pick PRO versus CONTRA */}
              <div className="space-y-2">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-text-muted font-semibold block">
                  Debating Position
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setRole("pro")}
                    className={`py-3.5 rounded-xl border font-heading font-bold text-xs transition-all duration-300 cursor-pointer ${
                      role === "pro"
                        ? "bg-brand-secondary/15 border-brand-secondary text-brand-secondary shadow-[0_0_15px_rgba(137,206,255,0.08)]"
                        : "bg-brand-surface border-white/[0.03] text-brand-text hover:border-white/10"
                    }`}
                  >
                    PRO (Government)
                  </button>
                  <button
                    onClick={() => setRole("contra")}
                    className={`py-3.5 rounded-xl border font-heading font-bold text-xs transition-all duration-300 cursor-pointer ${
                      role === "contra"
                        ? "bg-brand-tertiary/15 border-brand-tertiary text-brand-tertiary shadow-[0_0_15px_rgba(255,182,149,0.08)]"
                        : "bg-brand-surface border-white/[0.03] text-brand-text hover:border-white/10"
                    }`}
                  >
                    CONTRA (Opposition)
                  </button>
                </div>
              </div>

              {/* Speaker Order selection */}
              <div className="space-y-2">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-text-muted font-semibold block">
                  Speaker Order
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["P1", "P2", "P3"] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setSpeakerPosition(pos)}
                      className={`py-3.5 rounded-xl border font-mono text-[10px] transition-all duration-300 cursor-pointer ${
                        speakerPosition === pos
                          ? "bg-brand-primary/15 border-brand-primary text-brand-primary font-bold"
                          : "bg-brand-surface border-white/[0.03] text-brand-text hover:border-white/10"
                      }`}
                    >
                      {pos === "P1" ? "Prime Minister" : pos === "P2" ? "Deputy PM" : "Gov Whip"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Code Custom Connector */}
              <div className="space-y-2">
                <label className="font-mono text-[9px] uppercase tracking-widest text-brand-text-muted font-semibold flex justify-between items-center">
                  <span>Connect Room Code (Optional)</span>
                  <span className="text-[8px] text-brand-text-muted/60">Multiplayer Only</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-muted/50 font-mono text-[11px] select-none">
                    #
                  </span>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase())}
                    maxLength={6}
                    placeholder="E.g. LABX42"
                    className="w-full bg-brand-surface border border-white/[0.03] p-3 pl-8 text-xs font-mono rounded-xl focus:outline-none focus:border-brand-primary uppercase tracking-widest placeholder-brand-text-muted/30"
                  />
                </div>
              </div>

              {/* Submit triggers coaching room */}
              <button
                onClick={toggleSession}
                className="w-full bg-brand-primary hover:bg-brand-primary/95 text-brand-lowest py-3.5 font-heading font-bold text-xs rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.01] transition-transform duration-300 cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                Mulai Drilling Sesi <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StopIcon() {
  return (
    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}
