import "reflect-metadata";

import { injectable } from "inversify";

import IPocketGateway from "../interface/IPocketGateway";
import { PocketArticle } from "../model/pocketArticle";

@injectable()
export default class PocketGateway implements IPocketGateway {
    public retrieve(): Promise<PocketArticle[]> {
        return new Promise<PocketArticle[]>((resolve, reject) => {
            resolve([]);
        });
    }
}
