import { config, defaultConfiguration } from '@components/configuration.component';

describe('config', () => {
    test('should return default configuration when no user configuration is provided', () => {
        const result = config({});
        expect(result).toEqual(defaultConfiguration);
    });

    test('should merge user configuration with default settings', () => {
        const userConfig = {
            fileType: [ '*.test.ts' ],
            limitParallelSuites: 5
        };
        const result = config(userConfig);
        expect(result).toEqual({
            fileType: [ '*.test.ts' ],
            limitParallelSuites: 5
        });
    });

    test('should partially override default settings', () => {
        const userConfig = {
            limitParallelSuites: 1
        };
        const result = config(userConfig);
        expect(result).toEqual({
            fileType: [ '*.spec.ts' ],
            limitParallelSuites: 1
        });
    });

    test('should handle additional user-defined properties', () => {
        const userConfig = {
            fileType: [ '*.custom.ts' ],
            limitParallelSuites: 1,
            customProperty: 'customValue'
        };
        const result = config(userConfig);
        expect(result).toEqual({
            fileType: [ '*.custom.ts' ],
            limitParallelSuites: 1,
            customProperty: 'customValue'
        });
    });
});
