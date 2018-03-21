/**
 * @file local compile
 * @package threejs 不打包
 *          jquery, js-aruco 通过 provide plugin 打包
 *          jsartoolkit fis3 单独打包
 */

const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractLess = new ExtractTextPlugin({
    filename: '[name].css'
});

const packLib = new webpack.ProvidePlugin({
    $: 'jquery',
    Aruco: 'js-aruco'
});

module.exports = {
    mode: 'development',
    devtool: 'none',
    optimization: {
        minimize: false
    },
    entry: {
        lib: './src/index.ts'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: 'bxlx',
        libraryTarget: 'umd',
        libraryExport: 'default'
    },
    module: {
        rules: [{
            test: /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
            loader: 'url-loader?limit=30000&name=[name].[ext]'
        }, {
            test: /\.ts/,
            use: 'ts-loader',
            exclude: /dist|node_modules/
        }, {
            test: /\.less$/,
            exclude: /node_modules/,
            loader: ExtractTextPlugin.extract([{loader: 'css-loader', options: { minimize: true }},
                {loader: 'less-loader'}])
        }]
    },
    resolve: {
        extensions: ['.js', '.json', '.ts']
    },
    externals: {
        'three': 'window.THREE'
    },
    plugins: [extractLess, packLib]
};