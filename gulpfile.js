const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const kit = require('gulp-kit');
const browserSync = require('browser-sync').create();  // mówimy create -tworzymy serwer
const reload = browserSync.reload;

// tworzymy obiekt w którym będziemy mieć ścieżki do naszych plików
const paths = {
    // ** oznaczają, że gdybyśmy mieli w folderze jescze jakieś inne podfoldery to wtedy również te podfoldery przeszukamy
    html: './html/**/*.kit',
    // * przeszukaj wszystkie pliki, które mają rozszerzenie scss
    sass: './src/sass/**/*.scss',
    js: './src/js/**/*.js',
    img: './src/img/*',
    dist: './dist',
    sassDest: './dist/css',
    jsDest: './dist/js',
    imgDest: './dist/img'
}

// tworzymy funkcję dla kompilowania plików sass
function sassCompiler(done) {
    // odwołujemy się do obiektu, a następnie klucza
    src(paths.sass)
        .pipe(sourcemaps.init())

        // pipe to coś takiego jak then w promise
        // jeżeli te pliki znajdziesz odpal sasa
        .pipe(sass().on('error', sass.logError))

        // odnosimy się do paczki autoprefixer, aby dodawać prefixy do naszego css'a
        .pipe(autoprefixer())

        // odnosimy się do wtyczki cssnano -czyli minifikujemy nasz scss
        .pipe(cssnano())

        // zapisujemy rename z obiektem, aby wyznaczyć która nazwa będzie zmieniana
        .pipe(rename({
            suffix: '.min'
        }))

        // sourcemaps tworzy specjalny plik, aby nam się zgadzały linijki w devtoolsach
        .pipe(sourcemaps.write())

        // wskazujemy ścieżkę do której chcemy wyeksportować naszego sassa
        .pipe(dest(paths.sassDest));

    done()
}

// tworzymy funkcję dla babela
function javaScript(done) {
    // zapisujemy to samo co powyżej ze zmianami z sass na js
    src(paths.js)

        .pipe(sourcemaps.init())

        // zapisujemy babela z presetem odnoszącym się do js
        .pipe(babel({
            presets: ['@babel/env']
        }))

        // minifikujemy kod js przed wysłaniem go do folderu dist
        .pipe(uglify())

        // zapisujemy rename z obiektem, aby wyznaczyć która nazwa będzie zmieniana
        .pipe(rename({
            suffix: '.min'
        }))

        // w js ta wtyczka nie działa w 100% dokładnie
        .pipe(sourcemaps.write())

        .pipe(dest(paths.jsDest));

    done()
}

// tworzymy funkcję dla imagemin - minifikowania obrazów
function convertImage(done) {
    // zapisujemy to samo co powyżej ze zmianami z sass na img
    src(paths.img)

        // zapisujemy wywołanie imagemin
        .pipe(imagemin())

        .pipe(dest(paths.imgDest));

    done()
}

// tworzymy funkcję która będzie obsługiwała pliki kit w folderze html i kompilowała na zwykły html
function handleKits(done) {
    // odwołujemy się ścieżki z plikiem html
    src(paths.html)

        // zapisujemy wywołanie kit
        .pipe(kit())

        // chcemy aby wszystkie nasze pliki z folderu html .kit były eksportowane do naszego folderu głównego ze stroną 
        .pipe(dest('./'));

    done()
}

// tworzymy funkcję która będzie usuwała cały folder dist
function cleanStuff(done) {
    // odwołujemy się do obiektu, a następnie klucza, read: false - właściwości z dok., które mają przyspieszyć działanie
    src(paths.dist, { read: false })
        .pipe(clean());

    done()
}

// tworzymy funkcję dla browser-sync, serwera
function startBrowserSync(done) {
    // poniższy zapis skopiowaliśmy ze strony browser-sync
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    done()
}

// tworzymy funkcję dla automatycznego przeładowywania strony
function watchForChanges(done) {
    // odwołujemy się do API Gulp, którego importowaliśmy i mówimy mu aby obserwował wszystkie pliki z rozszerzeniem html
    watch('./*.html').on("change", reload);

    // w momencie kiedy zobaczymy jakieś zmiany w pliku sass, js lub .kit (html) odpalamy trzy funckje, a następnie przeładowujemy live
    watch([paths.html, paths.sass, paths.js], parallel(handleKits, sassCompiler, javaScript)).on("change", reload);

    // tworzymy watcha i obserwujemy zmiany w img oraz wywołujemy funkcję
    watch(paths.img, convertImage).on("change", reload);

    done()
}

// tworzymy nową zmienna dla metody parallel, aby umieścić w niej wszystkie główne funkcje
const mainFunctions = parallel(handleKits, sassCompiler, javaScript, convertImage)

// eksportujemy funkcję czyszczącą i używamy jej niezależnie (czyli wpisujemy, kiedy potrzebujemy wyczyścić folder dist świadomie)
exports.cleanStuff = cleanStuff;

// ten zapis mówi, że najpierw w serii wykonaj wszystkie funkcje z mainFunctions, a później wystartuj serwer
exports.default = series(mainFunctions, startBrowserSync, watchForChanges)