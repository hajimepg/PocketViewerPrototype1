import { ipcRenderer } from "electron";
import Vue from "vue";

/* tslint:disable:object-literal-sort-keys */
const app = new Vue({
    el: "#app",
    data: {
        pocketAccessToken: "",
        pocketErrorMessage: "",
    },
    methods: {
        pocketAuth() {
            this.$data.pocketAccessToken = "";
            this.$data.pocketErrorMessage = "";
            ipcRenderer.send("pocket-auth");
        },
    }
});
/* tslint:enable:object-literal-sort-keys */

ipcRenderer.on("pocket-auth-reply", (event, error, accessToken) => {
    if (error !== null) {
        app.$data.pocketErrorMessage = error;
    }
    else {
        app.$data.pocketAccessToken = accessToken;
    }
});
