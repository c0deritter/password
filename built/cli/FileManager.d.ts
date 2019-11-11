import { KeyFile } from "../lib";
export default class FileManager {
    private dir;
    private readonly fileExtension;
    keyFiles: KeyFile[];
    constructor(dir: string);
    private getAllKeyFile;
    getKeyFile(keyFileName: string): KeyFile | undefined;
    isKeyFileExists(keyFileName: string): boolean;
    createKeyFile(keyFileName: string, password: string, isMasterManaged?: boolean): Promise<KeyFile>;
    saveKeyFile(keyfile: KeyFile): void;
}
