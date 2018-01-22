const glob = require("glob");
const path = require("path");
const nodeExternals = require("webpack-node-externals");

const moduleSetting = {
    rules: [
        {
            test: /\.ts$/,
            use: "ts-loader"
        }
    ]
};

const resolveSetting = {
    extensions: [".js", ".ts"],
    alias: {
        "vue$": "vue/dist/vue.esm.js",
        "vuex$": "vuex/dist/vuex.esm.js"
    }
};

var nodeSetting = {
    __dirname: false,
};

const mainProcessConfig = {
    entry: "./src/main/main.ts",
    output: {
        path: path.resolve(__dirname, "dist/main"),
        filename: "bundle.js"
    },
    target: "electron-main",
    module: moduleSetting,
    resolve: resolveSetting,
    node: nodeSetting
};

const rendererProsessConfig = {
    entry: "./src/renderer/main.ts",
    output: {
        path: path.resolve(__dirname, "dist/renderer"),
        filename: "bundle.js"
    },
    target: "electron-renderer",
    module: moduleSetting,
    resolve: resolveSetting
};

const unitTestConfig = {
    entry: glob.sync('./test/**/*.ts'),
    output: {
        path: path.resolve(__dirname, "dist/test"),
        filename: "bundle.js"
    },
    target: "node",
    module: moduleSetting,
    resolve: resolveSetting,
    externals: [nodeExternals()],
    devtool: "source-map",
};

module.exports = [
    mainProcessConfig, rendererProsessConfig, unitTestConfig
];
