/**
 * Import will remove at compile time
 */

import type { ConfigurationInterface } from '@components/interfaces/configuration.interface';

/**
 * The default configuration settings.
 *
 * @constant defaultConfiguration
 * @property fileType - An array of strings representing the default file types to be included.
 * @property parallelSuites - A boolean flag indicating whether test suites should run in parallel by default.
 */

export const defaultConfiguration: ConfigurationInterface = {
    fileType: [ '*.spec.ts' ],
    limitParallelSuites: 1,
};

/**
 * Function to merge user-provided configuration with default settings.
 *
 * @param configuration - Partial configuration object provided by the user.
 * @returns The complete configuration object after merging defaults with user-provided values.
 */

export function config(configuration: Partial<ConfigurationInterface> = {}): ConfigurationInterface {
    return {
        ...defaultConfiguration,
        ...configuration
    };
}
