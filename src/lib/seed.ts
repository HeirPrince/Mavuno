import { User, Vehicle, TransportRequest, DispatchTracking, PlatformConfig, Transaction } from '@/lib/types';

export const initialUsers: User[] = [
  {
    id: "USR-101",
    name: "Makuza Kevin",
    email: "kevin.m@agri.rw",
    role: "Farmer",
    district: "Musanze",
    status: "Pending",
    joinDate: "Oct 24, 2024",
    initials: "MK"
  },
  {
    id: "USR-102",
    name: "Ishimwe Alice",
    email: "a.ishimwe@logistics.com",
    role: "Transporter",
    district: "Kigali",
    status: "Verified",
    joinDate: "Sep 12, 2024",
    initials: "IA"
  },
  {
    id: "USR-103",
    name: "Butera Noel",
    email: "noel.b@marketplace.rw",
    role: "Buyer",
    district: "Rubavu",
    status: "Flagged",
    joinDate: "Aug 30, 2024",
    initials: "BN"
  },
  {
    id: "USR-104",
    name: "Uwase Mary",
    email: "mary.u@farmhub.rw",
    role: "Farmer",
    district: "Huye",
    status: "Verified",
    joinDate: "Jul 15, 2024",
    initials: "UM"
  },
  // Extra elements for rich interface & pagination
  {
    id: "USR-105",
    name: "Gakire Martin",
    email: "m.gakire@global.rw",
    role: "Buyer",
    district: "Kigali",
    status: "Verified",
    joinDate: "Jun 11, 2024",
    initials: "MG"
  },
  {
    id: "USR-106",
    name: "Mugisha Emanuel",
    email: "e.mugisha@agri.rw",
    role: "Transporter",
    district: "Musanze",
    status: "Verified",
    joinDate: "May 08, 2024",
    initials: "EM"
  },
  {
    id: "USR-107",
    name: "Kambanda Jean",
    email: "jean.k@farm.rw",
    role: "Farmer",
    district: "Rubavu",
    status: "Verified",
    joinDate: "Apr 29, 2024",
    initials: "JK"
  }
];

export const initialVehicles: Vehicle[] = [
  {
    id: "TRK-882",
    type: "truck",
    plateNumber: "RAE 882 A",
    capacityKg: 5000,
    insurancePolicy: "Radiant Insurance - POL-987882",
    districts: ["Kigali City (All Districts)", "Musanze", "Rubavu"],
    status: "In Transit",
    photoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdILuYRP3-rBhY1Ku4rOEmyCpoVwigwFfmrKKtBmmqcjO9lfOqtb9Dow1ewPbsIabzSHv47mlDfr2x3LFsqisUBc5k-eQhcZFiWAPakdtpwesqoSFF2xei17k0MvkND69ahcyl587DwpksOCtQ9l_sdu5D1oFu48lOtXDhthMrHkTIsplQMjYCF4kH6-PtMMKywF5iKoTNHx_55bFJsQPfo0s4F8HLY2fdkBVbl57oTDB-Qx-RGZgegCvc2DF2bSff_FZgDRgsCyU"
  },
  {
    id: "MTC-310",
    type: "motorcycle",
    plateNumber: "RDG 310 K",
    capacityKg: 150,
    insurancePolicy: "Sonarwa - POL-654321",
    districts: ["Kigali City (All Districts)"],
    status: "Active"
  },
  {
    id: "PKP-512",
    type: "pickup",
    plateNumber: "RAC 512 T",
    capacityKg: 1200,
    insurancePolicy: "Radiant Insurance - POL-771239",
    districts: ["Kigali City (All Districts)", "Huye"],
    status: "Active"
  },
  {
    id: "CLD-104",
    type: "cold_storage",
    plateNumber: "RAF 104 C",
    capacityKg: 4000,
    insurancePolicy: "Radiant Insurance - POL-114490",
    districts: ["Kigali City (All Districts)", "Musanze", "Nyagatare"],
    status: "Active"
  }
];

export const initialRequests: TransportRequest[] = [
  {
    id: "REQ-01",
    cropType: "Maize",
    cropIcon: "grain",
    weightTons: 5.4,
    origin: "Musanze",
    destination: "Kigali Hub",
    customerName: "Kirehe Farmers Co-op",
    status: "Incoming",
    distanceKm: 94,
    estimatedPriceRwf: 2450000,
    urgency: "Immediate",
    timeRequired: "4h 20m",
    isUrgent: true,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLoiuGLUaq3WApX3I-Jsikq-UvLWraqRrbBWK2jZFW6Sv3x8B5gUCkT1wDh3EYtU9tP9FDCep966H1y7aS4nAb1Gzez7XC9DudU1HroKHQVzWmSSW-CkMi6CVhIBvoFO3fzhY5vRZg4VEi_uVIK0ZRx2ZmnjccJwTm-s0G8BvcmQksSseUq-_Tt76R2oJuF_FGNu8KtAlRus__Lhr1nk5leCmc7MGlgoB7PENz0Lk_cudJPzwqVKVkbtb63OGoQdCZ-K1H53pb_H8"
  },
  {
    id: "REQ-02",
    cropType: "Beans",
    cropIcon: "eco",
    weightTons: 2.8,
    origin: "Nyagatare",
    destination: "Kayonza",
    customerName: "Nyagatare Grains Ltd",
    status: "Incoming",
    distanceKm: 62,
    estimatedPriceRwf: 1200000,
    urgency: "48 Hours",
    timeRequired: "1h 45m",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsaVNf-WcHMzvmSEMHpKJxrbm2UFPb9ogRsFuHpY-Je6D55j056CjHf5DxiSUG6fcOwhQR06KygwodmvNroHEtCDkTtbri4WEHnK3br4p_tKv6W4NZc6KBHW58JfYbxEyG4Y5df7VVNLTCC0u3bFvv3B2hhVZOuiAZWYdr-wFMZMyO5aJA2kyXUN5whYaiKYot5UYQTASzOJ5VyxihC8ox50JN7yDiqklGaEJGj-kf3DJcoXVJdAmsOSd47MEwh1WbkExnr6pwgqE"
  },
  {
    id: "REQ-03",
    cropType: "Coffee",
    cropIcon: "coffee",
    weightTons: 4.2,
    origin: "Rubavu",
    destination: "Magerwa",
    customerName: "Rubavu Washing Station",
    status: "Incoming",
    distanceKm: 152,
    estimatedPriceRwf: 3800000,
    urgency: "Flexible",
    timeRequired: "Insured Load",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_Dd-us2tMNtrNbGXuMjYdXyh1WmpUflLrVzmggopyAr7KtprOg1F28z1YtoNvSjg138_AfFhU7Xw6sAldk5DNUQxCO73xJxB9quUX9EBK7_AOb4s7eDu3hkmAbMfluW__Eg3XIdnAajbvzYQ8mR2OB9ikwtlUDehY5p6s3HD9FQr3UB8bIheMM-EEIQL55EsE-BbEj_YrKNxJ5CAxB8ps6U0rCSDWkp7pO7iNT14WKWCEwPRMn4DA5pTdQwcGcAMedx0JSS-X-lE"
  }
];

export const initialTracking: DispatchTracking = {
  id: "DSP-9921",
  orderId: "#AT-9921",
  customerName: "Kigali Luxury Exports Ltd.",
  cropType: "Arabica Coffee",
  weightTons: 4.2,
  origin: "Main Hub, Kacyiru District",
  destination: "Rwanda-East Route",
  driverName: "Emanuel Mugisha",
  driverAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7iT-V7Y_KXk7soHAnEw6ouw3V-RXe16gXGUbUVRqsaYDJER_PAISnY8wPm9wTnTbjJ-jRHYkdmFgcHkjue9DI61_H9btyGsl2dHwa2vRX2fKexgepF6drloi9HzgRuBhWGK_Qz55vP5fwZf3UtDtYhq8MDRP1mFwFBNKSUgahQzR8wdEEM-MvxqlAsYltwsk5uhySMjegjkawdyC1U_RTEL7VwW38CEvmBWMrI9_f3U3UVUVj-8qk3PUSrg5Xl8YHWKhNCxh2crk",
  vehicleInfo: "TRK-882 (Hino 500)",
  avgSpeed: 54,
  cargoTemp: 18.5,
  fuelEfficiency: 8.2,
  remainingKm: 42.8,
  eta: "02:45 PM",
  etaStatus: "On Time",
  status: "In Transit",
  history: {
    collectedTime: "08:30 AM",
    inTransitTime: "Active Now",
    nearHubTime: "Est. 12:45 PM",
    deliveredTime: "Est. 02:15 PM"
  }
};

export const initialConfig: PlatformConfig = {
  commissionPercent: 12.5,
  logisticsSurchargeRwf: 1500,
  grades: [
    {
      id: "GRD-01",
      name: "Export Grade Coffee",
      code: "PREMIUM A+",
      description: "Moisture content < 12%, uniform size, zero primary defects, vibrant acidity profile.",
      hubsCount: 12,
      usageDetails: "Used by 12 Hubs"
    },
    {
      id: "GRD-02",
      name: "Regional Distribution",
      code: "MARKET GRADE",
      description: "Moisture content 12-14%, standard sizing, minimal secondary defects allowed.",
      hubsCount: 45,
      usageDetails: "Used by 45 Hubs"
    }
  ],
  crops: [
    { id: "CRP-01", name: "Arabica Coffee", type: "coffee", sharePercent: 64 },
    { id: "CRP-02", name: "Orthodox Tea", type: "tea", sharePercent: 18 },
    { id: "CRP-03", name: "High-Zinc Maize", type: "maize", sharePercent: 12 },
    { id: "CRP-04", name: "Macadamia", type: "macadamia", sharePercent: 5 },
    { id: "CRP-05", name: "Chilli Peppers", type: "peppers", sharePercent: 1 }
  ],
  templates: [
    {
      id: "TMP-01",
      title: "Dispatch Confirmation",
      type: "SMS",
      body: "Hello {{farmer_name}}, your {{crop_type}} shipment #{{id}} has been dispatched to {{hub_name}}. Track here: {{link}}.",
      status: "Active",
      icon: "truck"
    },
    {
      id: "TMP-02",
      title: "Quality Certificate Issued",
      type: "SMS",
      body: "AgriTrans: Your crop has been graded as {{grade}}. Final pricing: {{amount}} RWF. Total net of fees.",
      status: "Active",
      icon: "verified"
    },
    {
      id: "TMP-03",
      title: "Weather Delay Warning",
      type: "SMS",
      body: "Transport delay for {{region}} due to adverse weather. We will update you in {{time_estimate}}.",
      status: "Active",
      icon: "warning"
    }
  ]
};

export const initialTransactions: Transaction[] = [
  {
    id: "#MVN-8821",
    date: "Oct 24, 09:12 AM",
    farmerName: "K. Uwase",
    buyerName: "Kigali Roasters",
    cropName: "Highland Arabica",
    weightDescription: "450kg",
    orderValueRwf: 1200000,
    commissionRwf: 36000,
    status: "Settled",
    farmerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyhVfqmEJfaPzW7VAXEPoHLCxEI9aa57lHwqRPaYnrTSh2oBGM0SGfzMJFOwB1PX6kZM5P90cpPiMkc2MnjNsz0aZNwAM8xp9By2CsOagxvUE_tkOzmtKLfIx4KFGFLQtt7eDYP8sVXRStOSgEVThGq6JwNuyWnarn3k4vtLa_PzzCfqy87ZaSpAR_48NcYc1juPuZPWI-4VdVzRcr2G6ApGKVcQEQY3-tXGyUZ195iPI6FzRlh54y6i7eev8ZGh9cnAW-nKW9sAo",
    buyerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB13rAtznTKSSq27JNdtmDKJFg4NlNLayXiRRKzUBe2XJZ7Gh6EDQPfWtVmYejyZ90x_G3oz1wThgFk0NApuiJv0ObTCTkI7gv5N8KlMTYhuWfN2IIL44Nx2DDmgS1NWs-3wmNdP71vUrk3WGAi0RefpiJzbVlvtckFst2-Bo3_SnYamKp92ZaR_OY4lbZVJN2_4VxrXX9aO91IjjuOJac_srWQUVruhrDxebq8VXYp_bTxhIqp2FxMPjFs6oiaB58Zj61s-7-D_5s"
  },
  {
    id: "#MVN-8794",
    date: "Oct 23, 14:45 PM",
    farmerName: "J. Musoni",
    buyerName: "Hillside Export",
    cropName: "Silver Needle Tea",
    weightDescription: "120kg",
    orderValueRwf: 850000,
    commissionRwf: 25500,
    status: "Processing",
    farmerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgOdsPfNoqNrpGA0C4DDzfjakdaetco6Gjn6649FFAqnKNrHd4AZdD7JQprXM_yq-C0T9DCYwmXyKZno2Jl3y2EZq43hThtOMLhhwwQtqz_GOJCrvUqQUqFVee9MLKTpdm2ExcIMdqoBVT0C0GtynM47c5Y86M7dlVpS1D-z91YL0fazGjAr5Z6Xk6nRW_hWh7P2qhudMyy-1ZLmyWGsQWeLOOX68o9IlhfgvdbVQ2eCz33e2-Ay0LZWlobU06ckVRuPWkWV6bx_g",
    buyerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUWYQZFs4-gB8Rv1SiH96kMuA6uvX2yRsJRPTlGFHvpsStChGR1yryHkmtpfcVWFjtHBzvvH2nJR2tYcz8DwIHQa9Fx0y6dsAitPmCcSPsHFzACC7bydDfrPTcFqTm3JtUEABdgd2ziegEgxNVCnIDr7YYZJ-diHDRCohhSjnrhjeysgyob52CGPdUJ0xglKL7Flk75wMFSi7kSKX6f6AfQej178XBGi0kKJKY9dkEanKx7962vguS8PSxdkJcSVG3ua-VH53czJY"
  },
  {
    id: "#MVN-8750",
    date: "Oct 22, 11:20 AM",
    farmerName: "M. Gakire",
    buyerName: "Global Grains Co.",
    cropName: "Organic Soybeans",
    weightDescription: "1.2 Tons",
    orderValueRwf: 3420000,
    commissionRwf: 102600,
    status: "Settled",
    farmerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkCuTTZM8rfutqTx6ii4T5xPiCRDW-34GHlDE5OVwi-8oCBXNKY_Izdp5yxkaXRH29BlqKrt7gxYsb2Lx4V3HlY7xOY8Ke2kSjfzKW4sI-idak72YreR4AIOA-1cEtEQI1yTlRrnrhZJyWF80X7M0NAAOSSHCM0_-_jDczVLy1tds-_DpT7IktDwohs_NDDs1RsY8hE5zgV_HILKefs__N3sAzD6yJ28rX4FYTaT2zJbHfp3Dcg6F5R4yt1KujTy8bn3asY4GLdwU",
    buyerAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNFOHTOMm-hww3aHw0UaPaTiGBvGxfTwgtVlBcdmJ3XHkL70mdGr9amfCVIBLHDq2AjpNZLIM7df-eeTdC7c3fId4D_h7l0PMT2Dqcc8p66xjuS1ElzfgPEjF1RK1tVbz2XEinJ2QLREWOaN-7QKFDb6GAQwvF6JHzSCFuMPjZJUjxYt3u_MKZ0rEq6CxTnjLiaNOZoeaWw2PEULscsoI-LdBmjkxLefEgri08GT7xYcUCtX_9ubDC2otd_L5ZJhecSmCEGR7AWMM"
  }
];
