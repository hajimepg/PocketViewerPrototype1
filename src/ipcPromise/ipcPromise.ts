import { ipcRenderer } from "electron";

const map = new Map<string, (payload: any) => void>();

let currntId = 1;

function generateId(): string {
    const id = currntId.toString();
    currntId++;
    return id;
}

function send(channel: string, payload: any): Promise<any> {
    const id = generateId();

    return new Promise((resolve, reject) => {
        map.set(id, resolve);
        ipcRenderer.send("promise-message", channel, id, payload);
    });
}

ipcRenderer.on("promise-message-reply", (event, channel, id, payload) => {
    const resolve = map.get(id);
    if (resolve === undefined) {
        return;
    }
    map.delete(id);
    resolve(payload);
});

export { send };
