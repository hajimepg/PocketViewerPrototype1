import { ipcRenderer } from "electron";
import Vue from "vue";
import Vuex, { mapActions, mapState } from "vuex";

import * as ipcPromise from "../ipcPromise/ipcPromise";
import mutations from "./mutations";

Vue.use(Vuex);

/* tslint:disable:object-literal-sort-keys */
const store = new Vuex.Store({
    state: ipcRenderer.sendSync("sync-initial-state"),
    mutations: {
        [mutations.INIT_AUTH](state) {
            state.authenticate.isAuthenticate = false;
            state.authenticate.errorMessage = "";
        },
        [mutations.UPDATE_IS_AUTHENTICATE](state, value: boolean) {
            state.authenticate.isAuthenticate = value;
        },
        [mutations.UPDATE_AUTH_ERROR_MESEAGE](state, errorMessage: string) {
            state.authenticate.errorMessage = errorMessage;
        },
        [mutations.UPDATE_ACTIVE_VIEW](state, active) {
            state.views.active = active;
        },
        [mutations.UPDATE_ARTICLES](state, articles) {
            state.articles = articles;
        },
        [mutations.UPDATE_SEARCH_ARTICLES](state, text) {
            state.searchArticle = text;
        },
    },
    actions: {
        async pocketAuth(context) {
            context.commit(mutations.INIT_AUTH);

            const errorMessage: string | null = await ipcPromise.send("pocket-auth", undefined);

            if (errorMessage !== null) {
                context.commit(mutations.UPDATE_AUTH_ERROR_MESEAGE, errorMessage);
            }
            else {
                context.commit(mutations.UPDATE_IS_AUTHENTICATE, true);
            }
        },
        async selectUnreadView(context) {
            context.commit(mutations.UPDATE_ACTIVE_VIEW, { view: "unread", index: undefined });
            const articles = await ipcPromise.send("get-unread-articles", undefined);
            context.commit(mutations.UPDATE_ARTICLES, articles);
        },
        async selectFavoriteView(context) {
            context.commit(mutations.UPDATE_ACTIVE_VIEW, { view: "favorite", index: undefined });
            const articles = await ipcPromise.send("get-favorite-articles", undefined);
            context.commit(mutations.UPDATE_ARTICLES, articles);
        },
        async selectArchiveView(context) {
            context.commit(mutations.UPDATE_ACTIVE_VIEW, { view: "archive", index: undefined });
            const articles = await ipcPromise.send("get-archive-articles", undefined);
            context.commit(mutations.UPDATE_ARTICLES, articles);
        },
        async selectHostsView(context, index) {
            context.commit(mutations.UPDATE_ACTIVE_VIEW, { view: "hosts", index });
            const articles = await ipcPromise.send("get-host-articles", context.state.views.hosts[index].name);
            context.commit(mutations.UPDATE_ARTICLES, articles);
        },
        async selectTagsView(context, index) {
            context.commit(mutations.UPDATE_ACTIVE_VIEW, { view: "tags", index });
            const articles = await ipcPromise.send("get-tag-articles", context.state.views.tags[index].name);
            context.commit(mutations.UPDATE_ARTICLES, articles);
        },
    },
});

const app = new Vue({
    el: "#app",
    store,
    methods: {
        ...mapActions([
            "pocketAuth",
            "selectUnreadView",
            "selectFavoriteView",
            "selectArchiveView",
        ]),
        selectHostsView(index: number) {
            this.$store.dispatch("selectHostsView", index);
        },
        selectTagsView(index: number) {
            this.$store.dispatch("selectTagsView", index);
        },
        updateSearchArticle(event) {
            this.$store.commit(mutations.UPDATE_SEARCH_ARTICLES, event.target.value);
        }
    },
    computed: {
        ...mapState({
            authenticate: "authenticate",
            searchArticle: "searchArticle",
        }),
        views() {
            const views = (this as any).$store.state.views;
            const active = views.active;
            return {
                unread: { count: views.unread.count, isActive: active.view === "unread" },
                favorite: { isActive: active.view === "favorite" },
                archive: { isActive: active.view === "archive" },
                hosts: views.hosts.map(({ name, count }, index) =>
                    ({ name, count, isActive: active.view === "hosts" && active.index === index })
                ),
                tags: views.tags.map(({ name, count }, index) =>
                    ({ name, count, isActive: active.view === "tags" && active.index === index })
                ),
            };
        },
        articles() {
            // Note: VuexのTypeScriptの型定義ファイルが更新されるまでanyにキャストする
            return (this as any).$store.state.articles.filter(
                (article) => {
                    if (article.title.indexOf(this.$store.state.searchArticle) !== -1) {
                        return true;
                    }
                    if (article.host.indexOf(this.$store.state.searchArticle) !== -1) {
                        return true;
                    }
                    return false;
                }
            );
        },
    }
});
/* tslint:enable:object-literal-sort-keys */
