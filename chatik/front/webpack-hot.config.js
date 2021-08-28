const path = require("path")
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const output_path = path.join(__dirname, "..", "static", "chatik")

module.exports = {
    mode: "development",
    devtool: 'inline-source-map',
    entry: "./index.js",
    output: {
        path: path.join(__dirname, "..", "static", "chatik"),
        filename: "bundle.js",
        publicPath: 'http://localhost:9091/'
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanAfterEveryBuildPatterns: [`${output_path}/*.hot-update.*`],
            dry: false,
            dangerouslyAllowCleanPatternsOutsideProject: true
        }),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                },
            }
        ]
    },
    devServer: {
        hot: true,
        port: 9091,
        devMiddleware: {
            writeToDisk: true
        },
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        }
    },
}

