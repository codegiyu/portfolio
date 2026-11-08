import { Timestamp } from 'firebase-admin/firestore';

type Data = Record<string, unknown>;

export class FakeSnapshot {
  constructor(private readonly value: Data | undefined) {}

  get exists(): boolean {
    return !!this.value;
  }

  data(): Data | undefined {
    return this.value;
  }
}

class FakeRef {
  constructor(
    readonly collectionName: string,
    readonly id: string,
    private readonly database: FakeDb
  ) {}

  async get(): Promise<FakeSnapshot> {
    return new FakeSnapshot(this.database.read(this.collectionName, this.id));
  }

  async create(data: Data): Promise<void> {
    if (this.database.read(this.collectionName, this.id)) throw new Error('already exists');
    this.database.write(this.collectionName, this.id, data);
  }

  async update(data: Data): Promise<void> {
    const existing = this.database.read(this.collectionName, this.id);
    if (!existing) throw new Error('missing');
    this.database.write(this.collectionName, this.id, { ...existing, ...data });
  }
}

class FakeTransaction {
  constructor(private readonly database: FakeDb) {}

  get(ref: FakeRef): Promise<FakeSnapshot> {
    return ref.get();
  }

  set(ref: FakeRef, data: Data, options?: { merge?: boolean }): void {
    const existing = this.database.read(ref['collectionName'], ref['id']);
    this.database.write(
      ref['collectionName'],
      ref['id'],
      options?.merge ? { ...existing, ...data } : data
    );
  }

  update(ref: FakeRef, data: Data): void {
    const existing = this.database.read(ref['collectionName'], ref['id']);
    if (!existing) throw new Error('missing');
    this.database.write(ref['collectionName'], ref['id'], { ...existing, ...data });
  }

  create(ref: FakeRef, data: Data): void {
    if (this.database.read(ref['collectionName'], ref['id'])) throw new Error('already exists');
    this.database.write(ref['collectionName'], ref['id'], data);
  }
}

export class FakeDb {
  private readonly values = new Map<string, Data>();
  private queue: Promise<unknown> = Promise.resolve();

  collection(name: string) {
    return {
      doc: (id: string) => new FakeRef(name, id, this.database),
    };
  }

  private get database(): FakeDb {
    return this;
  }

  read(collection: string, id: string): Data | undefined {
    return this.values.get(`${collection}/${id}`);
  }

  write(collection: string, id: string, data: Data): void {
    this.values.set(`${collection}/${id}`, { ...data });
  }

  async runTransaction<T>(callback: (transaction: FakeTransaction) => Promise<T>): Promise<T> {
    const result = this.queue.then(() => callback(new FakeTransaction(this)));
    this.queue = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  }

  hasRawValue(value: string): boolean {
    return [...this.values.values()].some(entry => JSON.stringify(entry).includes(value));
  }

  seed(collection: string, id: string, data: Data): void {
    this.write(collection, id, data);
  }

  static timestamp(ms: number): Timestamp {
    return Timestamp.fromMillis(ms);
  }
}
