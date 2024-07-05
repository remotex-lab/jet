/**
 * Global declarations for dynamic exports and source map mappings.
 * These declarations define global variables for managing dynamic
 * @global
 */

declare global {
    /**
     * Global object for storing dynamically exported functions and classes.
     */

    const __exports__: {
        [key: string | symbol]: (...args: Array<unknown>) => unknown;
    };

    /**
     * Global object for storing mappings between transpiled code names and original source names.
     */

    const __maps__: {
        [key: string | symbol]: string;
    };
}

export {};
