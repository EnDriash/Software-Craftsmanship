// const TerserPlugin = require('terser-webpack-plugin');
// const ChunksWebpackPlugin = require('chunks-webpack-plugin');
// const ScriptExtHtmlPlugin = require('script-ext-html-webpack-plugin');

// const CopyPlugin = require('copy-webpack-plugin');
// const nodeExternals = require('webpack-node-externals');

const VERSION = require('./package.json').version;
const path = require('path');
const webpack = require('webpack');

const NodemonPlugin = require('nodemon-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const HtmlPlugin = require('html-webpack-plugin');
const CrittersPlugin = require('critters-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = async function (_, env) {
    const isProd = env && env.mode === 'production';
    const isTest = _ && _ === 'test';

    return {
        mode: isProd ? 'production' : 'development',
        entry: path.resolve(__dirname, 'src', 'index.ts'),
        devtool: isProd ? 'source-map' : 'inline-cheap-module-source-map',
        stats: 'minimal',
        target: 'node',
        output: {
            filename: 'main.js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/',
            globalObject: 'this',
            devtoolModuleFilenameTemplate: '[absolute-resource-path]',
            devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
        },
        devServer: {
            // Any unmatched request paths will serve static files from src/*:
            contentBase: path.join(__dirname, 'src'),
            compress: true,
            // Request paths not ending in a file extension serve index.html:
            historyApiFallback: true,
            // Suppress forwarding of Webpack logs to the browser console:
            clientLogLevel: 'none',
            // Supress the extensive stats normally printed after a dev build (since sizes are mostly useless):
            stats: 'verbose',
            // Don't embed an error overlay ("redbox") into the client bundle:
            overlay: false
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.jsx', '.js'],

            plugins: [
                new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })
            ].filter(Boolean)
        },
        module: {
            rules: [
                {
                    oneOf: [
                        {
                            test: /(\.mjs|\.esm\.js)$/i,
                            type: 'javascript/esm',
                            resolve: {},
                            parser: {
                                harmony: true,
                                amd: false,
                                commonjs: false,
                                system: false,
                                requireInclude: false,
                                requireEnsure: false,
                                requireContext: false,
                                browserify: false,
                                requireJs: false,
                                node: false
                            }
                        },
                        {
                            type: 'javascript/auto',
                            resolve: {},
                            parser: {
                                system: false,
                                requireJs: false
                            }
                        }
                    ]
                },
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'thread-loader'
                        },
                        {
                            loader: 'babel-loader'
                        },
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true,
                                happyPackMode: true
                            }
                        },

                    ],

                    exclude: /node_modules/,
                },
                {
                    test: /\.(scss|sass|css)$/,
                    use: [
                        // In production, CSS is extracted to files on disk. In development, it's inlined into JS:
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                                importLoaders: 1,
                                sourceMap: isProd
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: false
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ]
                },
                {
                    test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        limit: 4096,
                        fallback: {
                            loader: 'file-loader',
                            options: {
                                name: 'img/[name].[hash:5].[ext]'
                            }
                        }
                    }
                },
                {
                    test: /\.(svg)(\?.*)?$/,
                    use: [
                        /* config.module.rule('svg').use('file-loader') */
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'img/[name].[hash:5].[ext]'
                            }
                        }
                    ]
                },
                {
                    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 4096,
                                fallback: {
                                    loader: 'file-loader',
                                    options: {
                                        name: 'media/[name].[hash:5].[ext]'
                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 4096,
                                fallback: {
                                    loader: 'file-loader',
                                    options: {
                                        name: 'fonts/[name].[hash:5].[ext]'
                                    }
                                }
                            }
                        }
                    ]
                },

            ],
        },
        plugins: [
            new FriendlyErrorsWebpackPlugin(),
            // Remove old files before outputting a production build:
            new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }), // To do konfiguracji w zaleznosci co jest uruchamiane
            // add nodemon on webpack --watch
            new NodemonPlugin(),

            isProd && new webpack.optimize.SplitChunksPlugin({}),

            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    diagnosticOptions: {
                        semantic: true,
                        syntactic: true,
                    },
                },
            }),

            new webpack.DefinePlugin({
                VERSION: JSON.stringify(VERSION),
                // We set node.process=false later in this config.
                // Here we make sure if (process && process.foo) still works:
                process: JSON.stringify({
                    NODE_ENV: '"production"',
                    APP_BASE_URL: '"http://127.0.0.1:8080"',
                    APP_SERVER: '"http://127.0.0.1:3001"',
                    BASE_URL: '"/"'
                })
            }),

            new HtmlPlugin({
                filename: path.join(__dirname, 'dist/index.html'),
                template: 'public/index.html',
                minify: isProd && {
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    removeRedundantAttributes: true,
                    collapseBooleanAttributes: true,
                    removeComments: true
                },
                inject: 'body',
                compile: true
            }),

            isProd && new MiniCssExtractPlugin({
                filename: 'css/[name].[contenthash:5].css',
                chunkFilename: 'css/[name].[contenthash:5].css'
            }),

            // Inline Critical CSS
            isProd && new CrittersPlugin({
                // use <link rel="stylesheet" media="not x" onload="this.media='all'"> hack to load async css:
                preload: 'media',
                // inline all styles from any stylesheet below this size:
                inlineThreshold: 2000,
                // don't bother lazy-loading non-critical stylesheets below this size, just inline the non-critical styles too:
                minimumExternalSize: 4000,
                // don't emit <noscript> external stylesheet links since the app fundamentally requires JS anyway:
                noscriptFallback: false,
                // inline fonts
                inlineFonts: true,
                // (and don't lazy load them):
                preloadFonts: false
            }),

            new OptimizeCssAssetsPlugin({
                cssProcessorOptions: {
                    postcssReduceIdents: {
                        counterStyle: false,
                        gridTemplate: false,
                        keyframes: false
                    }
                }
            }),

            isProd && new StyleLintPlugin({
                files: ['src/**/*.{htm,html,css,sss,less,scss,sass}'],
            }),

            isProd && new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                defaultSizes: 'gzip',
                openAnalyzer: false
            }),
        ].filter(Boolean),
    };
};