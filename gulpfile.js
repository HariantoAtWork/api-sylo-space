console.time('Loading plugins')
const timer = require('./lib/timer'),
    gulp = require('gulp'),
	livereload   = require('gulp-livereload'),
    nodemon = require('gulp-nodemon'),
	notifier = require('node-notifier'),
	autoRestart = require('gulp-auto-restart')
console.timeEnd('Loading plugins')
autoRestart({'task': 'watch'})

/**
 * Reload: Node server
 */
gulp.task('reload:server', function(){
	nodemon({
		script: 'index', 
		ext: 'js, json', 
		watch: ['src/'] })
	.on('change', function (event) {
		notifier.notify({ message: timer.lapse() + ': Node CHANGE: ' + event })
	})
	.on('start', function (event) {
		notifier.notify({ message: timer.lapse() + ': Node start' })
		setTimeout(function(){
			livereload.changed('/')
			notifier.notify({ message: timer.lapse() + ': Livereload: Node start' })
		}, 1000)
	})
	.on('restart', function (event) {
		notifier.notify({ message: timer.lapse() + ': Node restarted' })
		setTimeout(function(){
			livereload.changed('/')
			notifier.notify({ message: timer.lapse() + ': Livereload: Node restart' })
		}, 1000)
	})
})



gulp.task('watch', ['reload:server'])
gulp.task('default', ['watch'])