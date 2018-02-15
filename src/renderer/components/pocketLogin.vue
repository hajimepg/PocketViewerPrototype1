<template>
    <div id="auth">
        <div id="authInner">
            <p>Pocketにログインする</p>
            <button v-on:click="pocketAuth">Pocketにログイン</button>
            <p v-if="authenticate.errorMessage !== ''">
                Error: {{ authenticate.errorMessage }}
            </p>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import { mapActions, mapState } from "vuex";
    import Component from "vue-class-component";

    @Component({
        computed: mapState([
            "authenticate",
        ]),
        methods: mapActions([
            "pocketAuth",
        ]),
    })
    export default class PocketLogin extends Vue {};
</script>
