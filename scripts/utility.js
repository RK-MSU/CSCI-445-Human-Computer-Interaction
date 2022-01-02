/*!
 * utility.js
 */

const CONFIG       = require('./config.js')
const Path         = require('path')
const MarkdownSlug = require('markdown-slug')


// Converts back slashes to forward slashes. Used to convert paths to URLs
const bsToFs = (p) => p.replace(/\\/g, '/')

// Gets the folder depth of the specified path
const dirDepth = (myDir) => myDir.split(Path.sep).length

// Renders handlebar style template variables from an object
const renderTemplate = (template, vars) => {
	for (let [key, value] of Object.entries(vars)) {
		template = template.replace(new RegExp('{{\\s*' + key + '\\s*}}', 'gi'), value)
	}

	return template
}

// Gets the relative path to the source dir from a docs page
const getRelativeRootFromPage = (pagePath) => {
	let depth = dirDepth(pagePath) - dirDepth(Path.resolve(CONFIG.sourceDir))
	let relPath = ('..' + Path.sep).repeat(depth - 1)

	return relPath
}

// Returns a function that will slugify a heading and also handle future duplicate slugs when called again
const getSlugger = () => {
	var slugs = {}

	return (heading) => {
		let slug = MarkdownSlug(heading)
		// Increase the slug use count
		slugs[slug] = slugs[slug] == undefined ? 0 : slugs[slug] + 1

		// Add the count to the heading slug
		if (slugs[slug] > 0) {
			slug += '-' + slugs[slug]
		}

		return slug
	}
}

const relFromSource = (p) => Path.relative(CONFIG.sourceDir, p)

module.exports = { dirDepth, bsToFs, renderTemplate, getSlugger, getRelativeRootFromPage, relFromSource }
