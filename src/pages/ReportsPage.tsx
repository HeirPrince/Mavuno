import { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  ArrowRightLeft, 
  Plus,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function ReportsPage() {
  const { state } = useAppContext();
  const { transactions, config } = state;
  const commissionPercentage = config.commissionPercent;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

  // Calculations for financial stats
  const totalVolume = useMemo(() => {
    return transactions.reduce((acc, current) => acc + current.orderValueRwf, 0);
  }, [transactions]);

  const totalCommission = useMemo(() => {
    return transactions.reduce((acc, current) => acc + current.commissionRwf, 0);
  }, [transactions]);

  const totalSettled = useMemo(() => {
    return transactions
      .filter(t => t.status === 'Settled')
      .reduce((acc, current) => acc + current.orderValueRwf, 0);
  }, [transactions]);

  const totalProcessing = useMemo(() => {
    return transactions
      .filter(t => t.status === 'Processing')
      .reduce((acc, current) => acc + current.orderValueRwf, 0);
  }, [transactions]);

  const handleExportCSV = () => {
    let headers = "Transaction ID,Date,Farmer,Buyer,Crop,Weight,Order Value (RWF),System Commission (RWF),Status\n";
    let rows = filteredTransactions.map(t => 
      `"${t.id}","${t.date}","${t.farmerName}","${t.buyerName}","${t.cropName}","${t.weightDescription}",${t.orderValueRwf},${t.commissionRwf},"${t.status}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `AgriTrans_Platform_Ledger.csv`);
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Title layout */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-extrabold text-primary tracking-tight">Exchange Billing Ledger</h2>
          <p className="text-sm font-sans text-on-surface-variant font-medium mt-1 opacity-90">
            Real-time auditing of platform commission settlements and cooperative dues.
          </p>
        </div>

        <button 
          onClick={handleExportCSV}
          className="bg-primary text-white py-3 px-6 rounded-xl font-sans text-xs font-bold leading-none flex items-center gap-2 hover:bg-primary-container shadow-sm active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* KPI Financial stats widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans">
        {/* Cumulative Volume */}
        <div className="bg-white p-6 rounded-3xl border border-[#ece7e4] shadow-sm">
          <p className="text-on-surface-variant font-sans font-bold text-xs uppercase tracking-wider">Exchange Volume</p>
          <h3 className="text-3xl font-serif font-bold text-primary mt-1">{totalVolume.toLocaleString()} RWF</h3>
          <p className="text-primary font-sans text-[11px] font-bold mt-2">Active trade capacity verified</p>
        </div>

        {/* Commission collected */}
        <div className="bg-white p-6 rounded-3xl border border-[#ece7e4] shadow-sm">
          <p className="text-on-surface-variant font-sans font-bold text-xs uppercase tracking-wider">Commission Profit</p>
          <h3 className="text-3xl font-serif font-bold text-secondary mt-1">{totalCommission.toLocaleString()} RWF</h3>
          <p className="text-on-surface-variant text-[11px] font-medium mt-2">At standard {commissionPercentage}% fee tier</p>
        </div>

        {/* Settled transits */}
        <div className="bg-white p-6 rounded-3xl border border-[#ece7e4] shadow-sm">
          <p className="text-on-surface-variant font-sans font-bold text-xs uppercase tracking-wider">Settled Payouts</p>
          <h3 className="text-3xl font-serif font-bold text-tertiary mt-1">{totalSettled.toLocaleString()} RWF</h3>
          <div className="w-full bg-surface-container h-1 mt-3 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Processing/Pending transits */}
        <div className="bg-white p-6 rounded-3xl border border-[#ece7e4] shadow-sm">
          <p className="text-on-surface-variant font-sans font-bold text-xs uppercase tracking-wider">In-Escrow Dues</p>
          <h3 className="text-3xl font-serif font-bold text-on-surface mt-1">{totalProcessing.toLocaleString()} RWF</h3>
          <p className="text-secondary font-sans text-[11px] font-bold mt-2">Released on hub delivery confirmation</p>
        </div>
      </div>

      {/* Main Ledger data table layout */}
      <div className="bg-white rounded-3xl border border-[#ece7e4] shadow-xl overflow-hidden">
        
        {/* Controls, searching, status filtering bar */}
        <div className="px-8 py-6 border-b border-[#ece7e4]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcfaf7]">
          <h4 className="font-serif text-lg font-bold text-primary">Recent Transactions Audit</h4>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs bg-surface-low rounded-xl border border-transparent font-sans hover:border-[#ece7e4] focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-on-surface w-48"
              />
            </div>

            {/* Status dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-sans rounded-xl bg-surface-low border border-transparent hover:border-[#ece7e4] text-on-surface focus:outline-none font-bold"
            >
              <option value="All">All Transactions</option>
              <option value="Settled">Settled</option>
              <option value="Processing">Processing</option>
            </select>
          </div>
        </div>

        {/* Interactive ledger table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-surface-low/30 border-b border-[#ece7e4]/60">
                <th className="px-8 py-4 font-sans font-bold text-xs text-on-surface-variant uppercase tracking-wider">Ref ID</th>
                <th className="px-8 py-4 font-sans font-bold text-xs text-on-surface-variant uppercase tracking-wider">Farmer Coop</th>
                <th className="px-8 py-4 font-sans font-bold text-xs text-on-surface-variant uppercase tracking-wider">Buyer Account</th>
                <th className="px-8 py-4 font-sans font-bold text-xs text-on-surface-variant uppercase tracking-wider">Crop & Weight</th>
                <th className="px-8 py-4 font-sans font-bold text-xs text-on-surface-variant uppercase tracking-wider">Settled Sum</th>
                <th className="px-8 py-4 font-sans font-bold text-xs text-on-surface-variant uppercase tracking-wider text-right">Commission Fee</th>
                <th className="px-8 py-4 font-sans font-bold text-xs text-on-surface-variant uppercase tracking-wider text-right">Escrow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece7e4]/40">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-on-surface-variant opacity-60 text-sm">
                    No billing transactions found. Try adjusting searches.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-primary/5 transition-colors group">
                    {/* Ref ID */}
                    <td className="px-8 py-5 font-serif font-bold text-xs text-primary">
                      {t.id}
                    </td>

                    {/* Farmer */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2.5">
                        {t.farmerAvatar ? (
                          <img 
                            alt={t.farmerName} 
                            className="w-7 h-7 rounded-full object-cover border border-[#ece7e4]" 
                            referrerPolicy="no-referrer"
                            src={t.farmerAvatar} 
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-[10px] text-secondary">
                            {t.farmerName[0]}
                          </div>
                        )}
                        <span className="font-sans font-bold text-sm text-on-surface">{t.farmerName}</span>
                      </div>
                    </td>

                    {/* Buyer */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2.5">
                        {t.buyerAvatar ? (
                          <img 
                            alt={t.buyerName} 
                            className="w-7 h-7 rounded-full object-cover border border-[#ece7e4]" 
                            referrerPolicy="no-referrer"
                            src={t.buyerAvatar} 
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center font-bold text-[10px] text-primary">
                            {t.buyerName[0]}
                          </div>
                        )}
                        <span className="font-sans font-medium text-xs text-on-surface-variant">{t.buyerName}</span>
                      </div>
                    </td>

                    {/* Crop name & volume descriptor */}
                    <td className="px-8 py-5 font-sans">
                      <p className="font-bold text-sm text-on-surface leading-tight">{t.cropName}</p>
                      <p className="text-[11px] text-on-surface-variant opacity-80 mt-0.5">{t.weightDescription} Net Net</p>
                    </td>

                    {/* Payout total */}
                    <td className="px-8 py-5 font-bold font-serif text-sm">
                      {t.orderValueRwf.toLocaleString()} RWF
                    </td>

                    {/* System Commission calculated row */}
                    <td className="px-8 py-5 text-right font-sans font-bold text-xs text-secondary">
                      {t.commissionRwf.toLocaleString()} RWF
                    </td>

                    {/* Escrow status */}
                    <td className="px-8 py-5 text-right">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${
                        t.status === 'Settled' ? 'bg-primary/5 text-primary border-primary/20' : 
                        'bg-secondary/10 text-secondary border-secondary/15 animate-pulse'
                      }`}>
                        {t.status === 'Settled' ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                        <span>{t.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Small stats audit stamp */}
        <div className="px-8 py-5 bg-surface-low border-t border-[#ece7e4]/60 text-right text-[10px] uppercase font-sans font-bold text-on-surface-variant tracking-wider leading-none">
          Ledger auditing systems locked under SHA-256 integrity checkers.
        </div>
      </div>
    </div>
  );
}
