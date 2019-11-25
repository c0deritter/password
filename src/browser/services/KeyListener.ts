interface KeyListener {
    func: (event: KeyboardEvent) => void
    key: string
}

export default class KeyListenerSerivce {
    private keyListenerList: KeyListener[] = []

    constructor() {
        document.addEventListener('keyup', (event) => {
            const matchedKeyListnerList = this.keyListenerList.filter((keyListener) => {
                return keyListener.key === event.key
            })

            if (matchedKeyListnerList.length > 0) {
                event.preventDefault()
            }

            matchedKeyListnerList.forEach((matchedKeyListner) => {
                matchedKeyListner.func(event)
            })
        })
    }

    public register(keyListener: KeyListener) {
        this.keyListenerList.push(keyListener)

        return () => {
            this.unregister(keyListener)
        }
    }

    public unregister(keyListener: KeyListener) {
        this.keyListenerList = this.keyListenerList.filter((keyListenerFromList) => {
            return keyListener !== keyListenerFromList
        })
    }
}