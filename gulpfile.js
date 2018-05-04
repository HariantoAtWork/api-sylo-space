console.time('Loading plugins')
const timer = require('./gulp/timer'),
    gulp = require('gulp'),
	livereload   = require('gulp-livereload'),
    nodemon = require('gulp-nodemon'),
    notifier = require('node-notifier')
console.timeEnd('Loading plugins')
/**
 * Reload: Node server
 */
gulp.task('reload:server', function(){
	nodemon({ 
		script: 'index', 
		ext: 'js, json', 
		watch: ['src/app.js','data'] })
		.on('change', function (event) {
			notifier.notify({ message: timer.lapse()+': Node CHANGE: '+event });
		})
		.on('start', function (event) {
			notifier.notify({ message: timer.lapse()+': Node start' });
			setTimeout(function(){
				livereload.changed('/');
				notifier.notify({ message: timer.lapse()+': Livereload: Node start' });
			}, 1000);
		})
		.on('restart', function (event) {
			notifier.notify({ message: timer.lapse()+': Node restarted' });
			setTimeout(function(){
				livereload.changed('/');
				notifier.notify({ message: timer.lapse()+': Livereload: Node restart' });
			}, 1000);
		});
});


gulp.task('default', ['reload:server'])