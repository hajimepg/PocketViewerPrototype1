<template>
    <div id="views">
        <div class="viewGroup" v-bind:class="{ active: views.home.isActive }" v-on:click="selectHomeView">
            <div class="unreadCount">{{ views.home.count }}</div>
            <div class="viewName"><i class="fas fa-bars"></i>Home</div>
        </div>
        <div class="viewGroup" v-bind:class="{ active: views.favorite.isActive }" v-on:click="selectFavoriteView">
            <div class="viewName"><i class="far fa-star"></i>Favorite</div>
        </div>
        <div class="viewGroup" v-bind:class="{ active: views.archive.isActive }" v-on:click="selectArchiveView">
            <div class="viewName"><i class="fas fa-archive"></i>Archive</div>
        </div>
        <div class="viewGroup">
            <div class="viewName"><i class="fas fa-cloud"></i>Host</div>
        </div>
        <div v-for="(host, index) in views.hosts" v-bind:class="{ active: host.isActive }" v-on:click="selectHostsView(index)" class="viewSubGroup">
            <div class="unreadCount">{{ host.count }}</div>
            <div class="viewName">{{ host.name }}</div>
        </div>
        <div class="viewGroup">
            <div class="viewName"><i class="fas fa-tag"></i>Tag</div>
        </div>
        <div v-for="(tag, index) in views.tags" v-bind:class="{ active: tag.isActive }" v-on:click="selectTagsView(index)" class="viewSubGroup">
            <div class="unreadCount">{{ tag.count }}</div>
            <div class="viewName">{{ tag.name }}</div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import { mapActions } from "vuex";
    import Component from "vue-class-component";

    @Component({
        methods: mapActions([
            "selectHomeView",
            "selectFavoriteView",
            "selectArchiveView",
        ]),
    })
    export default class ViewsList extends Vue {
        get views() {
            const views = this.$store.state.views;
            const active = views.active;
            return {
                home: { count: views.home.count, isActive: active.view === "home" },
                favorite: { isActive: active.view === "favorite" },
                archive: { isActive: active.view === "archive" },
                hosts: views.hosts.map(({ name, count }, index) =>
                    ({ name, count, isActive: active.view === "hosts" && active.index === index })
                ),
                tags: views.tags.map(({ name, count }, index) =>
                    ({ name, count, isActive: active.view === "tags" && active.index === index })
                ),
            };
        }

        selectHostsView(index: number) {
            this.$store.dispatch("selectHostsView", index);
        }

        selectTagsView(index: number) {
            this.$store.dispatch("selectTagsView", index);
        }
    };
</script>
