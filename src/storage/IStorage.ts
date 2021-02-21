export interface IStorage {
    get(id: string): Promise<any>;
    find(keyValues: any): Promise<any[]>;
    upsert(object: any): Promise<string>;
}



