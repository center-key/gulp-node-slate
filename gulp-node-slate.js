/////////////////////
// gulp-node-slate //
/////////////////////

// Imports
import { execFileSync } from 'child_process';
import chalk       from 'chalk';
import fs          from 'fs';
import path        from 'path';
import PluginError from 'plugin-error';
import through2    from 'through2';

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
      const options = { stdio: 'inherit', shell: process.platform === 'win32' };
      if (folder)
         options.cwd = folder;
      console.log(cmd + (folder ? ' ./' + folder : ''));
      execFileSync(cmd.split(' ')[0], args, options);
      };

   const setupNodeSlate = () => {
      console.log(fs.existsSync(folder.nodeSlate + '/node_modules') ? 'node-slate installed' : 'downloading...');
      logExec('npm install', folder.nodeSlate);
      if (!fs.existsSync(folder.nodeSlateSrcOrig))
         fs.cpSync(folder.nodeSlateSrc, folder.nodeSlateSrcOrig, { recursive: true });
      };

   const setupCustomFolder = () => {
      fs.cpSync(folder.nodeSlateSrcOrig + '/index.yml', folder.source + '/index.yml', { overwrite: false });
      fs.cpSync(folder.nodeSlateSrcOrig + '/images/logo.png', folder.source + '/images/logo.png', { overwrite: false });
      if (!fs.existsSync(folder.source + '/includes'))
         fs.cpSync(folder.nodeSlateSrcOrig + '/includes', folder.source + '/includes', { recursive: true });
      if (!fs.existsSync(folder.source + '/custom.scss'))
         fs.writeFileSync(folder.source + '/custom.scss', '// Custom Styles\n');
      };

   const rebuildNodeSlateSourceFolder = () => {
      fs.rmSync(folder.nodeSlateSrc, { recursive: true, force: true });
      fs.cpSync(folder.nodeSlateSrcOrig, folder.nodeSlateSrc, { recursive: true });
      fs.rmSync(folder.nodeSlateSrc + '/includes', { recursive: true, force: true });
      fs.cpSync(folder.source, folder.nodeSlateSrc, { recursive: true });
      fs.mkdirSync(folder.nodeSlateSrc + '/css', { recursive: true });
      fs.renameSync(folder.nodeSlateSrc + '/custom.scss', folder.nodeSlateSrc + '/css/_custom.scss');
      fs.appendFileSync(folder.nodeSlateSrc + '/css/screen.css.scss', '\n@import "custom";');
      fs.appendFileSync(folder.nodeSlateSrc + '/css/print.css.scss', '\n@import "custom";');
      };

   const generateApiDocs = () => {
      fs.rmSync(folder.nodeSlateBuild, { recursive: true, force: true });
      logExec('npm run build-quiet', folder.nodeSlate);
      fs.rmSync(folder.build, { recursive: true, force: true });
      fs.cpSync(folder.nodeSlateBuild, folder.build, { recursive: true });
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
