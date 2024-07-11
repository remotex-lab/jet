import type { PositionSourceInterface } from '@core/services/interfaces/source.interface';
import type { HighlightSchemeInterface } from '@components/interfaces/highlighter.interface';

import * as ts from 'typescript';
import { CodeHighlighter, Colors, FormatHighlightErrorCode, highlightCode } from '@components/highlighter.component';

const schema = {
    enumColor: Colors.burntOrange,
    typeColor: Colors.lightGoldenrodYellow,
    classColor: Colors.lightOrange,
    stringColor: Colors.oliveGreen,
    keywordColor: Colors.lightCoral,
    commentColor: Colors.darkGray,
    functionColor: Colors.lightOrange,
    variableColor: Colors.burntOrange,
    interfaceColor: Colors.lightGoldenrodYellow,
    parameterColor: Colors.deepOrange,
    getAccessorColor: Colors.lightYellow,
    numericLiteralColor: Colors.lightGray,
    methodSignatureColor: Colors.burntOrange,
    regularExpressionColor: Colors.oliveGreen,
    propertyAssignmentColor: Colors.canaryYellow,
    propertyAccessExpressionColor: Colors.lightYellow,
    expressionWithTypeArgumentsColor: Colors.lightOrange
};

describe('highlightCode', () => {
    beforeEach(() => {
    });

    test('should highlight keywords in the code', () => {
        const code = 'const x = 42;';
        const highlightedCode = highlightCode(code, { keywordColor: Colors.brightPink });

        expect(highlightedCode).toContain(Colors.brightPink);
        expect(highlightedCode).toContain('const');
        expect(highlightedCode).toContain(Colors.reset);
    });

    test('should highlight string literals in the code', () => {
        const code = 'const str = "hello";';
        const highlightedCode = highlightCode(code, { stringColor: Colors.oliveGreen });
        expect(highlightedCode).toContain(Colors.oliveGreen);
        expect(highlightedCode).toContain('"hello"');
        expect(highlightedCode).toContain(Colors.reset);
    });

    test('should highlight comments in the code', () => {
        const code = '// this is a comment\nconst x = 42;';
        const highlightedCode = highlightCode(code, { commentColor: Colors.darkGray });
        expect(highlightedCode).toContain(Colors.darkGray);
        expect(highlightedCode).toContain('// this is a comment');
        expect(highlightedCode).toContain(Colors.reset);
    });

    test('should use default scheme when no schema is provided', () => {
        const code = 'const x: number = 42;';
        const highlightedCode = highlightCode(code, { keywordColor: Colors.lightCoral });
        expect(highlightedCode).toContain(Colors.burntOrange); // variableColor
        expect(highlightedCode).toContain(Colors.lightGoldenrodYellow); // typeColor
        expect(highlightedCode).toContain(Colors.lightCoral); // keywordColor
        expect(highlightedCode).toContain(Colors.reset);
    });

    test('should combine segments correctly when segment.start < parent.end', () => {
        const code = 'const x: Promise<string>;';
        const result = highlightCode(code, schema);

        expect(result).toBe(
            '\u001b[38;5;203mconst\u001b[0m \u001b[38;5;208mx\u001b[0m: \u001b[38;5;221mPromise\u001b[0m<\u001b[38;5;221mstring\u001b[0m>;'
        );
    });

    test('should correctly highlight template strings with embedded expressions', () => {
        const code = 'const x: string = `dat to validate ${ this.name } end string`';
        const result = highlightCode(code, schema);

        expect(result).toBe(
            '\u001b[38;5;203mconst\u001b[0m \u001b[38;5;208mx\u001b[0m: \u001b[38;5;221mstring\u001b[0m = \u001b[38;5;149m`dat to validate ${\u001b[0m ' +
            '\u001b[38;5;203mthis\u001b[0m.\u001b[38;5;230mname\u001b[0m \u001b[38;5;149m} end string`\u001b[0m'
        );
    });
});

describe('FormatHighlightErrorCode', () => {
    const mockSourcePosition: PositionSourceInterface = {
        code: 'const x: number = 42;',
        line: 1,
        name: null,
        column: 5,
        source: 'temp.ts',
        endLine: 1,
        startLine: 1
    };

    test('should format and highlight error code', () => {
        const formattedCode = FormatHighlightErrorCode(mockSourcePosition, { keywordColor: Colors.brightPink });
        expect(formattedCode).toContain(Colors.brightPink);
        expect(formattedCode).toContain('const');
        expect(formattedCode).toContain(Colors.reset);
    });

    test('should apply the custom schema', () => {
        const schema: Partial<HighlightSchemeInterface> = { stringColor: Colors.oliveGreen };
        mockSourcePosition.code = 'const str = "hello";';
        const formattedCode = FormatHighlightErrorCode(mockSourcePosition, schema);
        expect(formattedCode).toContain(Colors.oliveGreen);
        expect(formattedCode).toContain('"hello"');
        expect(formattedCode).toContain(Colors.reset);
    });
});

describe('Process Identifier', () => {
    let highlighter: CodeHighlighter;
    const mockAddSegment = jest.fn();

    beforeEach(() => {
        highlighter = new CodeHighlighter(<any>{}, '', schema); // Initialize your highlighter class
        (<any> highlighter).addSegment = mockAddSegment; // Mock the addSegment method
    });

    const testCases = [
        { kind: ts.SyntaxKind.EnumMember, color: schema.enumColor },
        { kind: ts.SyntaxKind.CallExpression, color: schema.variableColor },
        { kind: ts.SyntaxKind.EnumDeclaration, color: schema.variableColor },
        { kind: ts.SyntaxKind.PropertySignature, color: schema.variableColor },
        { kind: ts.SyntaxKind.ModuleDeclaration, color: schema.variableColor },
        { kind: ts.SyntaxKind.InterfaceDeclaration, color: schema.interfaceColor },
        { kind: ts.SyntaxKind.GetAccessor, color: schema.getAccessorColor },
        { kind: ts.SyntaxKind.PropertyAssignment, color: schema.propertyAssignmentColor },
        { kind: ts.SyntaxKind.MethodSignature, color: schema.methodSignatureColor },
        { kind: ts.SyntaxKind.MethodDeclaration, color: schema.functionColor },
        { kind: ts.SyntaxKind.FunctionDeclaration, color: schema.functionColor },
        { kind: ts.SyntaxKind.ClassDeclaration, color: schema.classColor },
        { kind: ts.SyntaxKind.Parameter, color: schema.parameterColor },
        { kind: ts.SyntaxKind.VariableDeclaration, color: schema.variableColor },
        { kind: ts.SyntaxKind.PropertyDeclaration, color: schema.variableColor },
        { kind: ts.SyntaxKind.ExpressionWithTypeArguments, color: schema.expressionWithTypeArgumentsColor },
        { kind: ts.SyntaxKind.BreakStatement, color: schema.variableColor },
        { kind: ts.SyntaxKind.ShorthandPropertyAssignment, color: schema.variableColor },
        { kind: ts.SyntaxKind.BindingElement, color: schema.variableColor },
        { kind: ts.SyntaxKind.BinaryExpression, color: schema.variableColor },
        { kind: ts.SyntaxKind.SwitchStatement, color: schema.variableColor },
        { kind: ts.SyntaxKind.TemplateSpan, color: schema.variableColor },
        { kind: ts.SyntaxKind.TypeReference, color: schema.typeColor },
        { kind: ts.SyntaxKind.TypeAliasDeclaration, color: schema.typeColor },
        { kind: ts.SyntaxKind.NewExpression, color: schema.variableColor }
    ];

    testCases.forEach(({ kind, color }) => {
        test(`should add segment for ${ts.SyntaxKind[kind]} nodes`, () => {
            // Create a mock node for each kind
            const mockNode = {
                getStart: jest.fn().mockReturnValue(0),
                getEnd: jest.fn().mockReturnValue(10),
                kind: ts.SyntaxKind.Identifier,
                parent: {
                    kind: kind // Assuming parent kind is the same for simplicity
                }
            };

            // Call the method that processes the node
            (<any> highlighter).processNode(mockNode);

            // Verify that addSegment is called with the correct parameters
            expect(mockAddSegment).toHaveBeenCalledWith(0, 10, color);
        });
    });

    test('should add segment with variableColor when parent text matches node text', () => {
        const mockNode = {
            getStart: jest.fn().mockReturnValue(0),
            getEnd: jest.fn().mockReturnValue(10),
            getText: jest.fn().mockReturnValue('propertyAccess'),
            kind: ts.SyntaxKind.Identifier,
            parent: {
                kind: ts.SyntaxKind.PropertyAccessExpression,
                getChildAt: jest.fn().mockReturnValue({
                    getText: jest.fn().mockReturnValue('propertyAccess')
                })
            }
        };

        // Call the method that processes the node
        (<any> highlighter).processNode(mockNode);

        // Verify that addSegment is called with the correct parameters
        expect(mockAddSegment).toHaveBeenCalledWith(0, 10, schema.variableColor);
    });

    test('should add segment with propertyAccessExpressionColor when parent text does not match node text', () => {
        const mockNode = {
            getStart: jest.fn().mockReturnValue(0),
            getEnd: jest.fn().mockReturnValue(10),
            getText: jest.fn().mockReturnValue('propertyAccess'),
            kind: ts.SyntaxKind.Identifier,
            parent: {
                kind: ts.SyntaxKind.PropertyAccessExpression,
                getChildAt: jest.fn().mockReturnValue({
                    getText: jest.fn().mockReturnValue('differentText')
                })
            }
        };

        // Call the method that processes the node
        (<any> highlighter).processNode(mockNode);

        // Verify that addSegment is called with the correct parameters
        expect(mockAddSegment).toHaveBeenCalledWith(0, 10, schema.propertyAccessExpressionColor);
    });
});

describe('Process Node', () => {
    let highlighter: CodeHighlighter;
    const mockAddSegment = jest.fn();

    beforeEach(() => {
        highlighter = new CodeHighlighter(<any>{}, '', schema); // Initialize your highlighter class
        (<any> highlighter).addSegment = mockAddSegment; // Mock the addSegment method
    });

    const testCases = [
        { kind: ts.SyntaxKind.TypeParameter, color: schema.typeColor, end: 4 },
        { kind: ts.SyntaxKind.RegularExpressionLiteral, color: schema.regularExpressionColor, end: 10 }
    ];

    testCases.forEach(({ kind, color, end }) => {
        test(`should add segment for ${ts.SyntaxKind[kind]} nodes`, () => {
            // Create a mock node for each kind
            const mockNode = {
                getStart: jest.fn().mockReturnValue(0),
                getEnd: jest.fn().mockReturnValue(10),
                kind,
                name: {
                    text: '1234'
                }
            };

            // Call the method that processes the node
            (<any> highlighter).processNode(mockNode);

            // Verify that addSegment is called with the correct parameters
            expect(mockAddSegment).toHaveBeenCalledWith(0, end, color);
        });
    });
});