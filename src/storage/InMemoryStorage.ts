import { IStorage } from './IStorage';

export class InMemoryStorage implements IStorage {

    private storage: Map<string, any> = new Map();

    private static instance: InMemoryStorage;

    static getInstance() {

        if (!this.instance) {
            return new InMemoryStorage();
        }

        return this.instance;
    }

    public async get(id: string): Promise<any> {
        return this.storage.get(id);
    }

    public async find(keyValues: any): Promise<any[]> {
        const result = [];

        for (const item of this.storage.values()) {
            let match = true;
            for (const key in keyValues) {
                if (keyValues[key] !== item[key]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                result.push(item);
            }
        }

        return result;
    }

    public async upsert(object: any): Promise<string> {
        this.storage.set(object.id, object);
        return object;
    }
}