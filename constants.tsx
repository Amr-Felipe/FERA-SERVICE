
import { AppState, ServiceType } from './types';

export const INITIAL_STATE: AppState = {
  areas: [
    {
      id: 'a1',
      name: 'Avenida Principal',
      startDate: '2024-03-01',
      startReference: 'Km 0',
      endReference: 'Km 10',
      observations: 'Trecho de alta visibilidade',
      services: [
        {
          id: 's1',
          areaId: 'a1',
          type: ServiceType.CORTE_TRATOR,
          areaM2: 5000,
          unitValue: 1.5,
          totalValue: 7500
        }
      ]
    }
  ],
  employees: [
    { id: 'e1', name: 'João Silva', role: 'Operador de Roçadeira', status: 'active' },
    { id: 'e2', name: 'Maria Santos', role: 'Ajudante Geral', status: 'active' }
  ],
  productionRecords: [],
  inventory: [
    { id: 'i1', name: 'Fio de Nylon', category: 'insumos', currentQty: 10, minQty: 5, unitValue: 45.0 },
    { id: 'i2', name: 'Óleo 2T', category: 'insumos', currentQty: 3, minQty: 10, unitValue: 35.0 }
  ],
  inventoryExits: [],
  cashIn: [
    { id: 'c1', date: '2024-03-05', value: 15000, reference: 'Fatura Fevereiro', type: '1ª parcela' }
  ],
  cashOut: [
    { id: 'o1', date: '2024-03-02', value: 2000, type: 'Pagamento Funcionários' }
  ],
  monthlyGoalM2: 50000
};

export const SERVICE_OPTIONS = Object.values(ServiceType);
