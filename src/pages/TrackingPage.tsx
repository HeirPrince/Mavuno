import { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  PhoneCall, 
  Thermometer, 
  Navigation, 
  Compass, 
  Gauge, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Check,
  UserCheck
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import type { DispatchTracking } from '@/lib/types';

export default function TrackingPage() {
  const { state, updateTrackingStatus, updateTelemetry } = useAppContext();
  const { tracking } = state;
  const [phoneRinging, setPhoneRinging] = useState(false);
  
  // Simulation modifiers
  const [simSpeed, setSimSpeed] = useState(54);
  const [simTemp, setSimTemp] = useState(18.5);

  const handleInitiateCall = () => {
    setPhoneRinging(true);
    setTimeout(() => {
      setPhoneRinging(false);
      alert(`Terminal Call Successful!\nDriver ${tracking.driverName} confirm they are crossing Kayonza checkpoint. Weather is sunny and clear.`);
    }, 2000);
  };

  const handleStatusProgress = () => {
    let next: DispatchTracking['status'] = 'Collected';
    if (tracking.status === 'Collected') next = 'In Transit';
    else if (tracking.status === 'In Transit') next = 'Near Hub';
    else if (tracking.status === 'Near Hub') next = 'Delivered';
    else {
      alert("This dispatch is already delivered and settled successfully.");
      return;
    }

    updateTrackingStatus(next);
    
    // Auto simulate speed/temp updates under different steps
    if (next === 'Near Hub') {
      updateTelemetry(32, 19.2, 12.5);
    } else if (next === 'Delivered') {
      updateTelemetry(0, 20.0, 0);
    }
    
    alert(`Transit step advanced successfully!\nNew status is cataloged as "${next}". Mobile tracking systems synchronized.`);
  };

  // Determine bullet indicator styling
  const stepIndex = {
    'Collected': 1,
    'In Transit': 2,
    'Near Hub': 3,
    'Delivered': 4
  }[tracking.status] || 1;

  return (
    <div className="space-y-8">
      {/* Page Header banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-8 bg-white rounded-3xl border border-[#ece7e4] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 imigongo-border"></div>
        <div>
          <span className="bg-primary/10 text-primary text-[10px] font-sans font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Active Dispatch Consignment
          </span>
          <h2 className="font-serif text-3xl font-extrabold text-primary tracking-tight mt-2 flex items-center gap-2">
            <span>Tracking Shipment</span>
            <span className="text-secondary font-sans font-extrabold text-sm uppercase self-center bg-secondary/10 px-3 py-0.5 rounded-md">
              {tracking.orderId}
            </span>
          </h2>
          <p className="text-xs text-on-surface-variant font-sans font-medium mt-1 leading-none opacity-80">
            Assigned to: <span className="font-bold">{tracking.customerName}</span>
          </p>
        </div>

        {/* Update tracking button */}
        <div className="flex gap-3">
          <button
            onClick={handleStatusProgress}
            className="bg-primary text-white py-3 px-6 rounded-xl font-sans text-xs font-bold leading-none flex items-center gap-2 hover:bg-primary-container shadow-sm active:scale-95 cursor-pointer"
          >
            <Compass className="w-4 h-4 animate-spin" />
            <span>Advance Progress</span>
          </button>
        </div>
      </div>

      {/* Main core columns: Telemetry vs Route Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Telemetry Indicators Column */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Driver profile widget */}
          <div className="bg-white rounded-3xl p-6 border border-[#ece7e4] shadow-sm">
            <h4 className="text-xs uppercase font-sans font-extrabold tracking-widest text-on-surface-variant mb-4">
              Assigned Courier
            </h4>

            <div className="flex items-center gap-4">
              <img 
                alt="Driver profile photo" 
                className="w-14 h-14 rounded-full object-cover border border-primary/20 shadow-inner" 
                referrerPolicy="no-referrer"
                src={tracking.driverAvatar} 
              />
              <div className="flex-grow">
                <p className="font-sans font-bold text-sm text-on-surface leading-tight">{tracking.driverName}</p>
                <p className="text-xs text-on-surface-variant font-medium mt-1 opacity-80">Unit: {tracking.vehicleInfo}</p>
              </div>
              <button 
                onClick={handleInitiateCall}
                disabled={phoneRinging}
                className="p-3 bg-secondary/10 text-secondary hover:bg-[#ffdad6] rounded-xl transition-all relative cursor-pointer"
                title="Initiate Call to Cab"
              >
                <PhoneCall className={`w-4 h-4 ${phoneRinging ? 'animate-bounce' : ''}`} />
              </button>
            </div>
          </div>

          {/* Telemetry panel */}
          <div className="bg-[#f7f3ef] border border-[#ece7e4] p-6 rounded-3xl space-y-6">
            <h4 className="text-xs uppercase font-sans font-extrabold tracking-widest text-[#4f3300]">
              Cold-Chain Telemetry
            </h4>

            {/* Speeds & Temps dials */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-[#ece7e4]/60 text-center relative overflow-hidden">
                <Gauge className="w-5 h-5 text-secondary mx-auto mb-2" />
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block leading-none">Speed</span>
                <span className="text-2xl font-serif font-bold text-on-surface block mt-1.5">{tracking.avgSpeed} km/h</span>
                <span className="text-[9px] text-primary font-bold mt-1 block">SLA Optimal</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#ece7e4]/60 text-center relative overflow-hidden">
                <Thermometer className="w-5 h-5 text-primary mx-auto mb-2" />
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block leading-none">Temp Index</span>
                <span className="text-2xl font-serif font-bold text-on-surface block mt-1.5">{tracking.cargoTemp}°C</span>
                <span className="text-[9px] text-[#4ea044] font-bold mt-1 block">Moisture Guarded</span>
              </div>
            </div>

            {/* Fuel and ETAs */}
            <div className="bg-white p-5 rounded-2xl border border-[#ece7e4]/60 space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-on-surface-variant">Remaining Distance</span>
                  <span className="text-primary">{tracking.remainingKm} km</span>
                </div>
                {/* Distance slider bar */}
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mt-1.5 relative">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-700" 
                    style={{ width: `${Math.max(0, 100 - (tracking.remainingKm / 150) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-sans font-bold pt-2 border-t border-[#ece7e4]/40">
                <span className="text-on-surface-variant">Expected Arrival</span>
                <div className="text-right">
                  <span className="text-secondary font-black">{tracking.eta}</span>
                  <span className="block text-[9px] font-sans font-bold text-primary uppercase tracking-wider mt-0.5">{tracking.etaStatus}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Mapping & Journey Steps column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Journey Steps Horizontal Node Map */}
          <div className="bg-white p-8 rounded-3xl border border-[#ece7e4] shadow-sm">
            <h4 className="text-xs uppercase font-sans font-extrabold tracking-widest text-[#154212] mb-6">
              Consignment Journey Corridor
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 select-none relative font-sans text-xs">
              
              {/* Collected step */}
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  stepIndex >= 1 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {stepIndex > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <div>
                  <h5 className="font-bold text-on-surface">Collected</h5>
                  <p className="text-[10px] text-on-surface-variant opacity-80 mt-0.5">{tracking.history.collectedTime}</p>
                </div>
              </div>

              {/* In Transit step */}
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  stepIndex >= 2 ? 'bg-secondary text-white ring-4 ring-secondary/20' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {stepIndex > 2 ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <div>
                  <h5 className="font-bold text-on-surface">In Transit</h5>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                    tracking.status === 'In Transit' ? 'text-secondary animate-pulse' : 'text-on-surface-variant'
                  }`}>
                    {tracking.status === 'Collected' ? 'Pending' : tracking.history.inTransitTime}
                  </p>
                </div>
              </div>

              {/* Near Hub step */}
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  stepIndex >= 3 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {stepIndex > 3 ? <Check className="w-4 h-4" /> : '3'}
                </div>
                <div>
                  <h5 className="font-bold text-on-surface">Near Hub</h5>
                  <p className="text-[10px] text-on-surface-variant opacity-80 mt-0.5">
                    {stepIndex >= 3 ? 'Arrived at City Limit' : tracking.history.nearHubTime}
                  </p>
                </div>
              </div>

              {/* Delivered step */}
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  stepIndex >= 4 ? 'bg-[#bcf0ae] text-primary border-2 border-primary' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {stepIndex >= 4 ? <CheckCircle className="w-4 h-4 text-primary" /> : '4'}
                </div>
                <div>
                  <h5 className="font-bold text-on-surface">Delivered</h5>
                  <p className="text-[10px] text-on-surface-variant opacity-80 mt-0.5">
                    {stepIndex >= 4 ? 'Completed & Settled' : tracking.history.deliveredTime}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Operational Map image block overlay */}
          <div className="bg-white rounded-3xl overflow-hidden border border-[#ece7e4] h-[340px] relative shadow-lg">
            <img 
              alt="Interactive Live Journey Map" 
              className="w-full h-full object-cover grayscale brightness-95 opacity-90"
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYf6Pq9Eof8H0N-m6q4t-6-oOswvYwclKj_gPhuV_XkE-rF7SIdE2_zT8qXvX76O5tF9S7W2qF8P7W2qF8P7W2qF8P7W2qF8P7W2qF8P7W2qF8P7W2qF8P7W2qF8P7W" // We've got custom coordinate mappings representation below anyway
            />

            {/* Custom SVG traces drawing on top of map to show actual flight corridor */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path 
                d="M 120,220 C 180,150 280,180 340,110 E 420,120 M 340,110 L 480,210" 
                fill="none" 
                stroke="#154212" 
                strokeWidth="4.5" 
                strokeLinecap="round"
                strokeDasharray="6, 8"
                className="animate-[dash_4s_linear_infinite]"
              />
            </svg>

            {/* Pulsing delivery target center marker */}
            <div className="absolute top-[32%] right-[42%] group cursor-pointer text-center select-none z-10">
              <span className="bg-primary text-white text-[9px] font-sans font-black px-2 py-0.5 rounded-md shadow-md block border border-white leading-none whitespace-nowrap mb-1">
                Kigali Logistics Hub
              </span>
              <div className="absolute -inset-2 rounded-full bg-primary animate-ping opacity-25"></div>
              <div className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow-md mx-auto"></div>
            </div>

            {/* Pulsing Active vehicle current progress marker along the route corridor */}
            {stepIndex === 2 && (
              <div className="absolute top-[48%] left-[38%] group cursor-pointer text-center select-none z-10">
                <span className="bg-secondary text-white text-[9px] font-sans font-bold px-2.5 py-0.5 rounded-md shadow-md block border border-white leading-none whitespace-nowrap mb-1 flex items-center gap-1">
                  <Truck className="w-3 h-3 animate-bounce" />
                  <span>TRK-882 in Transit</span>
                </span>
                <div className="absolute -inset-2 rounded-full bg-secondary animate-ping opacity-35"></div>
                <div className="w-4 h-4 rounded-full bg-secondary border-2 border-white shadow-md mx-auto"></div>
              </div>
            )}

            {stepIndex === 3 && (
              <div className="absolute top-[36%] right-[48%] group cursor-pointer text-center select-none z-10">
                <span className="bg-secondary text-white text-[9px] font-sans font-bold px-2.5 py-0.5 rounded-md shadow-md block border border-white leading-none whitespace-nowrap mb-1 flex items-center gap-1">
                  <Truck className="w-3 h-3 animate-bounce" />
                  <span>Slowing down near Kacyiru</span>
                </span>
                <div className="absolute -inset-2 rounded-full bg-secondary animate-ping opacity-35"></div>
                <div className="w-4 h-4 rounded-full bg-secondary border-2 border-white shadow-md mx-auto"></div>
              </div>
            )}

            {/* Instructions box in map footer */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-primary/20 shadow-md flex items-center justify-between text-xs font-sans">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-ping"></div>
                <p className="font-bold text-on-surface">
                  Route Corridor: Kigali-East corridor active under standard speed audits.
                </p>
              </div>
              <button 
                onClick={() => alert("Full route simulation logs exported to diagnostics tab.")}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Telemetry Logs
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
