export default class Article {
    public constructor(
        public readonly id: string,
        public title: string,
        public url: string,
        public host: string,
        public tags: string[],
        public isUnread: boolean,
        public isFavorite: boolean
    ) {
    }
}
