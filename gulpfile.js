const { src, dest, series, watch } = require(`gulp`);
const babel = require(`gulp-babel`);
const browserSync = require(`browser-sync`);
const cache = require(`gulp-cache`);
const cssCompressor = require(`gulp-clean-css`);
const cssLinter = require(`gulp-stylelint`);
const del = require(`del`);
const htmlCompressor = require(`gulp-htmlmin`);
const htmlValidator = require(`gulp-html`);
// const imageCompressor = require(`gulp-imagemin`);
const jsCompressor = require(`gulp-uglify`);
const jsLinter = require(`gulp-eslint`);
const reload = browserSync.reload;

let validateHTML = () => {
    return src(`index.html`)
        .pipe(htmlValidator({"verbose": true}));
};

let compressHTML = () => {
    return src(`index.html`)
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(`prod`));
};

let lintCSS = () => {
    return src(`app/css/style.css`)
        .pipe(cssLinter({
            failAfterError: true,
            reporters: [{
                formatter: `verbose`,
                console: true
            }]
        }));
};

let compressCSS = () => {
    return src(`app/css/style.css`)
        .pipe(cssCompressor({"debug": true}, (details) => {
            console.log(`\n\tOriginal CSS file size: ` +
                `${details.name}: ${details.stats.originalSize}`);
            console.log(`\tMinified CSS file size: ` +
                `${details.name}: ${details.stats.minifiedSize}\n`);
        }))
        .pipe(dest(`prod/css`));
};

let lintJS = () => {
    return src(`app/js/app.js`)
        .pipe(jsLinter(`.eslintrc.json`))
        .pipe(jsLinter.formatEach(`compact`));
};

let transpileJSForDev = () => {
    return src(`app/js/app.js`)
        .pipe(babel())
        .pipe(dest(`temp/js`));
};

let transpileJSForProd = () => {
    return src(`app/js/app.js`)
        .pipe(babel())
        .pipe(jsCompressor())
        .pipe(dest(`prod/js`));
};

let copyUnprocessedAssetsToProd = () => {
    return src([
        `app/*.*`,      // Source all files,
        `app/**`,       // and all folders,
        `!app/html/**`, // but, ignore HTML files;
        `!app/css/**`,  // ignore CSS files;
        `!app/js/**`,   // ignore JS files;
        `!app/img/**`   // and, ignore images.
    ], {dot: true}).pipe(dest(`prod`));
};

let serve = () => {
    browserSync({
        notify: true,
        reloadDelay: 0,
        server: {
            /* The order below is important:
             *
             * 1. Retrieve `index.html` from the `app/html` directory
             * 2. Load transpiled JS from the `temp` directory
             * 3. And, finally, retrieve CSS from the `app/css` directory
             */
            baseDir: [
                `index.html`,
                `temp`,
                `app`
            ]
        }
    });

    watch(`app/js/app.js`,
        series(lintJS, transpileJSForDev)
    ).on(`change`, reload);

    watch(`app/css/style.css`,
        series(lintCSS)
    ).on(`change`, reload);

    watch(`index.html`,
        series(validateHTML)
    ).on(`change`, reload);

    watch(`app/img/**/*`
    ).on(`change`, reload);
};

async function clean() {
    let fs = require(`fs`),
        i,
        foldersToDelete = [`temp`, `prod`];

    for (i = 0; i < foldersToDelete.length; i++) {
        try {
            fs.accessSync(foldersToDelete[i], fs.F_OK);
            process.stdout.write(`\n\tThe ` + foldersToDelete[i] +
                ` directory was found and will be deleted.\n`);
            del(foldersToDelete[i]);
        } catch (e) {
            process.stdout.write(`\n\tThe ` + foldersToDelete[i] +
                ` directory does NOT exist or is NOT accessible.\n`);
        }
    }

    process.stdout.write(`\n`);
}

exports.validateHTML = validateHTML;
exports.compressHTML = compressHTML;
exports.lintCSS = lintCSS;
exports.compressCSS = compressCSS;
exports.transpileJSForDev = transpileJSForDev;
exports.transpileJSForProd = transpileJSForProd;
exports.copyUnprocessedAssetsToProd = copyUnprocessedAssetsToProd;
exports.clean = clean;
exports.serve = series (
    validateHTML,
    lintCSS,
    lintJS,
    transpileJSForDev,
    serve
);
exports.build = series (
    compressHTML,
    compressCSS,
    transpileJSForProd,
    copyUnprocessedAssetsToProd
);
