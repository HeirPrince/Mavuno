import type { UserRole } from '@/lib/roles';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | 'Transporter';
  district: string;
  status: 'Verified' | 'Pending' | 'Flagged' | 'Suspended';
  joinDate: string;
  avatarUrl?: string;
  initials: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'In Transit'
  | 'Delivered'
  | 'Completed';

export interface ProduceListing {
  id: string;
  farmerId: string;
  cropName: string;
  quantityKg: number;
  qualityGrade: string;
  pricePerKgRwf: number;
  harvestDate: string;
  images: string[];
  status: 'active' | 'archived' | 'sold';
  location: string;
}

export interface Order {
  id: string;
  orderRef: string;
  buyerId: string;
  listingId: string;
  farmerId: string;
  quantityKg: number;
  totalRwf: number;
  status: OrderStatus;
  deliveryType: 'pickup' | 'delivery';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'New Order' | 'Order Accepted' | 'Delivery Update' | 'Market Alert' | 'Weather Alert';
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  type: 'motorcycle' | 'pickup' | 'truck' | 'cold_storage';
  plateNumber: string;
  capacityKg: number;
  insurancePolicy: string;
  districts: string[];
  photoUrl?: string;
  insurancePhotoUrl?: string;
  status: 'Active' | 'Pending' | 'In Transit';
}

export interface TransportRequest {
  id: string;
  cropType: string;
  cropIcon: string;
  weightTons: number;
  origin: string;
  destination: string;
  customerName: string;
  status: 'Incoming' | 'Negotiation' | 'Accepted' | 'Declined';
  distanceKm: number;
  estimatedPriceRwf: number;
  urgency: 'Immediate' | '48 Hours' | 'Flexible';
  timeRequired: string;
  imageUrl?: string;
  isUrgent?: boolean;
}

export interface DispatchTracking {
  id: string;
  orderId: string;
  customerName: string;
  cropType: string;
  weightTons: number;
  origin: string;
  destination: string;
  driverName: string;
  driverAvatar: string;
  vehicleInfo: string;
  avgSpeed: number;
  cargoTemp: number;
  fuelEfficiency: number;
  remainingKm: number;
  eta: string;
  etaStatus: 'On Time' | 'Delayed';
  status: 'Collected' | 'In Transit' | 'Near Hub' | 'Delivered';
  history: {
    collectedTime: string;
    inTransitTime: string;
    nearHubTime: string;
    deliveredTime: string;
  };
}

export interface PlatformConfig {
  commissionPercent: number;
  logisticsSurchargeRwf: number;
  grades: {
    id: string;
    name: string;
    code: string;
    description: string;
    hubsCount: number;
    usageDetails: string;
  }[];
  crops: {
    id: string;
    name: string;
    type: 'coffee' | 'tea' | 'maize' | 'macadamia' | 'peppers';
    sharePercent: number;
  }[];
  templates: {
    id: string;
    title: string;
    type: 'SMS' | 'Email';
    body: string;
    status: 'Active' | 'Inactive';
    icon: string;
  }[];
}

export interface Transaction {
  id: string;
  date: string;
  farmerName: string;
  buyerName: string;
  cropName: string;
  weightDescription: string;
  orderValueRwf: number;
  commissionRwf: number;
  status: 'Settled' | 'Processing' | 'Failed';
  farmerAvatar?: string;
  buyerAvatar?: string;
}

export interface AuditMetrics {
  totalUsers: number;
  pendingUsers: number;
  farmerCount: number;
  openRequests: number;
  commissionPercent: number;
  processingTransactions: number;
  settledTransactions: number;
  activeTrackingStatus: string;
  remainingKm: number;
}
