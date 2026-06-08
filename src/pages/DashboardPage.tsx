import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { useAppContext } from '@/context/AppContext';
import { useDeepSeekAudit } from '@/hooks/useDeepSeekAudit';
import Modal from '@/components/feedback/Modal';
import { useToast } from '@/components/feedback/Toast';
import { 
  DollarSign, 
  FileText,
  Users, 
  CheckCircle, 
  MapPin, 
  TrendingUp, 
  AlertTriangle,
  Award,
  ArrowRight,
  ShieldAlert,
  Loader
} from 'lucide-react';
export default function DashboardPage() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { users, requests, config, tracking, transactions } = state;
  const commissionPercentage = config.commissionPercent;
  const { runAudit, loading: auditGenerating, summary: auditSummary, reset: resetAudit } = useDeepSeekAudit();
  const { showToast } = useToast();
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  const onNewDispatchClick = () => navigate(ROUTES.admin.requests);
  const [alerts, setAlerts] = useState([
    {
      id: "a1",
      title: "Flagged Listing: Abnormal Coffee Price",
      desc: "Batch #9402 from Musanze is 40% above market average.",
      time: "2m ago",
      type: "error",
      unread: true
    },
    {
      id: "a2",
      title: "Pending Verification: Nyamagabe Cooperatives",
      desc: "15 new farmer profiles awaiting identity confirmation.",
      time: "15m ago",
      type: "warning",
      unread: true
    },
    {
      id: "a3",
      title: "Dispatch Success: Route #420-B",
      desc: "4 tons of Maize delivered to Kigali Logistics Hub ahead of schedule.",
      time: "1h ago",
      type: "success",
      unread: false
    }
  ]);

  const handleAudit = async () => {
    const pendingUsers = users.filter((u) => u.status === 'Pending').length;
    const result = await runAudit({
      totalUsers: users.length,
      pendingUsers,
      farmerCount: users.filter((u) => u.role === 'Farmer').length,
      openRequests: requests.length,
      commissionPercent: commissionPercentage,
      processingTransactions: transactions.filter((t) => t.status === 'Processing').length,
      settledTransactions: transactions.filter((t) => t.status === 'Settled').length,
      activeTrackingStatus: tracking.status,
      remainingKm: tracking.remainingKm,
    });
    if (result.success) {
      setAuditModalOpen(true);
    } else {
      showToast(result.error, 'error');
    }
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const markAlertResolved = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, unread: false } : a));
    alert("Alert flag resolved successfully. Relevant partner notified.");
  };

  // Compute dynamic stats based on actual states passed in props
  const totalFarmers = users.filter(u => u.role === 'Farmer').length;
  const pendingUsers = users.filter(u => u.status === 'Pending').length;
  const dispatchSuccessRate = "94.8%";

  // Days charts bar definitions
  const weekData = [
    { day: "Mon", fill: 40, label: "Mon", type: "coffee" },
    { day: "Tue", fill: 65, label: "Tue", type: "coffee" },
    { day: "Wed", fill: 55, label: "Wed", type: "coffee" },
    { day: "Thu", fill: 90, label: "Thu", type: "maize" },
    { day: "Fri", fill: 75, label: "Fri", type: "coffee" },
    { day: "Sat", fill: 85, label: "Sat", type: "coffee" },
    { day: "Sun", fill: 60, label: "Sun", type: "coffee" }
  ];

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-serif text-3xl font-extrabold text-primary tracking-tight md:text-4xl">
            Mavuno Market Performance
          </h2>
          <p className="text-base text-on-surface-variant font-sans mt-2 opacity-90 font-medium">
            Daily overview of the Rwandan agricultural exchange ecosystem.
          </p>
        </div>
        <div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#ece7e4] bg-white text-xs font-bold shadow-sm font-sans text-on-surface">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            Last 30 Days
          </span>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total volume */}
        <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-[#ece7e4] relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#e8a123]/10 text-secondary rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-primary font-sans font-bold text-sm leading-none">+12.4%</span>
          </div>
          <p className="text-xs font-sans font-bold text-on-surface-variant uppercase tracking-wider">
            Total Volume (RWF)
          </p>
          <h3 className="text-3xl font-serif font-bold text-on-surface tracking-tight mt-1">42.8M</h3>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 imigongo-border"></div>
        </div>

        {/* Active listings */}
        <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-[#ece7e4] relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-primary font-sans font-bold text-sm leading-none">+5.2%</span>
          </div>
          <p className="text-xs font-sans font-bold text-on-surface-variant uppercase tracking-wider">
            Active Listings
          </p>
          <h3 className="text-3xl font-serif font-bold text-on-surface tracking-tight mt-1">
            {1248 + requests.length * 3}
          </h3>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 imigongo-border"></div>
        </div>

        {/* User Growth */}
        <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-[#ece7e4] relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-tertiary-container/10 text-tertiary rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-primary font-sans font-bold text-sm leading-none">+22.1%</span>
          </div>
          <p className="text-xs font-sans font-bold text-on-surface-variant uppercase tracking-wider">
            User Growth
          </p>
          <h3 className="text-3xl font-serif font-bold text-on-surface tracking-tight mt-1">
            {8421 + users.length * 10}
          </h3>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 imigongo-border"></div>
        </div>

        {/* Success rate */}
        <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-[#ece7e4] relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-secondary-container/10 text-secondary rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-primary font-sans font-bold text-sm leading-none">98.4%</span>
          </div>
          <p className="text-xs font-sans font-bold text-on-surface-variant uppercase tracking-wider">
            SLA Success Rate
          </p>
          <h3 className="text-3xl font-serif font-bold text-on-surface tracking-tight mt-1">{dispatchSuccessRate}</h3>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 imigongo-border"></div>
        </div>
      </div>

      {/* Central Content: Chart & Geographic reach */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart panel */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-[#ece7e4] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="font-serif text-lg font-bold text-primary">Market Health Index</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">Aggregate weekly transit and sales indices</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-xs font-sans font-semibold text-on-surface-variant">Coffee Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="text-xs font-sans font-semibold text-on-surface-variant">Maize Volume</span>
              </div>
            </div>
          </div>

          {/* Graphical rendering of weekly indices */}
          <div className="h-64 w-full relative flex items-end justify-between gap-4 pt-4 border-b border-[#ece7e4]/60 pb-2">
            {weekData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer">
                {/* Simulated Tooltip */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] font-sans px-2.5 py-1.5 rounded-lg shadow-md z-15 text-center leading-normal pointer-events-none w-24">
                  <div className="font-bold">{data.day} index</div>
                  <div>{(data.fill * 42.8 / 100).toFixed(1)}k Transits</div>
                </div>

                {/* Simulated Chart Bars */}
                <div className="w-full bg-surface-container rounded-t-lg overflow-hidden relative" style={{ height: `${data.fill}%` }}>
                  <div 
                    className={`absolute inset-x-0 bottom-0 h-full rounded-t-lg transition-all duration-500 ${
                      data.type === 'maize' 
                        ? 'bg-secondary opacity-60 group-hover:opacity-80 shadow-[0_4px_12px_rgba(156,68,22,0.15)]' 
                        : 'bg-primary opacity-40 group-hover:opacity-60 shadow-[0_4px_12px_rgba(21,66,18,0.15)]'
                    }`}
                  ></div>
                </div>
                <span className="text-[11px] font-sans font-semibold text-on-surface-variant opacity-75 mt-3">
                  {data.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic maps and distribution */}
        <div className="bg-white rounded-3xl p-8 border border-[#ece7e4] shadow-sm flex flex-col">
          <h4 className="font-serif text-lg font-bold text-primary mb-6">Regional Distribution</h4>
          
          {/* Stylized mapping */}
          <div className="flex-grow min-h-48 rounded-2xl overflow-hidden relative border border-[#ece7e4]/60 bg-[#dfdcd8]">
            <img 
              alt="Rwanda active districts map overlay" 
              className="w-full h-full object-cover grayscale opacity-50 mix-blend-luminosity"
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU-NZZY3dY9Uz7E08TpyfNyR3yRd9adv6VpwSLY1VgIVgceLXN4rU1wBC_rVp663ZtVA4XYr8pkWEVYm0ocWPRiF2SAU10wwUTA9P_SmVfD8mxIaK4DXpfkd_JjqCnsU4lZnnHTdMWPSo4wpwq7LpULECydvaMwHrY3LHgBqkwLfr-wpKcmZzHGHfMcebvJUsLxy64iVZuuwXUUIVZ55bp5_9UFtjEhLDjWyd2HIgayqIhMUSj9LoWdPiTjOBgjdt1o6Cfdzxs1OU" 
            />
            
            {/* Active pulsing hotspots */}
            {/* Musanze hub pin */}
            <div className="absolute top-[28%] left-[28%] group cursor-pointer">
              <div className="absolute -inset-2 rounded-full bg-secondary animate-ping opacity-30"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-secondary border-2 border-white shadow-sm"></div>
              <span className="absolute left-full ml-1.5 top-1/2 -translate-y-1/2 bg-white px-2 py-0.5 rounded-md text-[9px] font-bold text-primary shadow-sm font-sans scale-0 group-hover:scale-100 transition-all origin-left">
                Musanze
              </span>
            </div>

            {/* Kigali hub pin */}
            <div className="absolute top-[48%] left-[58%] group cursor-pointer">
              <div className="absolute -inset-2 rounded-full bg-primary animate-ping opacity-30"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-sm"></div>
              <span className="absolute left-full ml-1.5 top-1/2 -translate-y-1/2 bg-white px-2 py-0.5 rounded-md text-[9px] font-bold text-primary shadow-sm font-sans scale-0 group-hover:scale-100 transition-all origin-left">
                Kigali (42%)
              </span>
            </div>

            {/* Rubavu hub pin */}
            <div className="absolute bottom-[35%] left-[18%] group cursor-pointer">
              <div className="absolute -inset-2 rounded-full bg-primary animate-ping opacity-30"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-sm"></div>
              <span className="absolute left-full ml-1.5 top-1/2 -translate-y-1/2 bg-white px-2 py-0.5 rounded-md text-[9px] font-bold text-primary shadow-sm font-sans scale-0 group-hover:scale-100 transition-all origin-left">
                Rubavu
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4 font-sans">
            <div>
              <div className="flex justify-between items-center text-xs font-bold font-sans">
                <span className="text-on-surface-variant">Kigali City Hubs</span>
                <span className="text-primary font-bold">42%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mt-1.5">
                <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: '42%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-bold font-sans">
                <span className="text-on-surface-variant">Northern Province</span>
                <span className="text-secondary font-bold">28%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mt-1.5">
                <div className="bg-secondary h-full rounded-full transition-all duration-700" style={{ width: '28%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* alerts and recent activity alerts feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent alerts feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-[#ece7e4] shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="font-serif text-lg font-bold text-primary">High-Priority Alerts</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">Live platform operations notifications needing reviews</p>
            </div>
            <button 
              onClick={() => alert("All remaining non-urgent alerts have been flagged as read.")}
              className="text-primary font-sans font-bold text-xs hover:underline cursor-pointer"
            >
              Mark All Read
            </button>
          </div>

          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant/60 font-sans text-sm">
                No active outstanding high-priority alerts. System running smoothly.
              </div>
            ) : (
              alerts.map(item => (
                <div 
                  key={item.id} 
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl transition-all duration-300 border ${
                    item.unread ? 'bg-secondary/5 border-secondary/15' : 'bg-surface-low border-transparent hover:bg-surface-container'
                  } group`}
                >
                  <div className={`p-3 rounded-full shrink-0 ${
                    item.type === 'error' ? 'bg-[#ffdad6] text-[#ba1a1a]' : 
                    item.type === 'warning' ? 'bg-[#ffddb1] text-secondary' : 'bg-[#bcf0ae] text-primary'
                  }`}>
                    {item.type === 'error' ? <ShieldAlert className="w-5 h-5" /> : 
                     item.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <h5 className="font-sans font-bold text-sm text-on-surface leading-tight">{item.title}</h5>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 font-medium">{item.desc}</p>
                  </div>

                  <div className="text-right sm:shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#ece7e4]/40">
                    <span className="text-[10px] text-on-surface-variant opacity-75 font-semibold tracking-wide font-sans">{item.time}</span>
                    <div className="flex gap-2.5 mt-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.unread && (
                        <button 
                          onClick={() => markAlertResolved(item.id)}
                          className="text-primary text-xs font-bold hover:underline cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      <button 
                        onClick={() => dismissAlert(item.id)}
                        className="text-on-surface-variant text-xs font-bold hover:text-red-700 hover:underline cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick action systems & metrics panel */}
        <div className="space-y-6">
          {/* System Health */}
          <div className="bg-primary text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-serif text-lg font-bold mb-3">AgriTrans Platform Health</h4>
              <div className="flex items-baseline gap-2.5 mb-6">
                <span className="text-5xl font-serif font-black tracking-tighter">99.9%</span>
                <span className="text-[10px] uppercase font-sans font-extrabold tracking-widest opacity-80 leading-normal">
                  Uptime<br />SLA Met
                </span>
              </div>
              <button 
                onClick={handleAudit}
                disabled={auditGenerating}
                className="w-full bg-white text-primary py-3 px-4 rounded-xl font-sans font-bold text-xs hover:bg-[#ffdbcd] hover:text-secondary transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {auditGenerating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Analyzing Services...</span>
                  </>
                ) : (
                  <span>Generate System Audit</span>
                )}
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          </div>

          {/* Quick trend indexes */}
          <div className="bg-[#f7f3ef] border border-[#ece7e4] p-6 rounded-3xl">
            <h4 className="text-[11px] font-sans font-extrabold uppercase tracking-widest text-on-surface-variant mb-4">
              Market Value Trends
            </h4>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3.5 bg-white rounded-2xl border border-[#ece7e4]/60">
                <img 
                  alt="Arabica Coffee" 
                  className="w-12 h-12 rounded-xl object-cover" 
                  referrerPolicy="no-referrer"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWmTLzqy4QuuFlvt0eX7qoGWYGOLwbSWUBwCf--Snov4DVmH02qyvXkAPJa_oBcf4Wqt7IrOfvrIOuLTsml3PtFrUqPza5n15s9yLJTGH1rynLl_JiXtc4Fa4ald3y7gyNz50K5o0w4G8S4kb-IYvtAC-MziPSqVq_U8ZofzQsw7PwkXE4_FpPZY9na79jlrNfcgbyepUQH-7FiBo7w5135mVPCpSXULTooh7cWyzibdj_UNIBbcpQ88Fi0JOi2vyaFQf9QHramgo" 
                />
                <div>
                  <p className="font-bold text-on-surface text-sm font-sans leading-tight">Coffee Arabica</p>
                  <p className="text-xs font-bold text-secondary mt-1 font-sans">+15% Peak Demand</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3.5 bg-white rounded-2xl border border-[#ece7e4]/60">
                <img 
                  alt="Maize Flour" 
                  className="w-12 h-12 rounded-xl object-cover" 
                  referrerPolicy="no-referrer"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIwodl-MXMzyLuJb4kxjLKDDRCgitfgbC-rIiw1h-2X9ecjyFbvCEjLh-p05w8Uld2e970JOeniF40eIlEsgjfKF9zsTCGiSYDX93c_sXRBqcIFcQVlLzTGmOzOP16Yd7Q_Twwg2NZ9BSfd8TIvN3i0ac5Yya8ziiBdTMYcDbyOhGXMCqEybBBO1CZA7xlTObnWeOh9vkC4RgrmA2tbd8WrVnk5ab8b-jcPVTiX0IdTxm3qAp4Mxskv_kYHRXRDFhUAfG2wi-jcPk" 
                />
                <div>
                  <p className="font-bold text-on-surface text-sm font-sans leading-tight">Maize Flour</p>
                  <p className="text-xs font-bold text-primary mt-1 font-sans">-2% Under Steady Index</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={auditModalOpen}
        onClose={() => {
          setAuditModalOpen(false);
          resetAudit();
        }}
        title="System Audit Report"
      >
        <p className="text-sm font-sans text-on-surface-variant leading-relaxed whitespace-pre-wrap">
          {auditSummary}
        </p>
        <button
          type="button"
          onClick={() => {
            setAuditModalOpen(false);
            resetAudit();
          }}
          className="mt-6 w-full bg-primary text-white py-3 rounded-xl font-sans text-xs font-bold hover:bg-primary-container cursor-pointer"
        >
          Close
        </button>
      </Modal>
    </div>
  );
}
