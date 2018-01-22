export default class Article {
    public constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly url: string,
        public readonly host: string,
        public readonly tags: string[],
        public readonly isUnread: boolean,
        public readonly isFavorite: boolean
    ) {
    }
}
