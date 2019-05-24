import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

import {
  strContains,
  getGraphQlFragments,
} from "./util";

/**
 * The following directory paths assume we've been compiled to the
 * root project dir, and that we're running from it as well.
 */

/**
 * The path to the directory where we'll get our GraphQL queries, and
 * where we'll put our generated TypeScript source code.
 */
export const LIB_PATH_PARTS = ['frontend', 'lib', 'queries'];
export const LIB_PATH = path.join(...LIB_PATH_PARTS);

/** The path into which Apollo codegen:generate will put its generated files. */
const GEN_PATH = path.join(LIB_PATH, '__generated__');

/** The location of the GraphQL schema for the server. */
export const SCHEMA_PATH = path.join('schema.json');

/** The extension for all our GraphQL queries/mutations/fragments. */
export const DOT_GRAPHQL = '.graphql';

/**
 * Files generated by Apollo codegen:generate that we want to copy over to
 * our destination directory, without modifying.
 */
export const COPY_FROM_GEN_TO_LIB = [
  'globalTypes.ts',
];

/**
 * Write the given file to disk, but only if its new contents are
 * different from its existing contents.
 * 
 * Returns true if the file's contents have changed, false otherwise.
 */
function writeFileIfChangedSync(path: string, contents: string): boolean {
  if (fs.existsSync(path) && fs.readFileSync(path, { encoding: 'utf-8' }) === contents) {
    return false;
  }
  fs.writeFileSync(path, contents, { encoding: 'utf-8' });
  return true;
}

/**
 * This class is responsible for taking a raw text
 * GraphQL query/mutation/fragment, Apollo codegen:generate'd TypeScript
 * interfaces for it, and combining them. In the case of
 * queries and mutations, we also generate
 * a strongly-typed TS function that wraps the query.
 * 
 * This is partially based on the following blog post,
 * thought it went an extra step to convert the raw
 * text query into an AST, which is way beyond what
 * we need right now, and also way beyond my current
 * understanding of GraphQL:
 * 
 * https://medium.com/@crucialfelix/bridging-the-server-client-gap-graphql-typescript-and-apollo-codegen-e5b54fa96ae2
 */
export class GraphQlFile {
  /** The base name of the GraphQL query filename, without its extension. */
  basename: string;

  /** The raw GraphQL query. */
  graphQl: string;

  /** The path to the TypeScript code that implements our generated function. */
  tsCodePath: string;

  /** The path to the file containing the raw GraphQL query. */
  graphQlPath: string;

  /** The filename of the Apollo codegen:generate'd Typescript interfaces for the query. */
  tsInterfacesFilename: string;

  /** The path to the Apollo codegen:generate'd Typescript interfaces for the query. */
  tsInterfacesPath: string;

  /** External fragments that the GraphQL refers to, if any. */
  fragments: string[];

  constructor(readonly graphQlFilename: string, genPath: string = GEN_PATH) {
    const fullPath = path.join(LIB_PATH, graphQlFilename);
    this.graphQlPath = fullPath;
    this.graphQl = fs.readFileSync(fullPath, { encoding: 'utf-8' });
    this.basename = path.basename(graphQlFilename, DOT_GRAPHQL);
    this.tsInterfacesFilename = `${this.basename}.ts`;
    this.tsInterfacesPath = path.join(genPath, this.tsInterfacesFilename);
    this.tsCodePath = path.join(LIB_PATH, `${this.basename}.ts`);
    this.fragments = getGraphQlFragments(this.graphQl);
  }

  /** Returns whether our GraphQL contains any of the given strings. */
  graphQlContains(...strings: string[]): boolean {
    return strContains(this.graphQl, ...strings);
  }

  /**
   * Generates an ES6 template literal that, when evaluated in the
   * proper context, is the text of our source GraphQL file, along
   * with all dependencies (e.g. fragments).
   **/
  getGraphQlTemplateLiteral(): string {
    const parts = [this.graphQl];

    this.fragments.forEach(fragmentName => {
      parts.push('${' + fragmentName + '.graphQL}');
    });

    return '`' + parts.join('\n') + '`';
  }

  /**
   * Returns the comments and imports that should appear at the
   * beginning of our generated TypeScript code.
   */
  getTsCodeHeader(): string {
    const lines = [
      '// This file was automatically generated and should not be edited.\n'
    ];

    this.fragments.forEach(fragmentName => {
      lines.push(`import * as ${fragmentName} from './${fragmentName}'`);
    });

    return lines.join('\n');
  }

  /** Generate the TypeScript code that clients will use. */
  generateTsCode(): string {
    if (this.graphQl.indexOf(this.basename) === -1) {
      throw new ToolError(`Expected ${this.graphQlFilename} to define "${this.basename}"!`);
    }

    if (this.graphQlContains(`mutation ${this.basename}`, `query ${this.basename}`)) {
      return this.generateTsCodeForQueryOrMutation();
    } else if (this.graphQlContains(`fragment ${this.basename}`)) {
      return this.generateTsCodeForFragment();
    } else {
      throw new ToolError(`${this.basename} is an unrecognized GraphQL type`);
    }
  }

  /** Return the TypeScript interfaces code created by Apollo codegen:generate. */
  getTsInterfaces(): string {
    if (!fs.existsSync(this.tsInterfacesPath)) {
      throw new ToolError(`Expected ${this.tsInterfacesPath} to exist!`);
    }

    const tsInterfaces = fs.readFileSync(this.tsInterfacesPath, { encoding: 'utf-8' });

    if (tsInterfaces.indexOf(this.basename) === -1) {
      throw new ToolError(`Expected ${this.tsInterfacesFilename} to define "${this.basename}"!`);
    }

    return tsInterfaces;
  }

  /** Generate the TypeScript code when our file is a GraphQL fragment. */
  generateTsCodeForFragment(): string {
    return [
      this.getTsCodeHeader(),
      this.getTsInterfaces(),
      `export const graphQL = ${this.getGraphQlTemplateLiteral()};`
    ].join('\n');
  }

  /**
   * Generate the TypeScript code when our file is a GraphQL
   * query or mutation.
   */
  generateTsCodeForQueryOrMutation(): string {
    const tsInterfaces = this.getTsInterfaces();
    let variablesInterfaceName = `${this.basename}Variables`;
    let args = '';

    if (tsInterfaces.indexOf(variablesInterfaceName) !== -1) {
      args = `args: ${variablesInterfaceName}`;
    }

    const fetchGraphQL = 'fetchGraphQL: (query: string, args?: any) => Promise<any>';

    return [
      this.getTsCodeHeader(),
      tsInterfaces,
      `export const ${this.basename} = {`,
      `  // The following query was taken from ${this.graphQlFilename}.`,
      `  graphQL: ${this.getGraphQlTemplateLiteral()},`,
      `  fetch(${fetchGraphQL}, ${args}): Promise<${this.basename}> {`,
      `    return fetchGraphQL(${this.basename}.graphQL${args ? ', args' : ''});`,
      `  }`,
      `};`,
      ``,
      `export const fetch${this.basename} = ${this.basename}.fetch;`
    ].join('\n');
  }

  /** Write out our TypeScript code to a file. */
  writeTsCode(): boolean {
    return writeFileIfChangedSync(this.tsCodePath, this.generateTsCode());
  }

  /** Scan the directory containing our GraphQL queries. */
  static fromDir() {
    return fs.readdirSync(LIB_PATH)
      .filter(filename => path.extname(filename) === DOT_GRAPHQL)
      .map(filename => new GraphQlFile(filename));
  }
}

/**
 * A custom error that indicates an error from this tool, which
 * users can take steps to resolve.
 */
export class ToolError extends Error {}

/**
 * Determine whether we need to run Apollo codegen:generate, based on
 * examining file modification dates.
 */
function doesApolloCodegenNeedToBeRun(): boolean {
  const queries = GraphQlFile.fromDir();

  const inputFiles = [SCHEMA_PATH, ...queries.map(q => q.graphQlPath)];
  const latestInputMod = Math.max(...inputFiles.map(f => fs.statSync(f).mtimeMs));

  const outputFiles = [
    ...COPY_FROM_GEN_TO_LIB.map(filename => path.join(LIB_PATH, filename)),
    ...queries.map(q => q.tsInterfacesPath)
  ];
  const earliestOutputMod = Math.min(...outputFiles.map(f => {
    if (!fs.existsSync(f)) return 0;
    return fs.statSync(f).mtimeMs;
  }));

  return latestInputMod > earliestOutputMod;
}

/**
 * Run Apollo codegen:generate if needed, returning 0 on success, nonzero on errors.
 * 
 * @param force Force running of Apollo Codegen, regardless of file modification dates.
 */
export function runApolloCodegen(force: boolean = false): number {
  if (!force && !doesApolloCodegenNeedToBeRun()) return 0;

  const child = child_process.spawnSync('node', [
    'node_modules/apollo/bin/run',
    'codegen:generate',
    '--includes', `${LIB_PATH}/*.graphql`,
    '--localSchemaFile', SCHEMA_PATH,
    '--target', 'typescript',
    '--no-addTypename',
    '--outputFlat',
    GEN_PATH,
  ], {
    stdio: 'inherit'
  });
  if (child.error) {
    throw child.error;
  }
  if (child.status !== 0) {
    return child.status;
  }

  COPY_FROM_GEN_TO_LIB.forEach(filename => {
    const content = fs.readFileSync(path.join(GEN_PATH, filename), { encoding: 'utf-8' });
    writeFileIfChangedSync(path.join(LIB_PATH, filename), content);
  });
  return 0;
}

/** Options for our main querybuilder functionality. */
export interface MainOptions {
  /** Whether to force-run Apollo codegen:generate even if we don't think it's necessary. */
  forceApolloCodegen: boolean;
}


/** Our main query-building functionality. */
export function main(options: MainOptions): number {
  const apolloStatus = runApolloCodegen(options.forceApolloCodegen);
  if (apolloStatus !== 0) {
    return apolloStatus;
  }

  const filesWritten: string[] = [];

  // Find all raw GraphQL queries and generate type-safe functions
  // for them.
  GraphQlFile.fromDir().forEach(query => {
    if (query.writeTsCode()) {
      filesWritten.push(query.tsCodePath);
    }
  });

  if (filesWritten.length > 0) {
    const files = filesWritten.length > 1 ? 'files' : 'file';
    console.log(`Generated ${filesWritten.length} TS ${files} from GraphQL queries in ${LIB_PATH}.`);
  } else {
    console.log(`GraphQL queries in ${LIB_PATH} are unchanged, doing nothing.`);
  }

  return 0;
}
