interface Entry {
    entryName: string;
    loginName: string;
    link: string;
    tags: string[];
}
export interface DecryptedEntry extends Entry {
    password: string;
    description: string;
}
export interface EncryptedEntry extends Entry {
    id: string;
    encryptedPassword: string;
    encryptedDescription: string;
}
export declare class KeyFile {
    name: string;
    publicKey: string;
    encryptedPrivateKey: string;
    entries: EncryptedEntry[];
    private static generateKeyPair;
    static create(keyFileName: string, password: string): Promise<KeyFile>;
    decryptedPrivateKey: string;
    isLocked: boolean;
    constructor(name: string, publicKey: string, encryptedPrivateKey: string, entries: EncryptedEntry[]);
    private randomString;
    addEntry({ entryName, loginName, password, description, link, tags }: DecryptedEntry): Promise<void>;
    updateEntry(entryId: string, { entryName, loginName, password, description, link, tags }: DecryptedEntry): Promise<void>;
    unlockKeyFileByPrivateKey(decrypetedPrivateKey: string): void;
    unlockKeyFileByPassword(password: string): Promise<void>;
    decryptEntry(entryId: string): Promise<{
        id: string;
        entryName: string;
        loginName: string;
        password: string;
        description: string;
        link: string;
        tags: string[];
    }>;
    private decrypt;
    updatePrivateKey(decryptedPrivateKey: string, password: string): Promise<void>;
    shareEntry(entryId: string, userSafe: KeyFile): Promise<void>;
    toJSON(): {
        name: string;
        publicKey: string;
        encryptedPrivateKey: string;
        entries: EncryptedEntry[];
    };
}
export {};
