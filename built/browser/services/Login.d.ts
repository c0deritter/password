import { KeyFile } from '../../KeyFileModel';
export default class LoginService {
    readonly keyFilesUrl = "/keyFile";
    get isLoggedIn(): boolean;
    keyFile: KeyFile | null;
    loadingSubscriber: ((loading: boolean) => void)[];
    login(keyFileName: string, password: string): Promise<boolean>;
    private getKeyFile;
    subscribeOnLoading(callback: (loading: boolean) => void): void;
    private loading;
    private finishedLoading;
}
