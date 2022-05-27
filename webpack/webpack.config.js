const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
   mode: "production",
   entry: {
      background: path.resolve(__dirname, "..", "src", "core", "extensionScripts", "background.ts"),
      featureApplicator: path.resolve(__dirname, "..", "src", "core", "extensionScripts", "featureApplicator.ts"),
      featureMenu: path.resolve(__dirname, "..", "src", "core", "extensionScripts", "featureMenu.ts")
   },
   output: {
      path: path.join(__dirname, "../dist"),
      filename: "[name].js",
   },
   resolve: {
      extensions: [".ts", ".js"],
   },
   module: {
      rules: [
         {
            test: /\.tsx?$/,
            loader: "ts-loader",
            exclude: /node_modules/,
         },
         {
            test: /\.css$/,
            include: path.join(__dirname, "..", "src", "components"),
            use: [
              'style-loader',
              '@teamsupercell/typings-for-css-modules-loader', 
              {
               loader: 'css-loader', 
                options: {
                  modules: true
                }
              }
            ]
          }
      ],
   },
   plugins: [
      new CopyPlugin({
         patterns: [{from: ".", to: ".", context: "public"}]
      }),
   ],
   optimization: {
      minimize: true
   },
};