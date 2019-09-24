interface Entry {
    entryName: string;
    loginName: string;
    link: string;
    tags: string[];
}
interface DecryptedEntry extends Entry {
    password: string;
    description: string;
}
interface EncryptedEntry extends Entry {
    id: string;
    encryptedPassword: string;
    encryptedDescription: string;
}
declare class Board {
    name: string;
    publicKey: string;
    encryptedPrivateKey: string;
    entries: EncryptedEntry[];
    private static generateKeyPair;
    static create(boardName: string, password: string): Promise<Board>;
    private decryptedPrivateKey;
    isLocked: boolean;
    constructor(name: string, publicKey: string, encryptedPrivateKey: string, entries: EncryptedEntry[]);
    private randomString;
    addEntry({ entryName, loginName, password, description, link, tags }: DecryptedEntry): Promise<void>;
    updateEntry(entryId: string, { entryName, loginName, password, description, link, tags }: DecryptedEntry): Promise<void>;
    unlockBoardByPrivateKey(decrypetedPrivateKey: string): void;
    unlockBoardByPassword(password: string): Promise<void>;
    unlockAllAccessableBoards(boards: Board[]): Promise<void>;
    _unlockAllAccessableBoards(boards: Board[], unlockingBoards?: Board[]): Promise<void>;
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
    shareBoardKey(destinationBoard: Board): Promise<void>;
    toJSON(): {
        name: string;
        publicKey: string;
        encryptedPrivateKey: string;
        entries: EncryptedEntry[];
    };
}
export { Board };
