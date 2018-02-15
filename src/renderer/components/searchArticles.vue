<template>
    <div id="search">
        <input type="text" placeholder="Search" v-bind:value="searchArticle" v-on:input="updateSearchArticle">
        <i class="fas fa-search"></i>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import { mapState } from "vuex";
    import Component from "vue-class-component";

    import mutations from "../mutations";

    @Component({
        computed: mapState([
            "searchArticle",
        ]),
    })
    export default class SearchArticles extends Vue {
        updateSearchArticle(event) {
            this.$store.commit(mutations.UPDATE_SEARCH_ARTICLES, event.target.value);
        }
    };
</script>
