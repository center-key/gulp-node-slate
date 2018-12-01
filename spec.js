/////////////////////
// gulp-node-slate //
/////////////////////

// Imports
const assert =         require('assert').strict;
// const es =             require('event-stream');
// TODO: Find replacement for event-stream -- https://www.theregister.co.uk/2018/11/26/npm_repo_bitcoin_stealer/
const fs =             require('fs-extra');
const stringToStream = require('string-to-stream');
const Vinyl =          require('vinyl');
const gulpNodeSlate =  require('./gulp-node-slate.js');

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
   function clean(done) { fs.remove('api-docs', done); }
   before(clean);

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
         // handleDataFromFile(null, 'node-slate as a gulp task!');  //TODO: Find replacement for es.wait
         // file.contents.pipe(es.wait(handleDataFromFile));
         //
         // https://nodejs.org/api/stream.html#stream_class_stream_readable
         file.contents.on('data', (chunk) => {
            handleDataFromFile(null, chunk);
            console.log(`Received ${chunk.length} bytes of data.`);
         });
         file.contents.on('end', () => {
            console.log('There will be no more data.');
         });
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
