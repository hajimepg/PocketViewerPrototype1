import { ipcMain } from "electron";

class IPCPromiseReceiver {
    protected listeners = new Map<string, (payload: any, callback: (result: any) => void) => void>();

    public constructor() {
        ipcMain.on("promise-message", (event: any, channel: string, id: string, payload: any) => {
            const listener = this.listeners.get(channel);
            if (listener === undefined) {
                return;
            }

            listener(payload, (result) => {
                event.sender.send("promise-message-reply", channel, id, result);
            });
        });
    }

    public on(channel: string, listener: (payload: any, callback: (result: any) => void) => void) {
        this.listeners.set(channel, listener);
    }
}

export default IPCPromiseReceiver;
