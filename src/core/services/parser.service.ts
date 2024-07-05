/**
 * Import will remove at compile time
 */

import type { CodeDeclaration } from '@core/services/interfaces/parse.interface';

/**
 * Imports
 */

import ts from 'typescript';

/**
 * Extracts function names, class names, and variable names from a TypeScript AST node.
 *
 * @param node The TypeScript AST node to extract names from.
 * @param functions Array to store extracted function names.
 * @param classes Array to store extracted class names.
 * @param variables Array to store extracted variable names.
 */

function extractNames(node: ts.Node, functions: string[], classes: string[], variables: string[]) {
    if (ts.isFunctionDeclaration(node) && node.name) {
        functions.push(node.name.getText());
    } else if (ts.isClassDeclaration(node) && node.name) {
        classes.push(node.name.getText());
    } else if (ts.isVariableDeclaration(node) && node.name) {
        if (node.initializer && ts.isClassExpression(node.initializer)) {
            // Handle anonymous class assigned to a variable
            classes.push(node.name.getText());
        } else if (node.initializer && ts.isArrowFunction(node.initializer)) {
            functions.push(node.name.getText());
        } else if (node.initializer && ts.isFunctionExpression(node.initializer)) {
            // Handle function expression assigned to a variable
            functions.push(node.name.getText());
        } else {
            variables.push(node.name.getText());
        }
    }
}

/**
 * Recursively visits each node in the TypeScript AST to extract function names, class names, and variable names.
 *
 * @param node The current TypeScript AST node to visit.
 * @param functions Array to store extracted function names.
 * @param classes Array to store extracted class names.
 * @param variables Array to store extracted variable names.
 */

function visitNode(node: ts.Node, functions: string[], classes: string[], variables: string[]) {
    extractNames(node, functions, classes, variables);

    ts.forEachChild(node, (childNode) => {
        visitNode(childNode, functions, classes, variables);
    });
}

/**
 * Parses JavaScript code to extract function names, class names, and variable names.
 *
 * @param jsCode The JavaScript code from which names will be extracted.
 * @returns A `CodeDeclaration` object containing arrays of functions, classes, and variables.
 */

export function parse(jsCode: string): CodeDeclaration {
    const sourceFile = ts.createSourceFile('', jsCode, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);

    const classes: string[] = [];
    const functions: string[] = [];
    const variables: string[] = [];

    visitNode(sourceFile, functions, classes, variables);

    return {
        classes,
        functions,
        variables
    };
}
