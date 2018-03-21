/**
 * @file pack jsartoolkit5 for ar.jstoolkit.js
 * @example fis3 release -d ./dist
 */

fis.set('project.ignore', ['package.json', 'package-lock.json', 'tsconfig.json', 'npm-debug.log', 'build.sh', 'BCLOUD', 'GIT_COMMIT', 'fis-conf.js', 'webpack.config.js', 'output/**', 'receiver.js', 'node_modules/**', 'dist/**', 'examples/**']);

fis.media('dev').match('src/**', {
    release: false
}).match('third_party/**', {
    release: false
});