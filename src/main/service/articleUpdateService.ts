import { inject, injectable } from "inversify";

import { IArticleRepository } from "../interface/IArticleRepository";
import IPocketGateway from "../interface/IPocketGateway";
import TYPE from "../types";

@injectable()
export default class ArticleUpdateService {
    public constructor(
        @inject(TYPE.ArticleRepository) protected repository: IArticleRepository,
        @inject(TYPE.PocketGateway) protected gateway: IPocketGateway
    ) {
    }

    public update(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }
}
