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
        updateArticles(state, articles) {
            state.articles = articles;
        },
        selectUnreadView(state) {
            deselectViews(state);
            state.views.unread.isActive = true;
        },
        selectFavoriteView(state) {
            deselectViews(state);
            state.views.favorite.isActive = true;
        },
        selectArchiveView(state) {
            deselectViews(state);
            state.views.archive.isActive = true;
        },
        selectHostsView(state, index: number) {
            deselectViews(state);
            state.views.hosts[index].isActive = true;
        },
        selectTagsView(state, index: number) {
            deselectViews(state);
            state.views.tags[index].isActive = true;
        },
        updateSearchArticle(state, text) {
            state.searchArticle = text;
        },
    },
    actions: {
        selectUnreadView(context) {
            context.commit("selectUnreadView");
            ipcRenderer.send("get-unread-articles");
        },
        selectFavoriteView(context) {
            context.commit("selectFavoriteView");
            ipcRenderer.send("get-favorite-articles");
        },
        selectArchiveView(context) {
            context.commit("selectArchiveView");
            ipcRenderer.send("get-archive-articles");
        },
        selectHostsView(context, index) {
            context.commit("selectHostsView", index);
            ipcRenderer.send("get-host-articles", index);
        },
        selectTagsView(context, index) {
            context.commit("selectTagsView", index);
            ipcRenderer.send("get-tag-articles", index);
        },
    },
});

function deselectViews(state) {
    state.views.unread.isActive = false;
    state.views.favorite.isActive = false;
    state.views.archive.isActive = false;
    for (const host of state.views.hosts) {
        host.isActive = false;
    }
    for (const tag of state.views.tags) {
        tag.isActive = false;
    }
}

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
            views: "views",
            searchArticle: "searchArticle",
        }),
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
