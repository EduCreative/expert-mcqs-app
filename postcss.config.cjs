// Local PostCSS config to avoid picking up a parent-level config
// and to ensure autoprefixer resolves from this project
module.exports = {
	plugins: [require('autoprefixer')()],
}


