import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react';
import {
  initialUsers,
  initialVehicles,
  initialRequests,
  initialTracking,
  initialConfig,
  initialTransactions,
} from '@/lib/seed';
import type {
  User,
  Vehicle,
  TransportRequest,
  DispatchTracking,
  PlatformConfig,
  Transaction,
} from '@/lib/types';

export interface AppState {
  users: User[];
  vehicles: Vehicle[];
  requests: TransportRequest[];
  tracking: DispatchTracking;
  config: PlatformConfig;
  transactions: Transaction[];
}

type AppAction =
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER_STATUS'; id: string; status: User['status'] }
  | { type: 'DELETE_USER'; id: string }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'UPDATE_VEHICLE_STATUS'; id: string; status: Vehicle['status'] }
  | { type: 'ACCEPT_REQUEST'; req: TransportRequest; rate: number }
  | { type: 'DECLINE_REQUEST'; id: string }
  | { type: 'UPDATE_TRACKING_STATUS'; status: DispatchTracking['status'] }
  | { type: 'UPDATE_TELEMETRY'; speed: number; temp: number; remainingKm: number }
  | { type: 'UPDATE_COMMISSION'; rate: number }
  | { type: 'ADD_GRADE'; grade: PlatformConfig['grades'][number] }
  | { type: 'ADD_CROP'; crop: PlatformConfig['crops'][number] };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_USER':
      return { ...state, users: [action.payload, ...state.users] };
    case 'UPDATE_USER_STATUS':
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.id ? { ...u, status: action.status } : u,
        ),
      };
    case 'DELETE_USER':
      return { ...state, users: state.users.filter((u) => u.id !== action.id) };
    case 'ADD_VEHICLE':
      return { ...state, vehicles: [action.payload, ...state.vehicles] };
    case 'UPDATE_VEHICLE_STATUS':
      return {
        ...state,
        vehicles: state.vehicles.map((v) =>
          v.id === action.id ? { ...v, status: action.status } : v,
        ),
      };
    case 'DECLINE_REQUEST':
      return {
        ...state,
        requests: state.requests.filter((item) => item.id !== action.id),
      };
    case 'ACCEPT_REQUEST': {
      const { req, rate } = action;
      const newTxId = `#MVN-${Math.floor(8000 + Math.random() * 1000)}`;
      const systemCommission = Math.floor(
        rate * (state.config.commissionPercent / 100),
      );
      const newTx: Transaction = {
        id: newTxId,
        date:
          new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }) + ', Today',
        farmerName: req.customerName
          .replace(' Co-op', '')
          .replace(' Ltd', '')
          .substring(0, 10),
        buyerName: 'Kigali Roasters Hub',
        cropName: req.cropType,
        weightDescription: `${req.weightTons} Tons`,
        orderValueRwf: rate,
        commissionRwf: systemCommission,
        status: 'Processing',
      };
      return {
        ...state,
        requests: state.requests.filter((item) => item.id !== req.id),
        transactions: [newTx, ...state.transactions],
        tracking: {
          ...state.tracking,
          orderId: `#AT-${req.id.split('-')[1] || '94'}${Math.floor(Math.random() * 10)}`,
          customerName: req.customerName,
          cropType: req.cropType,
          weightTons: req.weightTons,
          origin: req.origin,
          destination: req.destination,
          remainingKm: req.distanceKm,
          status: 'Collected',
          eta: 'Est. 3 Hours',
          etaStatus: 'On Time',
        },
      };
    }
    case 'UPDATE_TRACKING_STATUS': {
      const nextStatus = action.status;
      const nextTracking: DispatchTracking = {
        ...state.tracking,
        status: nextStatus,
        ...(nextStatus === 'Delivered'
          ? { remainingKm: 0, etaStatus: 'On Time' as const, eta: 'Arrived' }
          : {}),
      };
      const nextTransactions =
        nextStatus === 'Delivered'
          ? state.transactions.map((t) =>
              t.cropName === state.tracking.cropType
                ? { ...t, status: 'Settled' as const }
                : t,
            )
          : state.transactions;
      return {
        ...state,
        tracking: nextTracking,
        transactions: nextTransactions,
      };
    }
    case 'UPDATE_TELEMETRY':
      return {
        ...state,
        tracking: {
          ...state.tracking,
          avgSpeed: action.speed,
          cargoTemp: action.temp,
          remainingKm: action.remainingKm,
        },
      };
    case 'UPDATE_COMMISSION':
      return {
        ...state,
        config: { ...state.config, commissionPercent: action.rate },
        transactions: state.transactions.map((t) =>
          t.status === 'Processing'
            ? {
                ...t,
                commissionRwf: Math.floor(
                  t.orderValueRwf * (action.rate / 100),
                ),
              }
            : t,
        ),
      };
    case 'ADD_GRADE':
      return {
        ...state,
        config: {
          ...state.config,
          grades: [action.grade, ...state.config.grades],
        },
      };
    case 'ADD_CROP':
      return {
        ...state,
        config: {
          ...state.config,
          crops: [...state.config.crops, action.crop],
        },
      };
    default:
      return state;
  }
}

const initialState: AppState = {
  users: initialUsers,
  vehicles: initialVehicles,
  requests: initialRequests,
  tracking: initialTracking,
  config: initialConfig,
  transactions: initialTransactions,
};

interface AppContextValue {
  state: AppState;
  addUser: (user: User) => void;
  updateUserStatus: (id: string, status: User['status']) => void;
  deleteUser: (id: string) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicleStatus: (id: string, status: Vehicle['status']) => void;
  acceptRequest: (req: TransportRequest, rate: number) => void;
  declineRequest: (id: string) => void;
  updateTrackingStatus: (status: DispatchTracking['status']) => void;
  updateTelemetry: (speed: number, temp: number, remainingKm: number) => void;
  updateCommission: (rate: number) => void;
  addGrade: (grade: PlatformConfig['grades'][number]) => void;
  addCrop: (crop: PlatformConfig['crops'][number]) => void;
  unverifiedCount: number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value: AppContextValue = {
    state,
    addUser: (user) => dispatch({ type: 'ADD_USER', payload: user }),
    updateUserStatus: (id, status) =>
      dispatch({ type: 'UPDATE_USER_STATUS', id, status }),
    deleteUser: (id) => dispatch({ type: 'DELETE_USER', id }),
    addVehicle: (vehicle) =>
      dispatch({ type: 'ADD_VEHICLE', payload: vehicle }),
    updateVehicleStatus: (id, status) =>
      dispatch({ type: 'UPDATE_VEHICLE_STATUS', id, status }),
    acceptRequest: (req, rate) =>
      dispatch({ type: 'ACCEPT_REQUEST', req, rate }),
    declineRequest: (id) => dispatch({ type: 'DECLINE_REQUEST', id }),
    updateTrackingStatus: (status) =>
      dispatch({ type: 'UPDATE_TRACKING_STATUS', status }),
    updateTelemetry: (speed, temp, remainingKm) =>
      dispatch({ type: 'UPDATE_TELEMETRY', speed, temp, remainingKm }),
    updateCommission: (rate) =>
      dispatch({ type: 'UPDATE_COMMISSION', rate }),
    addGrade: (grade) => dispatch({ type: 'ADD_GRADE', grade }),
    addCrop: (crop) => dispatch({ type: 'ADD_CROP', crop }),
    unverifiedCount: state.users.filter((u) => u.status === 'Pending').length,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return ctx;
}
