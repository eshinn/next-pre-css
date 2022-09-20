const regexDoc = /pages[\\/]_document\./
const regexLikeCss = /\.(css|scss|sass)$/
const regexMoreLikeCss = /\.(css|scss|sass|styl|less)$/
const regexCssGlobal = /(?<!\.module)\.css$/
const regexCssModules = /\.module\.css$/
const regexSassGlobal = /(?<!\.module)\.(scss|sass)$/
const regexSassModules = /\.module\.(scss|sass)$/
const regexStylusGlobal = /(?<!\.module)\.styl$/
const regexStylusModules = /\.module\.styl$/
const regexLessGlobal = /(?<!\.module)\.less$/
const regexLessModules = /\.module\.less$/

const ammendOneOfRules = config => (a, c) => {
	const { context: ctx, stylusOptions, lessOptions} = config

	const stylusLoader = {
		loader: 'stylus-loader',
		options: { sourceMap: true, stylusOptions }
	}
	const lessLoader = {
		loader: 'less-loader',
		options: { sourceMap: true, lessOptions}
	}

	const matchesRegExpTest = 'test' in c
		&& c.test instanceof RegExp
		&& c.test.source

	const matchesRegExpIssuer = 'issuer' in c
		&& typeof c.issuer !== 'undefined'
		&& c.issuer instanceof RegExp
		&& c.issuer.source

	const regStrArr = a => a
		.map(t => `${t instanceof RegExp ? 'r' : 's'}>>${t}`)
		.sort()
		.join()

	const matchArray = a => b => regStrArr(a) === regStrArr(b)

	const testAccepts = ('test' in c
		&& Array.isArray(c.test)
		&& matchArray(c.test)
		|| (() => false))

	const issuerAccepts = ('issuer' in c
		&& typeof c.issuer !== 'undefined'
		&& 'and' in c.issuer
		&& Array.isArray(c.issuer.and)
		&& matchArray(c.issuer.and)
		|| (() => false))

	const issuerAvoids = ('issuer' in c
		&& typeof c.issuer !== 'undefined'
		&& 'not' in c.issuer
		&& Array.isArray(c.issuer.not)
		&& matchArray(c.issuer.not)
		|| (() => false))

	if (matchesRegExpTest === regexLikeCss.source && matchesRegExpIssuer === regexDoc.source) {
		c = [{ ...c, test: regexMoreLikeCss }]
		return [].concat(a, c)
	}

	if (matchesRegExpTest === regexSassModules.source && issuerAccepts([ctx]) && issuerAvoids([/node_modules/])) {
		c = [ c,
			{ ...c, test: regexStylusModules, use: [].concat(...c.use.slice(0, -1), stylusLoader) },
			{ ...c, test: regexLessModules, use: [].concat(...c.use.slice(0, -1), lessLoader) },
		]
		return [].concat(a, c)
	}

	if (testAccepts([regexCssModules, regexSassModules])) {
		c = [{ ...c, test: [].concat(c.test, regexStylusModules, regexLessModules) }]
		return [].concat(a, c)
	}

	// A bit of a hacky way to check custom _App file ... but async/promise isn't allowed in NextJS configs so yeah.
	if (matchesRegExpTest === regexSassGlobal.source && issuerAccepts([ c.issuer && c.issuer.and && /_app\./.test(c.issuer.and.join()) && c.issuer.and ])) {
		c = [ c,
			{ ...c, test: regexStylusGlobal, use: [].concat(...c.use.slice(0, -1), stylusLoader) },
			{ ...c, test: regexLessGlobal, use: [].concat(...c.use.slice(0, -1), lessLoader) },
		]
		return [].concat(a, c)
	}

	if (testAccepts([regexCssGlobal, regexSassGlobal]) && issuerAccepts([/node_modules/])) {
		c = [{ ...c, test: [].concat(c.test, regexStylusGlobal, regexLessGlobal) }]
		return [].concat(a, c)
	}

	if (testAccepts([regexCssGlobal, regexSassGlobal])) {
		c = [{ ...c, test: [].concat(c.test, regexStylusGlobal, regexLessGlobal) }]
		return [].concat(a, c)
	}

	if (matchesRegExpIssuer === regexLikeCss.source) {
		c = [{ ...c, issuer: regexMoreLikeCss }]
		return [].concat(a, c)
	}

	return [].concat(a, c)
}

module.exports = (nextConfig = {}) => ({
	...nextConfig,
	webpack(config, options) {
		const rules = config.module.rules.map(rule => 'oneOf' in rule
			? ({ ...rule, oneOf: rule.oneOf.reduce(ammendOneOfRules(config)) })
			: rule
		)
		config.module.rules = rules

		if (typeof nextConfig.webpack === 'function') {
			config = nextConfig.webpack(config, options)
		}
		return config
	},
	webpackDevMiddleware(config, options) {
		if (typeof nextConfig.webpackDevMiddleware === 'function')
			config = nextConfig.webpackDevMiddleware(config, options)

		return config
	}
})
