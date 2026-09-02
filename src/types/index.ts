export type Crop = "Paddy" | "Wheat" | "Maize" | "Chana" | "Mustard" | "Cotton" | "Potato" | "Onion";

export type Role = "Farmer" | "CentreManager" | "DistrictOfficer" | "GateGuard" | "QualityLab";

export type ProcurementStatus = 
  | "BOOKED" 
  | "ARRIVED" 
  | "CHECKED_IN" 
  | "WAITING" 
  | "PROCESSING"
  | "READY_FOR_QC"
  | "QUALITY_CHECK" 
  | "WEIGHMENT" 
  | "PROCUREMENT_ACCEPTED" 
  | "PROCUREMENT_REJECTED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_COMPLETED"
  | "TRANSPORTING"
  | "COMPLETED";

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  password?: string;
  village: string;
  landRegistered: boolean;
  eligibleQuantity: number; // in quintals
}

export interface CentreResource {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "OFFLINE";
  currentTokenId?: string; // Token currently being served
}

export interface ProcurementCentre {
  id: string;
  name: string;
  location: string;
  distance: string; // e.g. "12 km"
  baseProcessingSpeed: number; // minutes per farmer
  counters: CentreResource[];
}

export interface Booking {
  id: string;
  farmerId: string;
  centreId: string;
  crop: Crop;
  date: string;
  timeSlot: string;
  estimatedQuantity: number;
}

export interface Token {
  id: string;
  bookingId: string;
  number: string; // e.g. "WHT-C01-245"
  status: ProcurementStatus;
  checkInTime?: string;
  quality?: QualityCheck;
  weighment?: Weighment;
  payment?: Payment;
  logistics?: Logistics;
}

export interface QueueEntry {
  tokenId: string;
  farmerName: string;
  crop: Crop;
  quantity: number;
  joinedAt: string;
  estimatedWaitTime: number; // in minutes
  position: number;
  status: ProcurementStatus;
  assignedCounterId?: string;
}

export interface QualityCheck {
  moisture: number; // percentage
  grade: "A" | "B" | "C" | "REJECTED";
  isAcceptable: boolean;
  remarks?: string;
}

export interface Weighment {
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  mspRate: number; // per quintal
}

export interface Deduction {
  reason: string;
  amount: number;
}

export interface Payment {
  grossAmount: number;
  deductions: Deduction[];
  netAmount: number;
  status: "PENDING" | "INITIATED" | "COMPLETED";
  transactionId?: string;
}

export interface Logistics {
  truckNumber: string;
  destination: string;
  status: "LOADING" | "TRANSPORTING" | "DELIVERED";
  expectedArrival?: string;
}

export interface AuditLogEntry {
  id: string;
  tokenId: string;
  timestamp: string;
  action: string;
  actorRole: Role;
  actorName: string;
}
