import { PocketArticle } from "../model/pocketArticle";

export default interface IPocketGateway {
    retrieve(accessToken: string): Promise<PocketArticle[]>;
}
