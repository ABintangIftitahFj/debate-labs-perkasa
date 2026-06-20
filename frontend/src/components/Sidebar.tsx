import { 
  LayoutDashboard, 
  GraduationCap, 
  User, 
  Users, 
  BarChart3,
  Award
} from "lucide-react";
import { ViewTab } from "../types";

interface SidebarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: "dashboard" as ViewTab, label: "Dashboard", icon: LayoutDashboard },
    { id: "coaching" as ViewTab, label: "Coaching", icon: GraduationCap },
    { id: "individual" as ViewTab, label: "Individual", icon: User },
    { id: "spar" as ViewTab, label: "Spar Room", icon: Users },
    { id: "evaluation" as ViewTab, label: "Evaluation", icon: BarChart3 }
  ];

  return (
    <aside 
      id="main-sidebar"
      className="flex flex-col h-screen sticky top-0 w-20 md:w-64 border-r border-brand-outline/30 bg-brand-surface/60 backdrop-blur-xl shadow-sm z-50 shrink-0 select-none text-brand-text"
    >
      {/* Brand Header */}
      <div className="p-6 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
        <h1 className="font-heading text-xl md:text-2xl font-bold text-brand-primary tracking-tighter leading-none">
          Debate Labs
        </h1>
        <p className="font-mono text-[9px] text-brand-text-muted uppercase tracking-widest mt-1.5 hidden md:block">
          Analytical Command
        </p>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 mt-6 px-3 space-y-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl transition-all duration-300 relative group cursor-pointer ${
                isActive
                  ? "text-brand-primary bg-brand-primary/10 border-r-2 border-brand-primary font-medium"
                  : "text-brand-text-muted hover:text-brand-text hover:bg-white/5"
              }`}
            >
              <IconComponent className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-brand-primary" : ""}`} />
              <span className="hidden md:inline font-mono text-xs uppercase tracking-wider">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute right-0 top-0 h-full w-[2px] bg-brand-primary rounded-r" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Information Profile */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="relative shrink-0">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPLI0zri2cvNeHpjPhlVpCa7_Pyj9JpbjlRIIMpqS-0FLwe_Qtu5I2uIP4PnoCDSk8_Z0DBWVfxej51fxOtDHI0U40JRD7FeAH62E2tA9iJ78H-D06k1B3MMf5OotR1jbPhyiCpsHym_7fEiU-UzC8hj3gCNTGFAlYk9qXBGpBiMm3MwcpVlpoO1tY7GBX1bIb7LmRd_iwji0WRqpZPAqWeFCG36eHqkkIHfeR7YiwzJz44eRxlYI9n97GfSIbr8yEA8CiD9aKQss"
              alt="Alex Rivera User avatar portrait"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-brand-primary/30"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-secondary rounded-full border-2 border-brand-bg animate-pulse" />
          </div>
          <div className="hidden md:block overflow-hidden">
            <div className="flex items-center gap-1">
              <p className="font-heading text-sm font-semibold truncate text-brand-text">
                Alex Rivera
              </p>
              <Award className="h-3 w-3 text-brand-tertiary" />
            </div>
            <p className="font-mono text-[9px] text-brand-text-muted uppercase tracking-wider truncate">
              Varsity Debater • Lv. 24
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
