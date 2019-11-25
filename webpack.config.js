let HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
let HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: "production",

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js"]
    },
    entry: './src/browser/App.tsx',
    output: {
        path: __dirname + '/built/browser',
        filename: 'bundle.js'
    },

    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
                options: {
                    compilerOptions: {
                        target: 'es5',
                        module: 'amd',
                        jsx: 'react'
                    }
                }
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            inlineSource: '.(js|css)$',
            title: 'Password Distributor',
            template: 'src/browser/index.html'
        }),
        new HtmlWebpackInlineSourcePlugin()
    ]  
}