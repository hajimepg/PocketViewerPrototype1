import "reflect-metadata";

import axios from "axios";
import { injectable } from "inversify";

import IPocketGateway from "../interface/IPocketGateway";
import { PocketArticle } from "../model/pocketArticle";

import { sanitize } from "../pocketArticleSanitizer";

@injectable()
export default class PocketGateway implements IPocketGateway {
    public constructor(public consumerKey: string) {
    }

    public retrieve(accessToken: string): Promise<PocketArticle[]> {
        return new Promise<PocketArticle[]>((resolve, reject) => {
            axios.post("https://getpocket.com/v3/get",
                    {
                        access_token: accessToken,
                        consumer_key: this.consumerKey,
                    },
                    {
                        headers: { "Content-Type": "application/json" }
                    }
                )
                .then((response) => {
                    const rawArticles = Object.values(response.data.list);
                    const saniziedArticles: PocketArticle[] = rawArticles.map(sanitize);

                    resolve(saniziedArticles);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
}
