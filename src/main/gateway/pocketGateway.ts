import IPocketGateway from "../interface/IPocketGateway";
import { PocketArticle } from "../model/pocketArticle";

export default class PocketGateway implements IPocketGateway {
    public retrieve(): Promise<PocketArticle[]> {
        return new Promise<PocketArticle[]>((resolve, reject) => {
            resolve([]);
        });
    }
}
