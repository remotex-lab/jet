/**
 * Represents a collection of code declarations extracted from JavaScript code.
 */

export interface CodeDeclaration {
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
