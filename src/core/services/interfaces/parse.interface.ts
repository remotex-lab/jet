/**
 * Represents a collection of code declarations extracted from JavaScript code.
 */

export interface CodeDeclarationInterface {
    /**
     * Array of function names declared in the code.
     */

    classes: Array<string>;

    /**
     * Array of class names declared in the code.
     */

    functions: Array<string>;

    /**
     * Array of variable names declared in the code.
     */

    variables: Array<string>;
}

/**
 * Represents an entry in the stack trace.
 */

export interface StackInterface {
    /**
     * The function or method where the error occurred.
     */

    at: string;

    /**
     * The file path where the error occurred.
     */

    file: string;

    /**
     * The line number where the error occurred.
     */

    line: number;

    /**
     * The column number where the error occurred.
     */

    column: number;
}

/**
 * Represents a detailed entry in the stack trace, which may include an executor stack entry.
 */

export interface StackEntryInterface extends StackInterface {
    /**
     * The executor information if the error occurred within an eval function.
     * This will be `null` if the error did not occur within an eval function.
     */

    executor?: StackInterface | null;
}
