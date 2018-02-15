<template>
    <div id="articles">
        <div v-for="article in articles" class="article" v-bind:class="{ active: article.isActive }" v-on:click="selectArticle(article)">
            <div class="thumb">
                <img v-bind:src="article.thumb">
            </div>
            <div class="info">
                <div class="title">{{ article.title }}</div>
                <div class="host">{{ article.host }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";

    @Component
    export default class ArticlesList extends Vue {
        get articles() {
            return this.$store.state.articles
                .filter((article) => {
                    if (article.title.indexOf(this.$store.state.searchArticle) !== -1) {
                        return true;
                    }
                    if (article.host.indexOf(this.$store.state.searchArticle) !== -1) {
                        return true;
                    }
                    return false;
                })
                .map((article) => {
                    return {
                        id: article.id,
                        title: article.title,
                        url: article.url,
                        host: article.host,
                        thumb: article.thumb,
                        isActive: article.id === (this as any).$store.state.activeArticleId,
                    };
                });
        }

        selectArticle(article: any) {
            this.$store.dispatch("selectArticle", article);
        }
    };
</script>
