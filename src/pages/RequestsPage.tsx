import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Trash2, 
  ExternalLink,
  Tag,
  Scale,
  RefreshCw,
  X,
  Plus
} from 'lucide-react';
import { TransportRequest } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/components/feedback/Toast';

export default function RequestsPage() {
  const navigate = useNavigate();
  const { state, acceptRequest, declineRequest } = useAppContext();
  const { requests } = state;
  const { showToast } = useToast();
  const [activeTab, setActiveTab2] = useState<'incoming' | 'negotiation' | 'history'>('incoming');
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null);
  
  // Custom Negotiation models State
  const [counterPrice, setCounterPrice] = useState('2500000');
  const [counterReason, setCounterReason] = useState('Standard fuel escalation or mountainous route terrain adjustments.');

  const handleOpenNegotiation = (req: TransportRequest) => {
    setSelectedRequest(req);
    setCounterPrice(req.estimatedPriceRwf.toString());
    setShowCounterModal(true);
  };

  const handleApplyCounterOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    // Accept under customized Counter rate
    const parsedRate = parseInt(counterPrice) || selectedRequest.estimatedPriceRwf;
    acceptRequest(selectedRequest, parsedRate);
    setShowCounterModal(false);
    setSelectedRequest(null);
    showToast(
      `Counter offer of ${parsedRate.toLocaleString()} RWF applied. Opening live tracking.`,
      'success',
    );
    navigate('/tracking');
  };

  return (
    <div className="space-y-8">
      {/* Title section layout */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-extrabold text-primary tracking-tight md:text-4xl">
            Logistics Request Hub
          </h2>
          <p className="text-sm font-sans text-on-surface-variant font-medium mt-1 leading-none opacity-90">
            Accept or counter transport solicitations from certified Rwandan cooperatives.
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex gap-1.5 p-1 bg-surface-container rounded-2xl w-fit font-sans text-xs font-bold">
          <button
            onClick={() => setActiveTab2('incoming')}
            className={`px-5 py-2 rounded-xl transition-all ${
              activeTab === 'incoming' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Incoming ({requests.length})
          </button>
          
          <button
            onClick={() => setActiveTab2('negotiation')}
            className={`px-5 py-2 rounded-xl transition-all ${
              activeTab === 'negotiation' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Active Negotiations (0)
          </button>
        </div>
      </div>

      {/* Main requests lists display */}
      {activeTab === 'incoming' ? (
        <div className="space-y-6">
          {requests.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-[#ece7e4] text-on-surface-variant/70 font-sans">
              <RefreshCw className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="font-bold text-sm">Waiting for new cooperative listings...</p>
              <p className="text-xs opacity-80 mt-1 max-w-sm mx-auto">
                No active transport listings are pending dispatcher review. Refresh the dashboard periodically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {requests.map(req => (
                <div 
                  key={req.id} 
                  className="bg-white rounded-[32px] overflow-hidden border border-[#ece7e4] shadow-md flex flex-col relative group hover:shadow-xl transition-all duration-300"
                >
                  {/* Visual Hotlinked Image header */}
                  <div className="h-44 bg-surface-container relative">
                    {req.imageUrl ? (
                      <img 
                        alt={req.cropType} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" 
                        referrerPolicy="no-referrer"
                        src={req.imageUrl} 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-primary/40">
                        <Truck className="w-12 h-12 mb-1" />
                        <span className="font-bold text-[10px] uppercase">Image Empty</span>
                      </div>
                    )}
                    
                    {/* Urgency Badge */}
                    <span className={`absolute top-4 left-4 text-[9px] font-sans font-black px-3 py-1 rounded-full shadow-sm uppercase tracking-wider ${
                      req.urgency === 'Immediate' ? 'bg-[#ffdad6] text-[#ba1a1a] animate-pulse' : 
                      req.urgency === '48 Hours' ? 'bg-[#ffddb1] text-[#624000]' : 'bg-surface-low text-on-surface-variant'
                    }`}>
                      {req.urgency} Action
                    </span>

                    {/* Weight Metric Badge */}
                    <span className="absolute bottom-4 right-4 bg-black/80 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-lg">
                      {req.weightTons} TONS
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-serif text-lg font-bold text-primary group-hover:text-secondary transition-colors leading-tight">
                            {req.cropType} Bulk Cargo
                          </h3>
                          <p className="text-xs text-on-surface-variant font-medium mt-0.5">{req.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-serif font-black text-secondary leading-none text-md">
                            {req.estimatedPriceRwf.toLocaleString()} RWF
                          </p>
                          <p className="text-[10px] font-sans text-on-surface-variant/80 font-bold tracking-tight mt-1">Est. Profit Value</p>
                        </div>
                      </div>

                      {/* Route Parameters list */}
                      <div className="mt-6 space-y-3 pt-4 border-t border-[#ece7e4]/60 font-sans text-xs">
                        {/* Origin */}
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-on-surface-variant block opacity-60">Collect Point</span>
                            <span className="font-bold text-on-surface text-xs">{req.origin} Co-op Hub</span>
                          </div>
                        </div>

                        {/* Destination */}
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0"></div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-on-surface-variant block opacity-60">Delivery Hub</span>
                            <span className="font-bold text-on-surface text-xs">{req.destination}</span>
                          </div>
                        </div>

                        {/* Distance / Timing */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#ece7e4]/30">
                          <div className="flex items-center gap-1.5 font-bold text-on-surface-variant opacity-80">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>{req.distanceKm} km (Est. {req.timeRequired})</span>
                          </div>
                          {req.isUrgent && (
                            <span className="text-[9px] font-sans font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                              INSURED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Operational Action Operators Drawer Controls */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => handleOpenNegotiation(req)}
                        className="bg-surface-low hover:bg-surface-container hover:text-secondary rounded-xl py-3 text-xs font-sans font-bold transition-all text-center text-on-surface-variant cursor-pointer border border-[#ece7e4]"
                      >
                        Counter Offer
                      </button>

                      <button
                        onClick={() => {
                          acceptRequest(req, req.estimatedPriceRwf);
                          showToast(
                            `Request for ${req.cropType} accepted. Consignment assigned to TRK-882.`,
                            'success',
                          );
                          navigate('/tracking');
                        }}
                        className="bg-primary text-white hover:bg-primary-container rounded-xl py-3 text-xs font-sans font-bold transition-all text-center shadow-md active:scale-95 cursor-pointer"
                      >
                        Accept Load
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Negotiation logs container template */
        <div className="bg-white rounded-3xl p-16 text-center border border-[#ece7e4] text-on-surface-variant/70 font-sans max-w-md mx-auto">
          <Clock className="w-12 h-12 text-[#9c4416] mx-auto mb-4 animate-pulse" />
          <p className="font-bold text-sm">Active negotiations are currently empty</p>
          <p className="text-xs opacity-85 mt-1 leading-relaxed">
            All submitted counter-offers have been settled or transitioned. Send counter-proposals to cooperatives in the "Incoming" tab to populate this sheet.
          </p>
        </div>
      )}

      {/* COUNTER OFFER MODAL (Drawn over requesting crop) */}
      {showCounterModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-primary/20 shadow-2xl relative overflow-hidden">
            {/* Imigongo Accent strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 imigongo-border"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-xl font-bold text-primary">Negotiate Counter Offer</h3>
              <button 
                onClick={() => setShowCounterModal(false)}
                className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyCounterOffer} className="space-y-5 font-sans text-xs">
              <div className="flex items-center gap-3 bg-surface-low p-4 rounded-xl border border-[#ece7e4]/60">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-sm font-black text-secondary">
                  {selectedRequest.cropType[0]}
                </div>
                <div>
                  <p className="font-sans font-bold text-sm text-on-surface leading-normal">{selectedRequest.cropType} Bulk load</p>
                  <p className="text-xs text-on-surface-variant font-medium opacity-80">Origin: {selectedRequest.origin} Hub</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant">Your Proposed Transport Fare (RWF)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif font-black text-primary text-sm">RWF</span>
                  <input 
                    type="number" 
                    required
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    className="w-full bg-[#fcfaf7] border-b-2 border-primary border-t-0 border-l-0 border-r-0 rounded-t-lg pl-14 pr-4 py-3.5 text-md font-serif font-black focus:outline-none focus:border-secondary text-on-surface"
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant opacity-80 leading-snug">
                  Original offer: <span className="font-bold">{selectedRequest.estimatedPriceRwf.toLocaleString()} RWF</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-on-surface-variant">Justification / Remarks for Cooperative</label>
                <textarea
                  required
                  rows={2}
                  value={counterReason}
                  onChange={(e) => setCounterReason(e.target.value)}
                  className="w-full bg-[#fcfaf7] rounded-lg p-3 border border-transparent focus:outline-none focus:border-secondary hover:border-[#ece7e4] text-xs text-on-surface"
                />
              </div>

              <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/15 text-[11px] leading-relaxed text-secondary font-medium">
                SMS notification will be immediately dispatched to {selectedRequest.customerName}'s team in {selectedRequest.origin}.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowCounterModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#ece7e4] text-on-surface-variant font-bold font-sans cursor-pointer"
                >
                  Close
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-secondary text-white font-bold font-sans hover:brightness-110 shadow-sm active:scale-95 cursor-pointer"
                >
                  Submit Proposed Fare
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
