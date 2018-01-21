import { ipcRenderer } from "electron";
import Vue from "vue";
import Vuex from "vuex";
import { mapState } from "vuex";

Vue.use(Vuex);

/* tslint:disable:object-literal-sort-keys */
const store = new Vuex.Store({
    state: {
        // 開発テンポを良くするため、一時的にダミーを設定
        // TODO: アクセストークンを使用する段階になったら空文字に戻すこと
        accessToken: "dummyToken",
        authErrorMessage: "",
        views: {
            unread: {
                count: 456,
            },
            hosts: [
                {
                    name: "twitter.com",
                    count: 10,
                },
                {
                    name: "pixiv.net",
                    count: 20,
                },
                {
                    name: "Other",
                    count: 30,
                },
            ],
            tags: [
                {
                    name: "Programming",
                    count: 40,
                },
                {
                    name: "Game",
                    count: 40,
                },
            ]
        },
        articles: [
            {
                title: "article1",
                host: "twitter.com",
                thumb: "images/dummy_image.png",
            },
            {
                title: "article2",
                host: "pixiv.net",
                thumb: "images/dummy_image.png",
            },
            {
                title: "article3",
                host: "hatena.ne.jp",
                thumb: "images/dummy_image.png",
            },
            {
                title: "長いタイトルあああああああああああああああああああああああああああああああああ",
                host: "twitter.com",
                thumb: "images/dummy_image.png",
            },
        ],
    },
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
    }
});

const app = new Vue({
    el: "#app",
    store,
    methods: {
        pocketAuth() {
            store.commit("initAuth");
            ipcRenderer.send("pocket-auth");
        },
    },
    computed: mapState({
        pocketAccessToken: "accessToken",
        pocketErrorMessage: "authErrorMessage",
        views: "views",
        articles: "articles",
    }),
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
