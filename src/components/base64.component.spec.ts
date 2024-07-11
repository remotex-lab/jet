import { decode, decodeVLQ, encode, encodeArrayVLQ, encodeVLQ } from '@components/base64.component';

describe('Base64 Encoding/Decoding', () => {
    test('encode should convert string to Base64', () => {
        const input = 'Hello, World!';
        const expected = 'SGVsbG8sIFdvcmxkIQ==';
        expect(encode(input)).toBe(expected);
    });

    test('decode should convert Base64 string back to original string', () => {
        const input = 'SGVsbG8sIFdvcmxkIQ==';
        const expected = 'Hello, World!';
        expect(decode(input)).toBe(expected);
    });
});

describe('VLQ Encoding/Decoding', () => {
    test('encodeVLQ should correctly encode positive numbers', () => {
        expect(encodeVLQ(0)).toBe('A');
        expect(encodeVLQ(1)).toBe('C');
        expect(encodeVLQ(18)).toBe('kB');
    });

    test('encodeVLQ should correctly encode negative numbers', () => {
        expect(encodeVLQ(-1)).toBe('D');
        expect(encodeVLQ(-10)).toBe('V');
    });

    test('encodeArrayVLQ should correctly encode an array of numbers', () => {
        const input = [ 0, 1, -1, -18, 18, -18 ];
        const expected = 'ACDlBkBlB';
        expect(encodeArrayVLQ(input)).toBe(expected);
    });

    test('decodeVLQ should correctly decode a VLQ encoded string to an array of numbers', () => {
        const input = 'ACDlBkBlB';
        const expected = [ 0, 1, -1, -18, 18, -18 ];
        expect(decodeVLQ(input)).toEqual(expected);
    });

    test('decodeVLQ should throw an error for invalid Base64 characters', () => {
        expect(() => decodeVLQ('!@#')).toThrow('Invalid Base64 character: !');
    });
});
