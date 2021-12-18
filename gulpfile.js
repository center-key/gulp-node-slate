/////////////////////
// gulp-node-slate //
/////////////////////

// Example "gulpfile.js" to create a task to generate Slate API documentation.
// Instructions:
//    https://github.com/center-key/gulp-node-slate#readme

// Imports
import gulp  from 'gulp';
import slate from 'gulp-node-slate';

// Tasks
const generateApiDocs = () => gulp.src('.').pipe(slate());

// Gulp
gulp.task('slate', generateApiDocs);
