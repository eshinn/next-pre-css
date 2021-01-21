# next-pre-css
Adds support for both Stylus &amp; Less CSS pre-processing in NextJS v10+.

## Step 1 - Install next-pre-css &amp; Your Choice of Flavor

### for Stylus?
Install both Stylus and the Stylus loader for Webpack:
```
$ npm i -D stylus stylus-loader next-pre-css
```

### for Less?
Install both Less and the Less loader for Webpack:
```
$ npm i -D less less-loader next-pre-css
```

## Step 2 - Setup your NextJS Config
If you don't already have a [NextJS Config](https://nextjs.org/docs/api-reference/next.config.js/introduction), create one.
```
touch next.config.js
```
In the config, `require()` the next-pre-css module and wrap your config with it as follows.
```
const addSupport = require('next-pre-css')

module.exports = addSupport({
  webpack: (config, options) => {
	
    /* ...and the rest of your custom webpack config goes here. */
		
    return config;
  },
})
```
As an extra example; adding GraphQL and the GraphQL-Tag loader (because why not?):
```
const addSupport = require('next-pre-css')

module.exports = addSupport({
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    })
    return config
  },
  webpackDevMiddleware: (config) => {
    return config
  },
})
```

## Step 3 - Um... Do Your Thing.
Begin working w/ the same pleasentries that NextJS provides Sass with (such as [component-level styling](https://nextjs.org/docs/basic-features/built-in-css-support#adding-component-level-css) like: `mah-css.module.styl` or `mah-css.module.less`, but for the pre-processor that _you_ prefer. Under-the-hood, this module does little more than modify the webpack rules NextJS sets for Sass &amp; CSS to include both Stylus and Less. So that's it. 

Hence forth, Go Nuts!
