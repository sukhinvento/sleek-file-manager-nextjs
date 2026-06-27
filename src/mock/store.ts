// In-memory store — single source of truth for all mock data
// Each entity is stored as a Map<id, record>

export type StoreRecord = Record<string, any>;

class Collection<T extends StoreRecord> {
  private data = new Map<string, T>();

  seed(records: T[]) {
    for (const r of records) this.data.set(r._id || r.id, r);
  }

  findAll(): T[] {
    return Array.from(this.data.values());
  }

  findById(id: string): T | undefined {
    return this.data.get(id);
  }

  insert(record: T): T {
    this.data.set(record._id || record.id, record);
    return record;
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const existing = this.data.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.data.set(id, updated);
    return updated;
  }

  remove(id: string): boolean {
    return this.data.delete(id);
  }

  count(): number {
    return this.data.size;
  }
}

export const store = {
  vendors:            new Collection<StoreRecord>(),
  inventory:          new Collection<StoreRecord>(),
  purchaseOrders:     new Collection<StoreRecord>(),
  salesOrders:        new Collection<StoreRecord>(),
  patients:           new Collection<StoreRecord>(),
  doctors:            new Collection<StoreRecord>(),
  diagnosticTests:    new Collection<StoreRecord>(),
  diagnosticBookings: new Collection<StoreRecord>(),
  admissions:         new Collection<StoreRecord>(),
  rooms:              new Collection<StoreRecord>(),
  locations:          new Collection<StoreRecord>(),
  departments:        new Collection<StoreRecord>(),
  taxSlabs:           new Collection<StoreRecord>(),
  invoices:           new Collection<StoreRecord>(),
  accounts:           new Collection<StoreRecord>(),
  journalEntries:     new Collection<StoreRecord>(),
  stockTransfers:     new Collection<StoreRecord>(),
  users:              new Collection<StoreRecord>(),
  notifications:      new Collection<StoreRecord>(),
  bankAccounts:       new Collection<StoreRecord>(),
  medications:        new Collection<StoreRecord>(),
  prescriptions:      new Collection<StoreRecord>(),
  opdVisits:          new Collection<StoreRecord>(),
  fixedAssets:        new Collection<StoreRecord>(),
  payrollEmployees:   new Collection<StoreRecord>(),
  payrollRuns:        new Collection<StoreRecord>(),
};

export type Store = typeof store;
