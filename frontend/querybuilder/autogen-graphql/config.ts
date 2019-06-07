import * as fs from 'fs';
import toml from 'toml';

import { ToolError } from "../util";

type LatestVersion = 1;

export const LATEST_AUTOGEN_CONFIG_VERSION: LatestVersion = 1;

export type AutogenConfig = {
  /**
   * The current version of the configuration. If/when we change the configuration format, we
   * may want to increment the version to ensure that developers know they need to
   * restart watcher processes, instead of getting confusing tracebacks.
   */
  version: LatestVersion,

  /**
   * A mapping from GraphQL type names to configuration metadata.
   */
  types: { [name: string]: AutogenTypeConfig },
};

export type AutogenTypeConfig = {
  /** A list of fields in GraphQL types to ignore when generating queries. */
  ignoreFields?: string[],

  /**
   * The GraphQL fragment name to create for the type.
   */
  fragmentName?: string,
};

function validateBasicConfig(config: AutogenConfig): AutogenConfig {
  if (config.version !== LATEST_AUTOGEN_CONFIG_VERSION) {
    throw new ToolError(
      `Please restart this tool, configuration schema has changed ` +
      `from ${LATEST_AUTOGEN_CONFIG_VERSION} to ${config.version}`
    );
  }
  return config;
}

export function loadAutogenConfig(filename: string): AutogenConfig {
  const contents = fs.readFileSync(filename, { encoding: 'utf-8' });
  try {
    return validateBasicConfig(toml.parse(contents));
  } catch (e) {
    throw new ToolError(`Error parsing ${filename}: ${e}`);
  }
}
