import { KeyFile } from "./KeyFileModel";
export default class KeyFileLogic {
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
