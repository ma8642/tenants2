import path from 'path';
import fs from 'fs';

import chokidar from 'chokidar';
import chalk from 'chalk';
import { main, ToolError, MainOptions, SCHEMA_PATH, LIB_PATH_PARTS, DOT_GRAPHQL } from './querybuilder';
import { debouncer } from './util';


/** Watch GraphQL queries and schema and re-build queries when they change. */
export function watch(options: MainOptions, debounceMs = 250) {
  const myFile = path.basename(process.argv[1]);
  const myFileContents = fs.readFileSync(myFile);
  const paths = [
    SCHEMA_PATH,
    path.posix.join(...LIB_PATH_PARTS, `*${DOT_GRAPHQL}`)
  ];
  const checkIfMyFileHasChanged = () => {
    if (!myFileContents.equals(fs.readFileSync(myFile))) {
      console.log(chalk.yellowBright(
        `WARNING: ${myFile} has changed, consider pressing Ctrl-C\n` +
        `and re-running this command.`
      ));
    }
  };
  chokidar.watch([myFile], {
    ignoreInitial: true,
    awaitWriteFinish: true
  }).on('all', checkIfMyFileHasChanged);
  chokidar.watch(paths).on('all', debouncer(() => {
    let exitCode = 1;

    try {
      exitCode = main(options);
    } catch (e) {
      if (e instanceof ToolError) {
        console.log(e.message);
      } else {
        throw e;
      }
    }

    if (exitCode !== 0) {
      console.log(chalk.redBright('ERROR: Rebuilding GraphQL queries failed!'));
    }
    console.log(`Waiting for changes in ${paths.join(', ')}...`);
    checkIfMyFileHasChanged();
  }, debounceMs));
}
