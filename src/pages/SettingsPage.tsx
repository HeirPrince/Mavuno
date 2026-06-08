import React, { useState } from 'react';
import { 
  Settings, 
  Percent, 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  MessageSquare, 
  BookOpen, 
  Tag,
  Clock,
  Shield,
  CheckCircle
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function SettingsPage() {
  const { state, updateCommission, addGrade, addCrop } = useAppContext();
  const { config } = state;
  // Local state modifiers for inputs
  const [commissionRate, setCommissionRate] = useState(config.commissionPercent);
  const [surcharge, setSurcharge] = useState(config.logisticsSurchargeRwf);
  
  // Custom interactive Grade state
  const [newGradeName, setNewGradeName] = useState('');
  const [newGradeCode, setNewGradeCode] = useState('');
  const [newGradeDesc, setNewGradeDesc] = useState('');

  // Custom interactive tag state
  const [newCropName, setNewCropName] = useState('');

  // Custom live SMS template viewer state
  const [selectedTemplateId, setSelectedTemplateId] = useState(config.templates[0]?.id || '');
  const [templateDrafts, setTemplateDrafts] = useState<Record<string, string>>(
    config.templates.reduce((acc, t) => ({ ...acc, [t.id]: t.body }), {})
  );

  const handleSaveFeeSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (commissionRate < 0 || commissionRate > 100) {
      alert("Please enter a valid percentage (0% to 100%).");
      return;
    }
    updateCommission(commissionRate);
    alert(`Platform Fee Parameters Saved!\nCommission set to ${commissionRate}%. Surcharge set to ${surcharge.toLocaleString()} RWF.`);
  };

  const handleAddNewGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradeName || !newGradeCode) return;

    addGrade({
      id: `GRD-${Date.now().toString().slice(-3)}`,
      name: newGradeName,
      code: newGradeCode.toUpperCase(),
      description: newGradeDesc || "Standard moisture, processing checks pending.",
      hubsCount: 1,
      usageDetails: "Used by 1 Hub"
    });

    setNewGradeName('');
    setNewGradeCode('');
    setNewGradeDesc('');

    alert(`Quality class "${newGradeCode}" created! Hub operations notified.`);
  };

  const handleAddNewCropTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName) return;

    addCrop({
      id: `CRP-${Date.now().toString().slice(-3)}`,
      name: newCropName,
      type: 'coffee', // standard fallback
      sharePercent: 2
    });

    setNewCropName('');
    alert(`Agricultural crop category "${newCropName}" added to system schemas.`);
  };

  const activeTemplate = config.templates.find(t => t.id === selectedTemplateId);

  // Computed platform effect preview calculation
  const estimatedCoopSavingsRwf = (Math.max(0, (15 - commissionRate) * 128000)).toFixed(0);

  return (
    <div className="space-y-12">
      {/* Page Header Introduction */}
      <div className="space-y-2">
        <h2 className="font-serif text-3xl font-extrabold text-primary tracking-tight md:text-4xl">
          Platform parameters Configuration
        </h2>
        <p className="text-sm font-sans text-on-surface-variant font-medium opacity-90 max-w-xl">
          Calibrate system transaction fees, define quality grades criteria, manage indexing, and edit notification templates.
        </p>
      </div>

      {/* Primary configuration columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Fee Structuring with estimated impacts */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-[#ece7e4] shadow-sm relative overflow-hidden">
            <h3 className="font-serif text-lg font-bold text-primary mb-6 flex items-center gap-2">
              <Percent className="w-5 h-5 text-secondary" />
              <span>Platform Fee Structure</span>
            </h3>

            <form onSubmit={handleSaveFeeSettings} className="space-y-6 font-sans text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                  Standard Commission (%)
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#fcfaf7] border-b-2 border-primary border-t-0 border-l-0 border-r-0 rounded-t-lg px-4 py-3.5 text-md font-sans font-bold focus:outline-none focus:border-secondary text-on-surface"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-bold">%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                  Inter-District Surcharge (RWF)
                </label>
                <input 
                  type="number"
                  value={surcharge}
                  onChange={(e) => setSurcharge(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#fcfaf7] border-b-2 border-primary border-t-0 border-l-0 border-r-0 rounded-t-lg px-4 py-3.5 text-sm font-sans font-bold focus:outline-none focus:border-secondary text-on-surface"
                />
              </div>

              {/* Action buttons */}
              <button 
                type="submit"
                className="w-full bg-primary text-white py-3.5 px-4 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary-container shadow-sm active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Fee Parameters</span>
              </button>
            </form>

            {/* Estimated impact box */}
            <div className="mt-8 pt-6 border-t border-[#ece7e4]/60 bg-[#fdf8f5] p-5 rounded-2xl border border-secondary/15 flex gap-3">
              <Sparkles className="w-5 h-5 text-secondary shrink-0" />
              <div className="font-sans text-xs">
                <p className="font-bold text-secondary">Estimated Cooperative Savings</p>
                <p className="text-on-surface-variant mt-1 font-medium leading-relaxed">
                  Moving rates to {commissionRate}% secures an extra <span className="font-bold text-primary">{parseInt(estimatedCoopSavingsRwf).toLocaleString()} RWF / month</span> directly inside cooperative cash pools across Rwanda.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Columns: Categories, Grades & Templates */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quality check grades */}
          <div className="bg-white p-8 rounded-3xl border border-[#ece7e4] shadow-sm">
            <h3 className="font-serif text-lg font-bold text-primary mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-secondary" />
              <span>Moisture & Quality Grading Codes</span>
            </h3>

            {/* Grades list */}
            <div className="space-y-4 mb-8">
              {config.grades.map(grade => (
                <div key={grade.id} className="p-4 bg-surface-low rounded-2xl border border-transparent hover:border-[#ece7e4]/60 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-secondary/10 text-secondary text-[10px] font-sans font-black px-2 py-0.5 rounded-md">
                        {grade.code}
                      </span>
                      <h4 className="font-sans font-bold text-sm text-on-surface leading-snug">{grade.name}</h4>
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium mt-1 leading-normal">
                      {grade.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-sans font-bold text-on-surface-variant shrink-0 uppercase tracking-wide bg-white px-2.5 py-1 rounded-lg border border-[#ece7e4]">
                    {grade.usageDetails}
                  </span>
                </div>
              ))}
            </div>

            {/* Inline grade adding form */}
            <form onSubmit={handleAddNewGrade} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#ece7e4]/60 font-sans text-xs">
              <input 
                type="text" 
                placeholder="Grade Name (e.g. Export Standard)" 
                required
                value={newGradeName}
                onChange={(e) => setNewGradeName(e.target.value)}
                className="bg-surface-low border border-transparent rounded-xl px-4 py-3 placeholder:text-on-surface-variant/40 hover:border-[#ece7e4] focus:outline-none focus:bg-white text-on-surface"
              />
              <input 
                type="text" 
                placeholder="Code (e.g. PREMIUM B)" 
                required
                value={newGradeCode}
                onChange={(e) => setNewGradeCode(e.target.value)}
                className="bg-surface-low border border-transparent rounded-xl px-4 py-3 placeholder:text-on-surface-variant/40 hover:border-[#ece7e4] focus:outline-none focus:bg-white text-on-surface"
              />
              <button 
                type="submit"
                className="bg-[#154212]/10 hover:bg-primary hover:text-white text-primary rounded-xl font-bold font-sans transition-all py-3 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Quality Standard</span>
              </button>
            </form>
          </div>

          {/* Active indexing tags and SMS Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Active indexed crops */}
            <div className="bg-white p-8 rounded-3xl border border-[#ece7e4] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary mb-2 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-secondary" />
                  <span>Harvest Categories</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 font-medium leading-relaxed mb-6">
                  Crops currently authorized for inter-district premium logistics coverage
                </p>

                {/* Tags grid */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {config.crops.map(crop => (
                    <span 
                      key={crop.id}
                      className="bg-surface-low text-primary text-xs font-sans font-bold px-3 py-1.5 rounded-full border border-primary/10 flex items-center gap-1 hover:border-secondary hover:text-secondary cursor-pointer transition-colors"
                      title={`${crop.name}: Representing ${crop.sharePercent}% volumes.`}
                    >
                      <span>{crop.name}</span>
                      <span className="text-[9px] opacity-60">({crop.sharePercent}%)</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Inline category input */}
              <form onSubmit={handleAddNewCropTag} className="flex gap-2 font-sans text-xs pt-4 border-t border-[#ece7e4]/60">
                <input 
                  type="text" 
                  placeholder="New crop (e.g. Avocado)" 
                  required
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="bg-surface-low border border-transparent rounded-xl px-3.5 py-2.5 placeholder:text-on-surface-variant/40 hover:border-[#ece7e4] focus:outline-none focus:bg-white flex-grow text-on-surface"
                />
                <button 
                  type="submit"
                  className="bg-primary text-white hover:bg-primary-container px-4 rounded-xl font-bold transition-all flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Notification models templates */}
            <div className="bg-white p-8 rounded-3xl border border-[#ece7e4] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary mb-2 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-secondary" />
                  <span>Active SMS Templates</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 font-medium mb-6">
                  Transmitter SMS broadcasts triggered during transaction phases
                </p>

                {/* Template selector buttons */}
                <div className="flex gap-1 bg-surface-container p-1 rounded-xl w-full text-[10px] font-sans font-extrabold tracking-wide uppercase">
                  {config.templates.map(tmp => (
                    <button
                      key={tmp.id}
                      onClick={() => setSelectedTemplateId(tmp.id)}
                      className={`flex-1 py-1 px-1.5 rounded-lg transition-all text-center truncate ${
                        selectedTemplateId === tmp.id 
                          ? 'bg-white text-primary shadow-sm font-black' 
                          : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {tmp.title.split(' ')[0]}
                    </button>
                  ))}
                </div>

                {/* Selected template text live previewer/editor container */}
                {activeTemplate && (
                  <div className="mt-4 p-4 rounded-2xl bg-surface-low border border-[#ece7e4]/60 text-xs font-mono text-on-surface leading-tight relative min-h-24">
                    <textarea
                      value={templateDrafts[activeTemplate.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTemplateDrafts(prev => ({ ...prev, [activeTemplate.id]: val }));
                      }}
                      className="w-full bg-transparent border-0 focus:ring-0 p-0 text-xs leading-relaxed resize-none focus:outline-none"
                      rows={3}
                    />
                    <span className="absolute bottom-2.5 right-3 text-[9px] uppercase font-sans font-bold opacity-60">
                      Edit Live draft
                    </span>
                  </div>
                )}
              </div>

              {/* Save template draft */}
              <button
                onClick={() => {
                  alert("SMS notifications template schema serialized and locked. Future transactions will trigger this modified message format.");
                }}
                className="w-full bg-surface-low border border-[#ece7e4] hover:bg-surface-container font-sans text-xs font-bold py-2 rounded-xl text-center text-on-surface-variant transition-colors mt-4 cursor-pointer"
              >
                Serialize Custom Template
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
