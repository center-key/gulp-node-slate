/////////////////////
// gulp-node-slate //
/////////////////////

// Imports
const assert =         require('assert').strict;
const fs =             require('fs-extra');
const stringToStream = require('string-to-stream');
const Vinyl =          require('vinyl');

// Plugin
const gulpNodeSlate = require('./gulp-node-slate.js');

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('The gulp-node-slate plugin', () => {

   it('is exported as a function', () => {
      const actual =   { type: typeof gulpNodeSlate };
      const expected = { type: 'function' };
      assert.deepEqual(actual, expected);
      });

   it('throws an error when given a bogus configuration', () => {
      const callPluginWithBogusConfig = () => gulpNodeSlate('bogus!');
      assert.throws(callPluginWithBogusConfig, /Options parameter must be an object/);
      });

   });

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('Running the gulp-node-slate plugin', () => {
   const options =   { source: 'api-docs/input', build: 'api-docs/output' };
   const oneMinute = 60 * 1000;
   const clean = (done) => fs.remove('api-docs', done);
   before(clean);

   it('passes through a file in the stream', (done) => {
      const mockFile = new Vinyl({ contents: stringToStream('node-slate as a gulp task!') });
      const handleFileFromStream = (file) => {
         assert(file.isStream());
         const chunks = [];
         const handleEnd = () => {
            const actual =   { data: chunks.map(chunk => chunk.toString()).join('') };
            const expected = { data: 'node-slate as a gulp task!' };
            assert.deepEqual(actual, expected);
            done();
            };
         file.contents.on('data', chunk => chunks.push(chunk));
         file.contents.on('end',  handleEnd);
         };
      const pluginStream = gulpNodeSlate(options);
      pluginStream.on('data', handleFileFromStream);
      pluginStream.write(mockFile);
      pluginStream.end();
      }).timeout(oneMinute);  //extra time in case node-slate needs to be downloaded

   it('creates the API documentation web page', () => {
      const webPage = options.build + '/index.html';
      const actual =   { page: webPage, exists: fs.existsSync(webPage) };
      const expected = { page: webPage, exists: true };
      assert.deepEqual(actual, expected);
      });

   });
