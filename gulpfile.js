const nunjucks = require('nunjucks');
const gulp = require('gulp');
const fs = require('fs-jetpack');
const browserSync = require('browser-sync').create();
const $ = require('gulp-load-plugins')();
const rollup = require('rollup').rollup;
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const del = require('del');

var cache;
const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(['demo/views'],{
    watch:false,//MARK:如果为true，则会导致html任务挂在那儿
    noCache:true
  }),
  {
    autoescape:false
  }
);

function render(template, context) {
  return new Promise(function(resolve, reject) {
      env.render(template,context,function(err,res) {
        if(err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
  });
}

gulp.task('html',async function() {
  const destDir = '.tmp';
  const dataForRender = await fs.readAsync('demo/data/demo.json','json');//await 可以获取promise中resolve的值
  const renderResult = await render('base.html',dataForRender);
  await fs.writeAsync(`${destDir}/index.html`,renderResult);
  browserSync.reload('*.html');
});


gulp.task('script',() => {
  // TODO:关于rollup需要再认真学习一下
   return rollup({
     entry:'demo/js/demo.js',
     cache: cache,
     plugins:[
       babel({//这里需要配置文件.babelrc
         exclude:'node_modules/**'
       }),
       nodeResolve({
         jsnext:true,
       })
     ]
   }).then(function(bundle) {
     cache = bundle;//Cache for later use
     return bundle.write({//返回promise，以便下一步then()
       //exports:'named',
       dest: '.tmp/scripts/main.js',
       format: 'iife',
       sourceMap: true,   
     });
   }).then(() => {
     browserSync.reload();
   }).catch(err => {
     console.log(err);
   });
});


gulp.task('style',() => {
  const destDir = '.tmp/styles';
  return gulp.src('demo/scss/demo.scss')
    .pipe($.rename('main.scss'))
    .pipe($.changed(destDir))
    .pipe($.plumber())
    .pipe($.sourcemaps.init({loadMaps:true}))
    .pipe($.sass({
      includePaths:['bower_components'],//@import的东西的查找位置
      outputStyle:'expanded',
      precision:10
    }).on('error',$.sass.logError))
    //.pipe($.rename('main.css.map'))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(destDir))
    .pipe(browserSync.stream({once:true}));
});

gulp.task('serve',gulp.parallel('html','style','script',function() {
  browserSync.init({
    server:{
      baseDir: ['.tmp'],
      //directory:true,
      routes: {
        '/bower_components':'bower_components',
        '/node_modules':'node_modules'
      }
    },
    port:9000
  });
  
  gulp.watch(['demo/scss/*.scss','src/scss/**/*.scss','main.scss'],gulp.parallel('style'));
  gulp.watch(['demo/js/*.js','src/js/*.js','main.js'],gulp.parallel('script'));
  gulp.watch(['demo/views/*.html','demo/data/*.json'],gulp.parallel('html'));
}));

gulp.task('del', (done) => {
 del(['.tmp','dist','deploy']).then( paths => {
    console.log('Deleted files:\n',paths.join('\n'));
    done();
  });
});

/*
gulp.task('smoosh',() => {
  const destDir = 'dist';
	return gulp.src('.tmp/*.html')
		.pipe($.smoosher({
			ignoreFilesNotFound:true
		}))
		.pipe(gulp.dest(destDir));
});

gulp.task('minify', function() {	
	const destDir = 'deploy';
	return gulp.src('dist/*.html')
		//.pipe($.useref())
		//.pipe($.if('*.js',$.uglify()))
		//.pipe($.if('*.css',$.minify()))
		.pipe($.htmlmin({
			collapseWhitespace:true,
			removeComments:true,
			//removeAttributeQuotes:false,
			minifyJS:true,
			minifyCSS:true,
			//ignoreCustomFragments:[ /^(<object)[.\n\r]*(\/object>)$/m ]
			//ignoreCustomFragments:[ /^(<param).*(>)$/g ]
			//ignoreCustomFragments:[ /^(http).*(>)$/ ]
			//maxLineLength:10000,
			//html5:false
		}))
		.pipe($.size({
			gzip:true,
			showFiles:true,
			showTotal:true
		}))
		.pipe(gulp.dest(destDir));
});



gulp.task('publish', gulp.series('del','html','style','script','smoosh','minify'));
*/