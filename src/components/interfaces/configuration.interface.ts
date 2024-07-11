/**
 * Interface representing the configuration options.
 */

export interface ConfigurationInterface {
    /**
     * Array of strings representing the file types to be included.
     */

    fileType: Array<string>;

    /**
     * Specifies the maximum number of test suites that can run in parallel.
     *
     * This property controls the level of parallelism during test execution, which can help
     * in managing resource usage and improving performance by limiting the number of suites
     * that are executed concurrently.
     *
     * @default 1
     */

    limitParallelSuites: number;

    /**
     * Initializes the Transportation and sets up necessary resources.
     *
     * @param event - A callback function that is called when data is received.
     *                It accepts a single parameter `respond` which is a string.
     * @returns A promise that resolves when the initialization is complete.
     */

    init?: (event: (respond: string) => void) => Promise<void>;

    /**
     * Closes the Transportation and releases any resources.
     *
     * @returns A promise that resolves when the resources have been released and cleanup is complete.
     */

    close?: () => Promise<void>;

    /**
     * Executes a given code on the server or context.
     *
     * @param code - The code to execute, provided as a string.
     * @returns A promise that resolves when the code execution is complete.
     */

    execCode?: (code: string) => Promise<void>;
}
