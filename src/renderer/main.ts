import { ipcRenderer } from "electron";
import Vue from "vue";
import Vuex from "vuex";
import { mapState } from "vuex";

Vue.use(Vuex);

/* tslint:disable:object-literal-sort-keys */
const store = new Vuex.Store({
    state: {
        accessToken: "",
        authErrorMessage: "",
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
