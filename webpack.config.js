const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require("path");

module.exports = {
    entry: {
        main: ['./src/main.ts', './src/polyfills.ts'],
    },
    devServer: {writeToDisk: true},
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        mainFields: [ 'es2015', 'browser', 'module', 'main'],
        modules: ['./src','./node_modules']
    },
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[id].[name].chunk.js',
        path: path.join(process.cwd(), 'dist'),
        crossOriginLoading: false
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['ts-loader']
            },
            {
                test: /\.css$/,
                use: [ 'css-loader' ],
            },
            {
                test: /\.html$/,
                use: 'html-loader',
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ 
            template: './src/index.html',
            filename: './index.html',
            hash: false,
            inject: false,
            favicon: false,
            minify: false,
            cache: true,
            chunks: 'all',
            excludeChunks: [],
            title: 'Webpack App'
        })
    ]
}