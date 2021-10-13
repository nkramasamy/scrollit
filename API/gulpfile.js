var gulp = require("gulp");
var ts = require("gulp-typescript");
const { getDefaultLibFilePath } = require("typescript");

var tsProject = ts.createProject("tsconfig.json");

gulp.task('build', () => {
    const tsResult = tsProject.src().pipe(tsProject());
    return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
    gulp.watch('src/**/*.ts', gulp.series('build'));
});

gulp.task('default', gulp.series('build', 'watch'));
