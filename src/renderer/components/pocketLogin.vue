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
    import { mapActions, mapState } from "vuex";

    export default {
        computed: mapState([
            "authenticate",
        ]),
        methods: mapActions([
            "pocketAuth",
        ]),
    };
</script>
