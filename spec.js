/////////////////////
// gulp-node-slate //
/////////////////////

// Imports
const assert =         require('assert').strict;
const es =             require('event-stream');
const fs =             require('fs');
const stringToStream = require('string-to-stream');
const Vinyl =          require('vinyl');
const gulpNodeSlate =  require('./index.js');

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('The gulp-node-slate plugin', () => {

   it('is exported as a function', () => {
      const actual =   { type: typeof gulpNodeSlate };
      const expected = { type: 'function' };
      assert.deepEqual(actual, expected);
      });

   it('throws an error when given a bogus configuration', () => {
      function callPluginWithBogusConfig() { gulpNodeSlate('bogus!'); }
      assert.throws(callPluginWithBogusConfig, /Options parameter must be an object/);
      });

   });

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('Running the gulp-node-slate plugin', () => {
   const options =   { source: 'api-docs/input', build: 'api-docs/output' };
   const oneMinute = 60 * 1000;

   it('passes through a file in the stream', (done) => {
      const mockFile = new Vinyl({ contents: stringToStream('node-slate as a gulp task!') });
      function handleFileFromStream(file) {
         assert(file.isStream());
         function handleDataFromFile(err, data) {
            const actual =   { data: data.toString() };
            const expected = { data: 'node-slate as a gulp task!' };
            assert.deepEqual(actual, expected);
            done();
            }
         file.contents.pipe(es.wait(handleDataFromFile));
         }
      const pluginStream = gulpNodeSlate(options);
      pluginStream.on('data', handleFileFromStream);
      pluginStream.write(mockFile);
      pluginStream.end();
      }).timeout(oneMinute);  //in case node-slate needs to be downloaded

   it('creates the API documentation web page', () => {
      const webPage = options.build + '/index.html';
      const actual =   { page: webPage, exists: fs.existsSync(webPage) };
      const expected = { page: webPage, exists: true };
      assert.deepEqual(actual, expected);
      });

   });
