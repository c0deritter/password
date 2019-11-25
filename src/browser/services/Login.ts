import axios from 'axios'
import { KeyFile } from '../../KeyFileModel'

export default class LoginService {
    public readonly keyFilesUrl = '/keyFile'
    public get isLoggedIn() {
        return this.keyFile == null ? false : true
    }
    public keyFile: KeyFile | null = null
    public loadingSubscriber: ((loading: boolean) => void)[] = []

    public async login(keyFileName: string, password: string): Promise<boolean> {
        await this.getKeyFile(keyFileName)

        if (!this.isLoggedIn) {
            return false
        }

        try {
            await this.keyFile!.unlockKeyFileByPassword(password)
        } catch(error) {
            if (error.message !== 'Incorrect key passphrase') {
                throw error
            }
            return false
        }

        return true
    }

    private async getKeyFile(keyFileName: string) {
        try {
            this.loading()
            this.keyFile = await axios.get<KeyFile>(`${ this.keyFilesUrl }/${ keyFileName }`)
            .then((response => response.data))
            .then((keyFile => new KeyFile(
                keyFile.name, keyFile.publicKey, keyFile.encryptedPrivateKey, keyFile.entries
            )))
        } catch {}
        finally {
            this.finishedLoading()
        }
    }

    public subscribeOnLoading(callback: (loading: boolean) => void) {
        this.loadingSubscriber.push(callback)
    }

    private loading() {
        this.loadingSubscriber.forEach((subscriber) => subscriber(true))
    }

    private finishedLoading() {
        this.loadingSubscriber.forEach((subscriber) => subscriber(false))
    }
}