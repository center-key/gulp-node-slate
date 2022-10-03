/////////////////////
// gulp-node-slate //
/////////////////////

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import assert         from 'assert';
import fs             from 'fs';
import stringToStream from 'string-to-stream';
import Vinyl          from 'vinyl';

// Plugin
import { gulpNodeSlate } from './gulp-node-slate.js';

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('The gulp-node-slate plugin', () => {

   it('is exported as a function', () => {
      const actual =   { type: typeof gulpNodeSlate };
      const expected = { type: 'function' };
      assertDeepStrictEqual(actual, expected);
      });

   it('throws an error when given a bogus configuration', () => {
      const callPluginWithBogusConfig = () => gulpNodeSlate('bogus!');
      const exception = { message: 'Options parameter must be an object.' };
      assert.throws(callPluginWithBogusConfig, exception);
      });

   });

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('Running the gulp-node-slate plugin', () => {
   const options =   { source: 'api-docs/input', build: 'api-docs/output' };
   const oneMinute = 60 * 1000;
   const clean =     () => fs.rmSync('api-docs', { recursive: true, force: true });
   before(clean);

   it('passes through a file in the stream', (done) => {
      const mockFile = new Vinyl({ contents: stringToStream('node-slate as a gulp task!') });
      const handleFileFromStream = (file) => {
         assertDeepStrictEqual({ stream: file.isStream() }, { stream: true });
         const chunks = [];
         const handleEnd = () => {
            const actual =   { data: chunks.map(chunk => chunk.toString()).join('') };
            const expected = { data: 'node-slate as a gulp task!' };
            assertDeepStrictEqual(actual, expected, done);
            };
         file.contents.on('data', chunk => chunks.push(chunk));
         file.contents.on('end',  handleEnd);
         };
      const pluginStream = gulpNodeSlate(options);
      pluginStream.on('data', handleFileFromStream);
      pluginStream.write(mockFile);
      pluginStream.end();
      }).timeout(oneMinute).retries(1);  //extra time in case node-slate needs to be downloaded

   it('creates the API documentation web page', () => {
      const webPage =  options.build + '/index.html';
      const actual =   { page: webPage, exists: fs.existsSync(webPage) };
      const expected = { page: webPage, exists: true };
      assertDeepStrictEqual(actual, expected);
      });

   });
