<template>
    <div id="toolbar">
        <div class="leftToolbar">
            <button v-on:click="reloadViews"><i class="fas fa-sync"></i></button>
            <button><i class="fas fa-ban"></i></button>
            <button><i class="fas fa-ban"></i></button>
        </div>
        <div class="centerToolbar">
            <button><i class="fas fa-ban"></i></button>
            <button><i class="fas fa-ban"></i></button>
            <button><i class="fas fa-ban"></i></button>
        </div>
        <div class="rightToolbar">
            <button><i class="fas fa-ban"></i></button>
            <button><i class="fas fa-ban"></i></button>
            <button><i class="fas fa-ban"></i></button>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import { mapActions } from "vuex";
    import Component from "vue-class-component";

    @Component({
        methods: mapActions([
            "reloadViews",
        ]),
    })
    export default class ContentsToolbar extends Vue {};
</script>
