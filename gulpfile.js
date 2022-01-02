/*!
 * gulpfile.js
 *
 */

require('colors')
const del       = require('del')
const gulp      = require('gulp')
const less     	= require('gulp-less')
const rename   	= require("gulp-rename")
const minify   	= require('gulp-minify')
const cleanCSS 	= require('gulp-clean-css')
const babel    	= require('gulp-babel')
const concat   	= require('gulp-concat')

const Path      = require('path');
const CONFIG    = require('./scripts/config.js');
const build     = require('./scripts/build.js')


function PR(p) {
    return Path.resolve(p);
}

// output directories
const OutputDir = PR(CONFIG.outputDir)
const AssetsOutputDir = PR(CONFIG.assetsOutputDir)
// Source (Pages - Markdown files)
const SourceDir = PR(CONFIG.sourceDir)
// Source (Assets)
const AssetsDir = PR(CONFIG.assetsDir)
const AssetsSourceDir = PR(CONFIG.assetsSourceDir)

const ConfigYML = PR('config.yml');
const TocPath = PR(CONFIG.tocPath);
const PageTemplate = PR(CONFIG.pageTemplatePath);



// -------------------------------------------------------------------
// Cleaning
// -------------------------------------------------------------------

// deletes the build folder
function cleanBuild() {
    return del(OutputDir);
}

// deletes the assets folder
function cleanThemeAssets() {
    return del(AssetsDir);
}


// -------------------------------------------------------------------
// Copy
// -------------------------------------------------------------------

// Copies the themes assets to the build folder
function copyThemeAssets() {
    return gulp.src([
        AssetsDir + '/**/**'
    ]).pipe(gulp.dest(AssetsOutputDir))
}

// Copies images from assets source to theme assets folder
function copyThemeImages() {
    return gulp.src([
        AssetsSourceDir + '/images/**/**'
    ]).pipe(gulp.dest(Path.join(AssetsDir, '/images')))
}

// Copies all other files that are not Markdown
function copyOtherFiles() {
    return gulp.src([
            SourceDir + '/**/**',
            '!' + SourceDir + '/**/*.md',
            '!' + TocPath
        ], {
            base: SourceDir
        }).pipe(gulp.dest(OutputDir))
}


// -------------------------------------------------------------------
// Build (theme)
// -------------------------------------------------------------------

// build (theme) css stylesheets and save in assets folder
function buildLess() {
    return gulp.src(Path.join(AssetsSourceDir, '/styles/default.less'))
    .pipe(less())
    .pipe(cleanCSS({ level: 1 }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(AssetsDir))
}

// build (theme) javascript files and save in assets folder
function buildJs() {
    return gulp.src([
        AssetsSourceDir + '/js/main.js',
        AssetsSourceDir + '/js/*.js',
    ])
    .pipe(concat('main.js'))
    .pipe(babel({
        presets: [
            [ "@babel/preset-env", { "targets": "> 0.25%, not dead"} ]
        ]
    }))
    .pipe(minify({ ext: { min: '.min.js' }, noSource: true, preserveComments: 'some'}))
    .pipe(gulp.dest(AssetsDir))
};

// -------------------------------------------------------------------

const buildPages = gulp.series(
    cleanBuild,
    gulp.parallel(
        copyThemeAssets,
        copyOtherFiles,
    ),
    build
);

const buildThemeAssets = gulp.series(
    cleanThemeAssets,
    gulp.parallel(
        buildJs,
        buildLess,
        copyThemeImages
    )
);

const cleanAll = gulp.parallel(
    cleanBuild,
    cleanThemeAssets
);

const buildAll = gulp.series(
    cleanAll,
    gulp.parallel(
        buildJs,
        buildLess,
        copyThemeImages
    ),
    gulp.parallel(
        copyThemeAssets,
        copyOtherFiles,
        build
    )
);


// -------------------------------------------------------------------
// Watch
// -------------------------------------------------------------------


// gulp watch function
const watchFnc = function() {

    let watchStream = null;
    let start = null;
    let stop = null;

    stop = function(cb) {
        watchStream.close();
        cb();
    }

    start = function() {
        watchStream = gulp.watch([
            SourceDir + '/**/**',
            AssetsDir + '/**/**',
            AssetsSourceDir + '/**/**',
            TocPath,
            PageTemplate,
            ConfigYML
        ], gulp.series(stop, buildAll, start));
        return watchStream;
    }

    return start();
}


// -------------------------------------------------------------------
// Module Exports
// -------------------------------------------------------------------

module.exports = {
    default:  buildAll,
    // default: () => {
    // 	console.log(Directories);
    // 	console.log(Files);
    // 	console.log(Globs)
    // },
    build: buildPages,
    buildAssets: buildThemeAssets,
    clean: cleanAll,
    watch: watchFnc,
};
