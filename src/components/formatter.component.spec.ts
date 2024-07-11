import { formatCode, formatErrorCode } from '@components/formatter.component';

describe('formatCode', () => {
    test('should format code with default options', () => {
        const code = 'line1\nline2\nline3';
        const result = formatCode(code);

        expect(result).toBe('      1 | line1\n      2 | line2\n      3 | line3');
    });

    test('should format code with custom padding and start line', () => {
        const code = 'line1\nline2\nline3';
        const options = { padding: 5, startLine: 2 };
        const result = formatCode(code, options);

        expect(result).toBe(' 3 | line1\n 4 | line2\n 5 | line3');
    });

    test('should apply custom action to specific line', () => {
        const code = 'line1\nline2\nline3';
        const options = {
            padding: 5,
            startLine: 2,
            action: {
                triggerLine: 4,
                callback: (lineString: string, padding: number, line: number) => `* ${ line } | ${ lineString }`
            }
        };
        const result = formatCode(code, options);

        expect(result).toBe(' 3 | line1\n* 4 |  4 | line2\n 5 | line3');
    });
});


describe('formatErrorCode', () => {
    test('should format code with error highlight with custom color', () => {
        const code = 'line1\nline2\nline3';
        const sourcePosition = {
            code,
            line: 3,
            column: 4,
            name: '',
            source: '',
            endLine: 3,
            startLine: 1
        };
        const ansiOption = {
            color: '\x1b[38;5;160m',
            reset: '\x1b[0m'
        };

        const result = formatErrorCode(sourcePosition, ansiOption);
        expect(result).toBe('      2 | line1\n    \u001b[38;5;160m>\u001b[0m 3 | line2\n        |    \u001b[38;5;160m^\u001b[0m\n      4 | line3');
    });

    test('should format code with error highlight', () => {
        const code = 'line1\nline2\nline3';
        const sourcePosition = {
            code,
            line: 2,
            name: '',
            source: '',
            column: 4,
            endLine: 3,
            startLine: 0
        };

        expect(formatErrorCode(sourcePosition)).toBe('      1 | line1\n    > 2 | line2\n        |    ^\n      3 | line3');
    });

    test('should throw an error for invalid line number', () => {
        const sourcePosition = {
            code: 'line1\nline2\nline3',
            line: 4,  // Out of range
            column: 2,
            startLine: 5
        };

        expect(() => formatErrorCode(<any>sourcePosition)).toThrow('Invalid line or column number.');
    });

    test('should throw an error for invalid column number', () => {
        const sourcePosition = {
            code: 'line1\nline2\nline3',
            line: 2,
            column: -1,  // Invalid column number
            startLine: 1
        };

        expect(() => formatErrorCode(<any>sourcePosition)).toThrow('Invalid line or column number.');
    });
});
