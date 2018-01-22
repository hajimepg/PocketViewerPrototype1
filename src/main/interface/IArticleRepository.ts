import Article from "../model/article";

export default interface IArticleRepository {
    insert(title: string, url: string, tags: string[], isUnread: boolean, isFavorite: boolean): Promise<Article>;
    update(article: Article): Promise<Article>;
    delete(article: Article): Promise<void>;
    findUnread(): Promise<Article[]>;
    findFavorite(): Promise<Article[]>;
    findArchive(): Promise<Article[]>;
    findByHost(host: string): Promise<Article[]>;
    findByTag(tag: string): Promise<Article[]>;
    findHosts(): Promise<string[]>;
    findTags(): Promise<string[]>;
}
