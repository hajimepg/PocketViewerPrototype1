import { PocketArticle } from "../model/pocketArticle";

export default interface IPocketGateway {
    retrieve(): Promise<PocketArticle[]>;
}
