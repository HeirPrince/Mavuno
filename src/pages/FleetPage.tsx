import { useState } from 'react';
import { 
  Truck, 
  Bike, // lucide motorcycle representation
  Navigation, // pickup icon representation
  ThermometerSnowflake, // cold storage representation
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Info,
  MapPin,
  Flame,
  FileText
} from 'lucide-react';
import { Vehicle } from '@/lib/types';
import { useAppContext } from '@/context/AppContext';

export default function FleetPage() {
  const { state, addVehicle, updateVehicleStatus } = useAppContext();
  const { vehicles } = state;
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Selected state for Wizard
  const [wizardType, setWizardType] = useState<'motorcycle' | 'pickup' | 'truck' | 'cold_storage'>('truck');
  const [wizardCapacity, setWizardCapacity] = useState('5000');
  const [wizardPlate, setWizardPlate] = useState('RAE 120 K');
  const [wizardInsurance, setWizardInsurance] = useState('Radiant Insurance - POL-412XXX');
  const [wizardDistricts, setWizardDistricts] = useState<string[]>(['Kigali City (All Districts)']);

  // File Upload emulation states
  const [vehiclePhotoUploaded, setVehiclePhotoUploaded] = useState(false);
  const [logbookUploaded, setLogbookUploaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const vehicleTypes = [
    { id: 'motorcycle', name: 'Motorcycle', desc: 'Last-mile delivery', icon: Bike },
    { id: 'pickup', name: 'Pickup', desc: 'Medium bulk loads', icon: Navigation },
    { id: 'truck', name: 'Truck', desc: 'Heavy agricultural haulage', icon: Truck },
    { id: 'cold_storage', name: 'Cold Storage', desc: 'Perishables & Dairy', icon: ThermometerSnowflake },
  ] as const;

  const districtsOptions = [
    'Kigali City (All Districts)',
    'Musanze',
    'Rubavu',
    'Huye',
    'Nyagatare',
    'Kayonza'
  ];

  const toggleDistrictInWizard = (d: string) => {
    setWizardDistricts(prev => {
      if (prev.includes(d)) {
        return prev.filter(item => item !== d);
      } else {
        return [...prev, d];
      }
    });
  };

  const handleSimulateUpload = (type: 'photo' | 'logbook') => {
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          if (type === 'photo') setVehiclePhotoUploaded(true);
          if (type === 'logbook') setLogbookUploaded(true);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const handleFormFinish = () => {
    if (!wizardPlate || !wizardCapacity) {
      alert("Please fill out plate number and capacity.");
      return;
    }

    const created: Vehicle = {
      id: `TRK-${Math.floor(100 + Math.random() * 900)}`,
      type: wizardType,
      plateNumber: wizardPlate.toUpperCase(),
      capacityKg: parseFloat(wizardCapacity) || 1200,
      insurancePolicy: wizardInsurance || "Radiant Insurance - POL-Standard_Policy",
      districts: wizardDistricts.length > 0 ? wizardDistricts : ["Kigali All Districts"],
      status: "Active"
    };

    addVehicle(created);
    
    // reset registration process
    setCurrentStep(1);
    setVehiclePhotoUploaded(false);
    setLogbookUploaded(false);
    setWizardPlate('');
    setWizardCapacity('');
    setWizardInsurance('');
    setWizardDistricts(['Kigali City (All Districts)']);

    alert(`Registration submitted successfully! Our fleet managers will review your documents within 24 hours. Your registered transport unit "${created.plateNumber}" has been cataloged.`);
  };

  return (
    <div className="space-y-12">
      {/* Title Intro Block */}
      <div className="space-y-3">
        <h1 className="font-serif text-3xl font-extrabold text-primary tracking-tight md:text-5xl">
          Register Your Fleet
        </h1>
        <p className="text-base text-on-surface-variant font-sans max-w-2xl leading-relaxed opacity-95">
          Empower your agricultural logistics business by joining Rwanda's premier transport network. Complete the four-step registration to start receiving dispatch requests.
        </p>
      </div>

      {/* Main Multi-step Form layout panel */}
      <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl border border-[#ece7e4] relative overflow-hidden">
        {/* Imigongo border accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 imigongo-border"></div>

        {/* Stepper Progress bar */}
        <div className="flex justify-between items-center mb-12 relative select-none">
          {/* Progress trace connectors */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-surface-container -translate-y-1/2 -z-10"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 -z-10 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>

          {/* Page Indicators */}
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <button
                key={stepNum}
                onClick={() => {
                  if (stepNum <= currentStep || stepNum === currentStep + 1) {
                    setCurrentStep(stepNum);
                  }
                }}
                className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-all font-sans font-bold text-xs ${
                  isCompleted 
                    ? 'bg-primary text-white shadow-md' 
                    : isActive 
                    ? 'bg-secondary text-white shadow-md scale-110' 
                    : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span className={`text-[10px] uppercase font-sans tracking-widest font-extrabold ${
                  isActive ? 'text-secondary font-black' : isCompleted ? 'text-primary' : 'text-on-surface-variant/60'
                }`}>
                  {stepNum === 1 ? 'Vehicle' : stepNum === 2 ? 'Details' : stepNum === 3 ? 'Media' : 'Area'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Step Panel Content */}
        <div className="min-h-72">
          
          {/* Step 1: Selecting vehicle card wrapping */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-primary">Select Vehicle Type</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {vehicleTypes.map(type => {
                  const Icon = type.icon;
                  const isSelected = wizardType === type.id;

                  return (
                    <label 
                      key={type.id}
                      onClick={() => setWizardType(type.id)}
                      className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer hover:border-secondary transition-all bg-surface-low/30 group ${
                        isSelected 
                          ? 'border-secondary bg-secondary/5 shadow-md shadow-secondary/5' 
                          : 'border-[#ece7e4]/60 hover:bg-white'
                      }`}
                    >
                      <Icon className={`w-10 h-10 mb-4 transition-transform group-hover:scale-110 text-secondary ${isSelected ? 'text-secondary animate-bounce' : 'text-secondary'}`} />
                      <span className="text-sm font-sans font-bold text-on-surface leading-tight">{type.name}</span>
                      <span className="text-[11px] text-on-surface-variant font-medium mt-1 leading-none text-center">
                        {type.desc}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Technical specifications inputs */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-primary">Technical Specifications</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary font-sans uppercase tracking-wider">
                    Max Capacity (KG)
                  </label>
                  <input 
                    type="number"
                    placeholder="e.g. 5000"
                    value={wizardCapacity}
                    onChange={(e) => setWizardCapacity(e.target.value)}
                    className="w-full bg-[#fcfaf7] border-b-2 border-primary border-t-0 border-l-0 border-r-0 rounded-t-lg px-4 py-3 text-sm focus:outline-none focus:border-secondary transition-all font-bold text-on-surface"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary font-sans uppercase tracking-wider">
                    License Plate Number
                  </label>
                  <input 
                    type="text"
                    placeholder="RAE 000 A"
                    value={wizardPlate}
                    onChange={(e) => setWizardPlate(e.target.value)}
                    className="w-full bg-[#fcfaf7] border-b-2 border-primary border-t-0 border-l-0 border-r-0 rounded-t-lg px-4 py-3 text-sm focus:outline-none focus:border-secondary transition-all font-bold uppercase text-on-surface"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-sans">
                <label className="text-xs font-bold text-primary font-sans uppercase tracking-wider">
                  Insurance Provider & Policy Number
                </label>
                <input 
                  type="text"
                  placeholder="Radiant Insurance - POL-987XXX"
                  value={wizardInsurance}
                  onChange={(e) => setWizardInsurance(e.target.value)}
                  className="w-full bg-[#fcfaf7] border-b-2 border-primary border-t-0 border-l-0 border-r-0 rounded-t-lg px-4 py-3 text-sm focus:outline-none focus:border-secondary transition-all font-bold text-on-surface"
                />
              </div>

              <div className="p-4 bg-tertiary-container/5 border border-tertiary-container/20 rounded-2xl flex gap-3.5 pt-4">
                <Info className="w-5 h-5 text-tertiary shrink-0" />
                <p className="text-xs text-tertiary font-medium leading-relaxed font-sans mt-0.5">
                  Ensure your vehicle weight capacity aligns with Rwanda RURA logistics guidelines for inter-district transport.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Paper Logbook log files media upload */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-primary">Upload Documents & Media</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
                {/* Image upload container: appearance */}
                <div className="space-y-3 flex flex-col justify-between">
                  <p className="text-xs font-extrabold uppercase text-primary tracking-widest font-sans">
                    Vehicle Appearance
                  </p>
                  
                  <div 
                    onClick={() => handleSimulateUpload('photo')}
                    className="aspect-video w-full rounded-2xl border-2 border-dashed border-[#ece7e4] hover:border-secondary bg-surface-low/50 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-colors"
                  >
                    {vehiclePhotoUploaded ? (
                      <>
                        <img 
                          alt="Truck registered photo" 
                          className="absolute inset-0 w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdILuYRP3-rBhY1Ku4rOEmyCpoVwigwFfmrKKtBmmqcjO9lfOqtb9Dow1ewPbsIabzSHv47mlDfr2x3LFsqisUBc5k-eQhcZFiWAPakdtpwesqoSFF2xei17k0MvkND69ahcyl587DwpksOCtQ9l_sdu5D1oFu48lOtXDhthMrHkTIsplQMjYCF4kH6-PtMMKywF5iKoTNHx_55bFJsQPfo0s4F8HLY2fdkBVbl57oTDB-Qx-RGZgegCvc2DF2bSff_FZgDRgsCyU" 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-sans text-xs font-bold bg-primary px-3 py-1.5 rounded-full animate-bounce">
                            Replace Photo
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-10 h-10 text-primary mx-auto mb-2 animate-pulse" />
                        <p className="text-xs font-bold text-on-surface">Upload Vehicle Photo</p>
                        <p className="text-[10px] text-on-surface-variant opacity-80 mt-1 font-medium">
                          Front/Side 45° angle preferred. Click to simulate.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logbook document registration */}
                <div className="space-y-3 flex flex-col justify-between">
                  <p className="text-xs font-extrabold uppercase text-primary tracking-widest font-sans">
                    Registration Logbook (Yellow Card)
                  </p>

                  <div 
                    onClick={() => handleSimulateUpload('logbook')}
                    className="aspect-video w-full rounded-2xl border-2 border-dashed border-[#ece7e4] hover:border-secondary bg-surface-low/50 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-colors"
                  >
                    {logbookUploaded ? (
                      <div className="text-center p-4">
                        <Check className="w-10 h-10 text-primary mx-auto mb-2 bg-[#bcf0ae] rounded-full p-2" />
                        <p className="text-xs font-bold text-primary">Logbook Uploaded Successfully</p>
                        <p className="text-[10px] text-on-surface-variant font-sans font-medium mt-1">
                          AgriTrans_Logbook_RAE120K.pdf
                        </p>
                      </div>
                    ) : (
                      <div className="text-center p-4 font-sans text-xs">
                        <FileText className="w-10 h-10 text-primary mx-auto mb-2 animate-pulse" />
                        <p className="text-xs font-bold text-on-surface">Upload Yellow Card Logbook</p>
                        <p className="text-[10px] text-on-surface-variant opacity-80 mt-1 font-medium">
                          PDF or High-res JPG scan. Click to simulate.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Map operational corridors */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-primary">Service Area Selection</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* District checkboxes list */}
                <div className="lg:col-span-2 space-y-4">
                  <p className="text-xs font-sans text-on-surface-variant font-medium leading-relaxed">
                    Select the districts where your vehicle is licensed to operate. You will only receive dispatch requests originating or terminating in these areas.
                  </p>

                  <div className="max-h-56 overflow-y-auto pr-2 space-y-2 select-none divide-y divide-[#ece7e4]/40">
                    {districtsOptions.map(district => {
                      const isChecked = wizardDistricts.includes(district);

                      return (
                        <label 
                          key={district}
                          onClick={() => toggleDistrictInWizard(district)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container/60 transition-colors cursor-pointer group font-sans text-xs font-bold text-on-surface pt-3"
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="w-4.5 h-4.5 rounded border-[#ece7e4] text-primary focus:ring-primary cursor-pointer"
                          />
                          <span className="group-hover:text-secondary transition-colors">{district}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Stylized coverage map representation */}
                <div className="lg:col-span-3">
                  <div className="w-full h-64 rounded-3xl overflow-hidden border border-[#ece7e4] relative shadow-inner">
                    <img 
                      alt="AgriTrans Operations Coverage Map" 
                      className="w-full h-full object-cover contrast-110"
                      referrerPolicy="no-referrer"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK60ALRo-ATQauCZ06xTa-9Ngn-Sscb6c-A_KfWq9vDB9hisoWnnnsVKf8TuB_yiz26bLTrIvBGvMALgi_a7FSTyXpcSVwV8zlEu-Z5SVpu5e124NQD5hZ0rGWMeppADRH2MS6leLvClcpzmvXEiASr2Tq7Cc_AbAzUP1QIEMgBd3kpGPmNg391XncKzQEU36JSSIAf_5rxw8FKtbov5vthEWngxtA-_g3bTPV7EbsIHZ8Vhph7mO-NEKpjrAOcGRyiMV-Ig03_S8" 
                    />
                    
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-primary/20 shadow-md">
                      <p className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-primary">
                        Coverage Active
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard navigation bar controls */}
        <div className="mt-12 pt-8 border-t border-[#ece7e4]/60 flex justify-between items-center">
          <button 
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className={`flex items-center gap-2 text-sm font-sans font-bold transition-colors cursor-pointer ${
              currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-on-surface-variant hover:text-secondary'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentStep === totalSteps ? (
            <button
              type="button"
              onClick={handleFormFinish}
              className="bg-secondary text-white px-8 py-3.5 rounded-xl font-sans text-xs font-bold flex items-center gap-2 hover:brightness-110 shadow-lg shadow-secondary/10 transition-all active:scale-95 cursor-pointer"
            >
              <span>Complete Registration</span>
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="bg-primary text-white px-8 py-3.5 rounded-xl font-sans text-xs font-bold flex items-center gap-2 hover:bg-primary-container shadow-lg shadow-primary/10 transition-all active:scale-95 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE REGISTERED FLEETS LISTING DISPLAY (Interactive management board) */}
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-primary">Active Verified Fleet</h2>
          <p className="text-xs text-on-surface-variant font-sans mt-1">Currently registered and dispatch-eligible transport units</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans text-xs">
          {vehicles.map(v => (
            <div key={v.id} className="bg-white rounded-3xl overflow-hidden border border-[#ece7e4] shadow-sm flex flex-col">
              {/* Optional photographic banner */}
              <div className="h-32 bg-surface-container relative">
                {v.photoUrl ? (
                  <img 
                    alt="Active Truck profile" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    src={v.photoUrl} 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-secondary opacity-60">
                    <Truck className="w-10 h-10 mb-1" />
                    <span className="font-sans font-bold text-[9px] uppercase tracking-wider">No photo provided</span>
                  </div>
                )}
                
                <span className={`absolute top-3 right-3 text-[9px] font-sans font-black px-2 py-0.5 rounded-full shadow-sm ${
                  v.status === 'In Transit' ? 'bg-[#bcf0ae] text-primary' : 'bg-secondary/15 text-secondary'
                }`}>
                  {v.status}
                </span>
              </div>

              {/* Specs parameters card */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-on-surface text-sm uppercase leading-none font-sans mt-0.5">
                      {v.plateNumber}
                    </h4>
                    <span className="text-[10px] font-bold text-on-surface-variant capitalize">
                      {v.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">Capacity: {v.capacityKg} kg</p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {v.districts.slice(0, 2).map((dist, idx) => (
                    <span key={idx} className="bg-surface-low text-on-surface-variant text-[9px] font-sans font-bold px-2 py-0.5 rounded-full border border-[#ece7e4]/60">
                      {dist.split(' ')[0]}
                    </span>
                  ))}
                  {v.districts.length > 2 && (
                    <span className="text-[9px] text-[#9c4416] font-bold self-center">+{v.districts.length - 2} more</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Reviewing credentials for fleet ID ${v.id}:\nPlate: ${v.plateNumber}\nCapacity: ${v.capacityKg}kg\nInsurance: ${v.insurancePolicy}\nRoute validation status: Standard SLA Met.`)}
                  className="w-full border border-[#ece7e4] text-[#42493e] hover:border-primary hover:text-primary rounded-lg py-1.5 font-bold transition-all text-center cursor-pointer"
                >
                  Manage Coverage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
