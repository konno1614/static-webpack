const webpack = require('webpack');
//path モジュールの読み込み
const path = require('path');
//cssファイルの出力用
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//パッケージのライセンス情報をjsファイルに含める
const TerserPlugin = require('terser-webpack-plugin');
//画像のコピー用
const CopyPlugin = require('copy-webpack-plugin');
// 画像をwebpに変換
const ImageminWebpWebpackPlugin= require("imagemin-webp-webpack-plugin");
// HTMLの読み込み用
const HtmlWebpackPlugin = require('html-webpack-plugin');
//読み込むファイルを複数指定する用
const WebpackWatchedGlobEntries = require('webpack-watched-glob-entries-plugin');
//EJS用
const { htmlWebpackPluginTemplateCustomizer } = require('template-ejs-loader');

const enabledSourceMap = process.env.NODE_ENV !== 'production';

const filePath = {
    js: './src/js/',
    ejs: './src/ejs/',
    sass: './src/scss/',
};

/* Sassファイル読み込みの定義*/
const entriesScss = WebpackWatchedGlobEntries.getEntries([path.resolve(__dirname, `${filePath.sass}**/**.scss`)], {
    ignore: path.resolve(__dirname, `${filePath.sass}**/_*.scss`),
})();

const cssGlobPlugins = (entriesScss) => {
    return Object.keys(entriesScss).map(
        (key) =>
        new MiniCssExtractPlugin({
            //出力ファイル名
            filename: `./css/${key}.css`,
        })
    );
};

/* EJS読み込みの定義 */
const entries = WebpackWatchedGlobEntries.getEntries([path.resolve(__dirname, `${filePath.ejs}**/*.ejs`)], {
    ignore: path.resolve(__dirname, `${filePath.ejs}**/_*.ejs`),
})();
const htmlGlobPlugins = (entries) => {
    return Object.keys(entries).map(
        (key) =>
        new HtmlWebpackPlugin({
            //出力ファイル名
            filename: `${key}.html`,
            //ejsファイルの読み込み
            template: htmlWebpackPluginTemplateCustomizer({
                htmlLoaderOption: {
                    //ファイル自動読み込みと圧縮を無効化
                    sources: false,
                    minimize: {
                        // 大文字と小文字を区別
                        caseSensitive: true,
                        // タグ間の空白を削除（生成するHTMLを圧縮）
                        collapseWhitespace: true,
                        // タグ間に改行が含まれる場合に詰める（collapseWhitespace: trueと共に使用）
                        preserveLineBreaks: true,
                        // HTMLコメントを削除
                        removeComments: true,
                    },
                },
                templatePath: `${filePath.ejs}${key}.ejs`,
            }),
            //JS・CSS自動出力と圧縮を無効化
            inject: false,
            minify: false,
        })
    );
};

/* TypeScript読み込みの定義 */
const entriesTS = WebpackWatchedGlobEntries.getEntries([path.resolve(__dirname, `${filePath.js}*.ts`)])();
const app = {
    entry: entriesTS,
    //出力先（デフォルトと同じなので省略可）
    output: {
        filename: './js/[name].js',
        path: path.resolve(__dirname, 'public'),
        clean: true,
    },
    //仮想サーバーの設定
    devServer: {
        //ルートディレクトリの指定
        static: path.resolve(__dirname, 'src'),
        port: '4000',
        hot: true,
        open: true,
        watchFiles: ['src/**/*', 'public/**/*'],
    },
    //パッケージのライセンス情報をjsファイルの中に含める
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    },
    module: {
        rules: [
        {
            test: /\.ejs$/i,
            use: ['html-loader', 'template-ejs-loader'],
        },
        {
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },
        {
            // 対象となるファイルの拡張子(scss)
            test: /\.(sa|sc|c)ss$/,
            // Sassファイルの読み込みとコンパイル
            use: [
                // CSSファイルを抽出するように MiniCssExtractPlugin のローダーを指定
                {
                    loader: MiniCssExtractPlugin.loader,
                },
                // CSSをバンドルするためのローダー
                {
                    loader: 'css-loader',
                    options: {
                        //URL の解決を無効に
                        url: false,
                        // production モードでなければソースマップを有効に
                        sourceMap: enabledSourceMap,
                        // postcss-loader と sass-loader の場合は2を指定
                        importLoaders: 2,
                        // 0 => no loaders (default);
                        // 1 => postcss-loader;
                        // 2 => postcss-loader, sass-loader
                    },
                },
                // PostCSS（autoprefixer）の設定
                {
                    loader: 'postcss-loader',
                    options: {
                        // PostCSS でもソースマップを有効に
                        sourceMap: enabledSourceMap,
                        postcssOptions: {
                            // ベンダープレフィックスを自動付与
                            plugins: [require('autoprefixer')({ grid: true })],
                        },
                    },
                },
                // Sass を CSS へ変換するローダー
                {
                    loader: 'sass-loader',
                    options: {
                        //  production モードでなければソースマップを有効に
                        sourceMap: enabledSourceMap,
                    },
                },
            ],
        },
        ],
    },
    // import 文で .ts ファイルを解決するため
    // これを定義しないと import 文で拡張子を書く必要が生まれる。
    resolve: {
        // 拡張子を配列で指定
        extensions: ['.ts', '.js'],
    },
    target: 'web',
    //プラグインの設定
    plugins: [
        ...cssGlobPlugins(entriesScss),
        ...htmlGlobPlugins(entries),
        new CopyPlugin({
            patterns: [
                {
                    // 画像フォルダの複製
                    from: path.resolve(__dirname, 'src/images/'),
                    to: path.resolve(__dirname, 'public/images'),
                },
                {
                    // フォントフォルダの複製
                    from: path.resolve(__dirname, 'src/font/'),
                    to: path.resolve(__dirname, 'public/font'),
                },
            ],
        }),
        new ImageminWebpWebpackPlugin({
            config: [{
                test: /\.(png|jpe?g)$/i, // 対象ファイル
                options: {
                    quality:  75, // 画質
                    detailsLogs : false, // コンソールに出力
                    silent : false, // コンソールに印刷
                }
            }]
        })
    ],
    //source-map タイプのソースマップを出力
    devtool: 'source-map',
    // node_modules を監視（watch）対象から除外
    watchOptions: {
        ignored: /node_modules/, //正規表現で指定
    },
};

module.exports = app;
