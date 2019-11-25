interface KeyListener {
    func: (event: KeyboardEvent) => void;
    key: string;
}
export default class KeyListenerSerivce {
    private keyListenerList;
    constructor();
    register(keyListener: KeyListener): () => void;
    unregister(keyListener: KeyListener): void;
}
export {};
