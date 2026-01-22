
export enum ServiceType {
  CORTE_COSTAL = 'corte costal',
  CORTE_TRATOR = 'corte com trator',
  CAPINA_MANUAL = 'capina manual',
  CAPINA_MECANIZADA = 'capina mecanizada',
  VARRICAO = 'varrição'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATIONAL = 'OPERATIONAL'
}

export interface Area {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  startReference: string;
  endReference: string;
  observations: string;
  services: Service[];
}

export interface Service {
  id: string;
  areaId: string;
  type: ServiceType;
  areaM2: number;
  unitValue: number;
  totalValue: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
}

export interface ProductionRecord {
  id: string;
  employeeId: string;
  serviceId: string;
  associatedValue: number;
  date: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'peças' | 'insumos' | 'EPIs' | 'outros';
  currentQty: number;
  minQty: number;
  unitValue?: number;
}

export interface InventoryExit {
  id: string;
  itemId: string;
  quantity: number;
  date: string;
  destination: string;
  observation: string;
}

export interface CashIn {
  id: string;
  date: string;
  value: number;
  reference: string;
  type: string;
}

export interface CashOut {
  id: string;
  date: string;
  value: number;
  type: string;
  proofUrl?: string;
}

export interface AppState {
  areas: Area[];
  employees: Employee[];
  productionRecords: ProductionRecord[];
  inventory: InventoryItem[];
  inventoryExits: InventoryExit[];
  cashIn: CashIn[];
  cashOut: CashOut[];
  monthlyGoalM2: number;
}
