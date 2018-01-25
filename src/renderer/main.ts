import { ipcRenderer } from "electron";
import Vue from "vue";
import Vuex, { mapActions, mapState } from "vuex";

Vue.use(Vuex);

/* tslint:disable:object-literal-sort-keys */
const store = new Vuex.Store({
    state: ipcRenderer.sendSync("sync-initial-state"),
    mutations: {
        initAuth(state) {
            state.accessToken = "";
            state.authErrorMessage = "";
        },
        setAccessToken(state, accessToken: string) {
            state.accessToken = accessToken;
        },
        setAuthErrorMessage(state, authErrorMessage: string) {
            state.authErrorMessage = authErrorMessage;
        },
        updateActiveView(state, active) {
            state.views.active = active;
        },
        updateArticles(state, articles) {
            state.articles = articles;
        },
        updateSearchArticle(state, text) {
            state.searchArticle = text;
        },
    },
    actions: {
        selectUnreadView(context) {
            context.commit("updateActiveView", { view: "unread", index: undefined });
            ipcRenderer.send("get-unread-articles");
        },
        selectFavoriteView(context) {
            context.commit("updateActiveView", { view: "favorite", index: undefined });
            ipcRenderer.send("get-favorite-articles");
        },
        selectArchiveView(context) {
            context.commit("updateActiveView", { view: "archive", index: undefined });
            ipcRenderer.send("get-archive-articles");
        },
        selectHostsView(context, index) {
            context.commit("updateActiveView", { view: "hosts", index });
            ipcRenderer.send("get-host-articles", index);
        },
        selectTagsView(context, index) {
            context.commit("updateActiveView", { view: "tags", index });
            ipcRenderer.send("get-tag-articles", index);
        },
    },
});

const app = new Vue({
    el: "#app",
    store,
    methods: {
        pocketAuth() {
            this.$store.commit("initAuth");
            ipcRenderer.send("pocket-auth");
        },
        ...mapActions([
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
            this.$store.commit("updateSearchArticle", event.target.value);
        }
    },
    computed: {
        ...mapState({
            pocketAccessToken: "accessToken",
            pocketErrorMessage: "authErrorMessage",
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

ipcRenderer.on("pocket-auth-reply", (event, error, accessToken) => {
    if (error !== null) {
        store.commit("setAuthErrorMessage", error);
    }
    else {
        store.commit("setAccessToken", accessToken);
    }
});

ipcRenderer.on("update-articles", (event, articles) => {
    store.commit("updateArticles", articles);
});
