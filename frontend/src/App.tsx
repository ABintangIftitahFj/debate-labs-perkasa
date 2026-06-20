/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ViewTab, DebateMotion, SAMPLE_MOTIONS } from "./types";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import CoachingView from "./components/CoachingView";
import IndividualView from "./components/IndividualView";
import SparView from "./components/SparView";
import EvaluationView from "./components/EvaluationView";

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>("dashboard");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Shared app states for cross-tab reactivity
  const [activeMotion, setActiveMotion] = useState<DebateMotion>(SAMPLE_MOTIONS[0]);
  const [durationOption, setDurationOption] = useState<"1" | "3" | "5">("3");
  const [selectedSyllabus, setSelectedSyllabus] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    // Dismiss after 3s
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  return (
    <div id="debate-labs-app" className="min-h-screen bg-brand-bg text-brand-text flex overflow-hidden font-sans">
      
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main viewport segment */}
      <main id="app-viewport" className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {activeTab === "dashboard" && (
          <DashboardView setActiveTab={setActiveTab} triggerToast={triggerToast} />
        )}
        
        {activeTab === "coaching" && (
          <CoachingView 
            setActiveTab={setActiveTab} 
            triggerToast={triggerToast} 
            selectedSyllabus={selectedSyllabus}
            setSelectedSyllabus={setSelectedSyllabus}
          />
        )}

        {activeTab === "individual" && (
          <IndividualView 
            setActiveTab={setActiveTab} 
            triggerToast={triggerToast}
            activeMotion={activeMotion}
            setActiveMotion={setActiveMotion}
            durationOption={durationOption}
            setDurationOption={setDurationOption}
          />
        )}

        {activeTab === "spar" && (
          <SparView 
            setActiveTab={setActiveTab} 
            triggerToast={triggerToast} 
            activeMotion={activeMotion} 
            durationOption={durationOption}
          />
        )}

        {activeTab === "evaluation" && (
          <EvaluationView 
            setActiveTab={setActiveTab} 
            triggerToast={triggerToast} 
            activeMotionTitle={activeMotion.title} 
            durationOption={durationOption}
          />
        )}
      </main>

      {/* Interactive Global Notification Toast Alert */}
      {toastMessage && (
        <div 
          id="global-toast"
          className="fixed bottom-6 right-6 z-50 py-3.5 px-6 rounded-xl bg-brand-surface border border-brand-primary/30 text-brand-primary text-xs font-mono font-bold uppercase tracking-wider shadow-[0_10px_25px_rgba(0,0,0,0.5)] animate-bounce duration-500 ease-in-out flex items-center gap-2"
        >
          <span>⚡</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

