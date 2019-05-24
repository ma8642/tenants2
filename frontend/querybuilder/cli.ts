import { argvHasOption } from "./util";
import { main } from "./querybuilder";

const VERSION = '0.1.0';

export function run() {
  if (argvHasOption('-h', '--help')) {
    console.log(`usage: ${process.argv[1]} [OPTIONS]\n`);
    console.log(`options:\n`);
    console.log('  -f / --force    Force run Apollo Codgen');
    console.log('  -w / --watch    Watch files for changes');
    console.log('  -h / --help     Show this help');
    console.log('  -v / --version  Show the version number');
    process.exit(0);
  }

  if (argvHasOption('-v', '--version')) {
    console.log(`querybuilder version ${VERSION}`);
    process.exit(0);
  }

  const mainOptions = {
    forceApolloCodegen: argvHasOption('-f', '--force')
  };

  if (argvHasOption('-w', '--watch')) {
    // This requires devDependencies, so we'll import it dynamically,
    // allowing production builds to do non-watch-related tasks.
    const { watch } = require('./watcher');
    watch(mainOptions);
  } else {
    process.exit(main(mainOptions));
  }
}

if (!module.parent) {
  run();
}
