declare namespace keyboard {
    interface Entry {
        id?: string,
        entryName: string, 
        loginName: string,
        link: string,
        tags: string[]
    }

    interface DecryptedEntry extends Entry {
        password: string
        description: string
    }

    interface EncryptedEntry extends Entry {
        encryptedPassword: string,
        encryptedDescription: string
    }

    interface GroupEntries extends Array <{
        boardName: string,
        entries: DecryptedEntry[]
    }> {}

    class Board {
        private static generateKeyPair(password: string): { publicKeyArmored: string, privateKeyArmored: string }
        public static create(boardName: string, password: string): Promise<Board>

        constructor(boardName: string, publicKey: string, privateKey: string, entries: EncryptedEntry[])
        private randomString(length: string): string
        public addEntry(entry: DecryptedEntry): Promise<void>
        public updateEntry(entryId: string, entry: DecryptedEntry): void
        public getAllAccessableEntries(boards: Board[], password: string): GroupEntries
        private decryptAllAccessableEntries(boards: Board[], decryptedPrivateKey: string, groupEntries?: GroupEntries): Promise<GroupEntries>
        private decryptEntry(privateKey: string, entry: EncryptedEntry): Promise<DecryptedEntry>
        private decryptPrivateKey(password: string): Promise<string>
        private decrypt(privateKey: string, encrypted: string): Promise<string>
        private shareBoardKey(password: string, destinationBoard: Board): Promise<void>
    }
}

export = keyboard