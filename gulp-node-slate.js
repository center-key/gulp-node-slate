/////////////////////
// gulp-node-slate //
/////////////////////

// Imports
import chalk       from 'chalk';
import fs          from 'fs-extra';
import path        from 'path';
import PluginError from 'plugin-error';
import through2    from 'through2';
import { execFileSync } from 'child_process';

// Setup
const pluginName = 'gulp-node-slate';

// Gulp plugin
const gulpNodeSlate = (options) => {

   const defaults = { source: 'source', build: 'build' };
   const settings = { ...defaults, ...options };
   if (options !== undefined && typeof options !== 'object')
      throw new PluginError(pluginName, 'Options parameter must be an object.');
   console.log('Settings:', settings);
   const folder = {
      nodeSlate:        'node_modules/node-slate',
      nodeSlateSrcOrig: 'node_modules/node-slate/source-original',
      nodeSlateSrc:     'node_modules/node-slate/source',
      nodeSlateBuild:   'node_modules/node-slate/build/3-rev',
      source:           settings.source,
      build:            settings.build,
      };

   const logExec = (cmd, folder) => {
      const args = cmd.split(' ').splice(1, cmd.length - 1);
      const options = { stdio: 'inherit' };
      if (folder)
         options.cwd = folder;
      console.log(cmd + (folder ? ' ./' + folder : ''));
      execFileSync(cmd.split(' ')[0], args, options);
      };

   const setupNodeSlate = () => {
      console.log(fs.existsSync(folder.nodeSlate + '/node_modules') ? 'node-slate installed' : 'downloading...');
      logExec('npm install', folder.nodeSlate);
      if (!fs.existsSync(folder.nodeSlateSrcOrig))
         fs.copySync(folder.nodeSlateSrc, folder.nodeSlateSrcOrig);
      };

   const setupCustomFolder = () => {
      fs.copySync(folder.nodeSlateSrcOrig + '/index.yml', folder.source + '/index.yml', { overwrite: false });
      fs.copySync(folder.nodeSlateSrcOrig + '/images/logo.png', folder.source + '/images/logo.png', { overwrite: false });
      if (!fs.existsSync(folder.source + '/includes'))
         fs.copySync(folder.nodeSlateSrcOrig + '/includes', folder.source + '/includes');
      fs.ensureFileSync(folder.source + '/custom.scss');
      };

   const rebuildNodeSlateSourceFolder = () => {
      fs.removeSync(folder.nodeSlateSrc);
      fs.copySync(folder.nodeSlateSrcOrig, folder.nodeSlateSrc);
      fs.removeSync(folder.nodeSlateSrc + '/includes');
      fs.copySync(folder.source, folder.nodeSlateSrc);
      fs.moveSync(folder.nodeSlateSrc + '/custom.scss', folder.nodeSlateSrc + '/css/_custom.scss');
      fs.appendFileSync(folder.nodeSlateSrc + '/css/screen.css.scss', '\n@import "custom";');
      fs.appendFileSync(folder.nodeSlateSrc + '/css/print.css.scss', '\n@import "custom";');
      };

   const generateApiDocs = () => {
      fs.removeSync(folder.nodeSlateBuild);
      logExec('npm run build-quiet', folder.nodeSlate);
      fs.removeSync(folder.build);
      fs.copySync(folder.nodeSlateBuild, folder.build);
      };

   const transform = (file, encoding, done) => {
      done(null, file);
      };

   const completion = (done) => {
      setupNodeSlate();
      setupCustomFolder();
      rebuildNodeSlateSourceFolder();
      generateApiDocs();
      done();
      console.log('Source input (markdown):', chalk.green(path.resolve(folder.source)));
      console.log('Build output (HTML):    ', chalk.white(path.resolve(folder.build)));
      };

   return through2.obj(transform, completion);  //return stream
   };

// Module loading
export { gulpNodeSlate };
