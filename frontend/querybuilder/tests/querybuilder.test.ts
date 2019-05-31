/** @jest-environment node */

import * as fs from 'fs';
import * as path from 'path';

import {
  runApolloCodegen,
  GraphQlFile,
  findStaleTypescriptFiles,
} from "../querybuilder";

const RE_RUN_MSG = 'Please re-run "node querybuilder.js --force".';

describe('querybuilder', () => {
  it('should have generated up-to-date TS files based on latest schema and queries', () => {
    runApolloCodegen();
    GraphQlFile.fromDir().forEach(query => {
      const expected = query.generateTsCode();
      const actual = fs.readFileSync(query.tsCodePath, { encoding: 'utf-8' });

      if (expected != actual) {
        throw new Error(`GraphQL queries have changed. ${RE_RUN_MSG}`);
      }
    });
  });

  it('should not have generated any TS files that lack graphQL queries/fragments', () => {
    const files = findStaleTypescriptFiles().map(f => path.basename(f)).join(', ');

    if (files.length) {
      throw new Error(`Stale GraphQL TS files exist (${files}). ${RE_RUN_MSG}`);
    }
  });
});
