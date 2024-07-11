/**
 * Import will remove at compile time
 */

import type { MappingInterface, PositionInterface, SourceMapInterface } from '@core/services/interfaces/source.interface';

/**
 * Imports
 */

import { SourceService } from '@core/services/source.service';
import { Bias } from '@core/services/interfaces/source.interface';

describe('SourceService', () => {
    const validSourceMap: SourceMapInterface = {
        version: 3,
        names: [],
        sources: [ 'test.ts' ],
        sourcesContent: [ '// source content' ],
        mappings: 'AAAA,EAAE,CAAC,CAAC,SAAS,CAAC,CAAC,IAAI,CAAC,SAAS,CAAC,CAAC,CAAC;;AACxB,EAAE,CAAC,CAAC,OAAO,CAAC,CAAC,CAAC'
    };

    describe('constructor', () => {
        test('should validate the source map', () => {
            const invalidSourceMap: any = {}; // Invalid object

            expect(() => new SourceService(invalidSourceMap)).toThrowError(
                'Missing required keys in SourceMap.'
            );
        });

        test('should assign empty arrays for missing optional properties', () => {
            const sourceMap: any = {
                version: 3,
                mappings: '',
                names: null,
                sources: null,
                sourcesContent: null
            };

            const service: any = new SourceService(sourceMap);

            expect(service.names).toEqual([]);
            expect(service.sources).toEqual([]);
            expect(service.mappings).toEqual([]);
            expect(service.sourcesContent).toEqual([]);
        });

        test('should assign properties from valid source map', () => {
            const sourceMap: SourceMapInterface = {
                version: 3,
                names: [ 'name1', 'name2' ],
                sources: [ 'source1.js', 'source2.js' ],
                mappings: '',
                sourcesContent: [ '// content 1', '// content 2' ]
            };

            const service: any = new SourceService(sourceMap);

            expect(service.names).toEqual(sourceMap.names);
            expect(service.sources).toEqual(sourceMap.sources);
            expect(service.sourcesContent).toEqual(sourceMap.sourcesContent);
        });
    });

    describe('decodeMappings', () => {
        let service: SourceService;
        let decodedSegmentMock: jest.SpyInstance;

        beforeEach(() => {
            const sourceMap: SourceMapInterface = {
                version: 3,
                names: [],
                sources: [],
                sourcesContent: [],
                mappings: ''
            };

            service = new SourceService(sourceMap);

            // Mock the private method decodedSegment
            decodedSegmentMock = jest.spyOn(service as any, 'decodedSegment');
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('should decode and process mappings correctly', () => {
            const sourceMap: SourceMapInterface = {
                version: 3,
                names: [],
                sources: [],
                sourcesContent: [],
                mappings: ';;;AAAA,CAAC;;AACA'
            };

            (service as any).mappings = [];
            (service as any).decodeMappings(sourceMap);

            expect(decodedSegmentMock).toHaveBeenCalledTimes(3);
            expect(decodedSegmentMock).toHaveBeenCalledWith(expect.any(Object), [ 0, 0, 0, 0 ], 4);
            expect(decodedSegmentMock).toHaveBeenCalledWith(expect.any(Object), [ 1, 0, 0, 1 ], 4);
            expect(decodedSegmentMock).toHaveBeenCalledWith(expect.any(Object), [ 0, 0, 1, 0 ], 6);
            expect((service as any).mappings).toEqual([
                {
                    'generatedColumn': 1,
                    'generatedLine': 4,
                    'nameIndex': null,
                    'sourceColumn': 1,
                    'fileIndex': 0,
                    'sourceLine': 1
                },
                {
                    'generatedColumn': 2,
                    'generatedLine': 4,
                    'nameIndex': null,
                    'sourceColumn': 2,
                    'fileIndex': 0,
                    'sourceLine': 1
                },
                {
                    'generatedColumn': 1,
                    'generatedLine': 6,
                    'nameIndex': null,
                    'sourceColumn': 2,
                    'fileIndex': 0,
                    'sourceLine': 2
                }
            ]);
        });

        test('should throw an error if decoding fails', () => {
            const sourceMap: SourceMapInterface = {
                version: 3,
                names: [],
                sources: [],
                sourcesContent: [],
                mappings: 'AAAA,CAAC;AACA\n\r\d;;AACA'
            };

            expect(() => {
                (service as any).mappings = [];
                (service as any).decodeMappings(sourceMap);
            }).toThrow(/Error decoding mappings: Invalid Base64 character:/);
        });
    });

    describe('getSourcePosition', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('should return source code in right position of and error', () => {
            const sourceMap: SourceMapInterface = {
                'version': 3,
                'sources': [ 'src/x.spec.ts' ],
                'sourcesContent': [ 'function name(data: string) {\n    console.log(\'name\' + data);\n    throw new Error(\'xxxxxxxxxx\');\n}\n\nname(\'x\');\n' ],
                'mappings': ';;;AAAA,SAAS,KAAK,MAAc;AACxB,UAAQ,IAAI,SAAS,IAAI;AACzB,QAAM,IAAI,MAAM,YAAY;AAChC;AAEA,KAAK,GAAG;',
                'names': []
            };

            const service = new SourceService(sourceMap);
            const mockFindMapping = jest.spyOn(service, <any>'findMapping');
            const position = service.getSourcePosition(6, 9);

            expect(mockFindMapping).toHaveBeenCalledWith(6, 9, Bias.LOWER_BOUND);
            expect(position?.code.trim()).toContain('throw new Error(\'xxxxxxxxxx\')');
            expect(position).toEqual({
                code: expect.any(String),
                line: 3,
                column: 11,
                endLine: 7,
                startLine: 0,
                name: null,
                source: 'src/x.spec.ts'
            });
        });

        test('should return null if no mapping is found', () => {
            const sourceMap: SourceMapInterface = {
                version: 3,
                names: [],
                sources: [],
                sourcesContent: [],
                mappings: 'AAAA,CAAC;AACA;;AACA'
            };

            const service = new SourceService(sourceMap);
            const mockFindMapping = jest.spyOn(service, <any>'findMapping');
            const position = service.getSourcePosition(10, 5);

            expect(position).toBeNull();
            expect(mockFindMapping).toHaveBeenCalledWith(10, 5, Bias.LOWER_BOUND);
        });

        test('should return source information for a valid mapping with LOWER_BOUND', () => {
            const service = new SourceService(validSourceMap);
            const mockFindMapping = jest.spyOn(service, <any>'findMapping');
            const position = service.getSourcePosition(3, 10);

            expect(mockFindMapping).toHaveBeenCalledWith(3, 10, Bias.LOWER_BOUND);
            expect(position).toEqual({
                code: '// source content',
                line: 2,
                column: 13,
                endLine: 6,
                startLine: 0,
                name: null,
                source: 'test.ts'
            });
        });

        test('should return NULL for a valid mapping with BOUND and invalid position', () => {
            const service = new SourceService(validSourceMap);
            const mockFindMapping = jest.spyOn(service, <any>'findMapping');
            const position = service.getSourcePosition(3, 10, { bias: Bias.BOUND });

            expect(position).toBeNull();
            expect(mockFindMapping).toHaveBeenCalledWith(3, 10, Bias.BOUND);
        });

        test('should return NULL for a valid mapping with BOUND and valid position', () => {
            const service = new SourceService(validSourceMap);
            const mockFindMapping = jest.spyOn(service, <any>'findMapping');
            const position = service.getSourcePosition(3, 4, { bias: Bias.BOUND });

            expect(mockFindMapping).toHaveBeenCalledWith(3, 4, Bias.BOUND);
            expect(position).toEqual({
                code: '// source content',
                line: 2,
                column: 12,
                endLine: 6,
                startLine: 0,
                name: null,
                source: 'test.ts'
            });
        });

        test('should return source information for a valid mapping with UPPER_BOUND', () => {
            const service = new SourceService(validSourceMap);
            const mockFindMapping = jest.spyOn(service, <any>'findMapping');
            const position = service.getSourcePosition(3, 10, { bias: Bias.UPPER_BOUND });

            expect(mockFindMapping).toHaveBeenCalledWith(3, 10, Bias.UPPER_BOUND);
            expect(position).toEqual({
                code: '// source content',
                line: 2,
                column: 20,
                endLine: 6,
                startLine: 0,
                name: null,
                source: 'test.ts'
            });
        });
    });

    describe('getPosition', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        let mockSourceMap;
        let sourceService: SourceService;

        beforeEach(() => {
            mockSourceMap = {
                version: 3,
                names: [ 'name1', 'name2' ],
                sources: [ 'source1.js', 'source2.js' ],
                mappings: 'AAAA;AACA;AACA',
                sourcesContent: [ 'console.log("source1");', 'console.log("source2");' ]
            };
            sourceService = new SourceService(mockSourceMap);
        });

        test('should return correct position with given line, column and bias', () => {
            const findMappingSpy = jest.spyOn(sourceService as any, 'findMapping').mockReturnValue({
                sourceLine: 1,
                sourceColumn: 2,
                nameIndex: 0,
                fileIndex: 0,
                generatedLine: 1,
                generatedColumn: 2
            });

            const position = sourceService.getPosition(1, 2);

            expect(findMappingSpy).toHaveBeenCalledWith(1, 2, Bias.LOWER_BOUND);
            expect(position).toEqual<PositionInterface>({
                line: 1,
                column: 2,
                name: 'name1',
                source: 'source1.js'
            });
        });

        test('should return null if no mapping is found', () => {
            jest.spyOn(sourceService as any, 'findMapping').mockReturnValue(null);
            const position = sourceService.getPosition(1, 2);

            expect(position).toBeNull();
        });

        test('should use specified bias when provided', () => {
            const findMappingSpy = jest.spyOn(sourceService as any, 'findMapping').mockReturnValue({
                sourceLine: 1,
                sourceColumn: 2,
                nameIndex: 0,
                fileIndex: 0,
                generatedLine: 1,
                generatedColumn: 2
            });

            const position = sourceService.getPosition(1, 2, Bias.UPPER_BOUND);

            expect(findMappingSpy).toHaveBeenCalledWith(1, 2, Bias.UPPER_BOUND);
            expect(position).toEqual<PositionInterface>({
                line: 1,
                column: 2,
                name: 'name1',
                source: 'source1.js'
            });
        });

        test('should return null if no mapping is found', () => {
            const service = new SourceService(validSourceMap);
            const mockFindMapping = jest.spyOn(service, <any>'findMapping');
            const position = service.getPosition(10, 1950);

            expect(position).toBeNull();
            expect(mockFindMapping).toHaveBeenCalledWith(10, 1950, Bias.LOWER_BOUND);
        });

        test('should return position information for a valid mapping', () => {
            const sourceMap: SourceMapInterface = {
                version: 3,
                mappings: '',
                sources: [ 'source.js' ],
                names: [ 'functionName' ],
                sourcesContent: [ 'x' ]
            };
            const service = new SourceService(sourceMap);

            const mockMapping: MappingInterface = {
                fileIndex: 0,
                sourceLine: 5,
                sourceColumn: 10,
                nameIndex: 0,
                generatedLine: 0,
                generatedColumn: 0
            };

            const mockFindMapping = jest.spyOn(service, <any>'findMapping').mockReturnValueOnce(mockMapping);
            const position = service.getPosition(1, 1);

            expect(position).toEqual({
                line: 5,
                column: 10,
                name: 'functionName',
                source: 'source.js'
            });

            expect(mockFindMapping).toHaveBeenCalledWith(1, 1, Bias.LOWER_BOUND);
        });
    });

    describe('findMapping', () => {
        let service: SourceService;

        beforeEach(() => {
            // Initialize SourceService instance and mappings array for testing
            const sourceMap = {
                version: 3,
                names: [],
                sources: [],
                sourcesContent: [],
                mappings: ''
            };
            service = new SourceService(sourceMap);
            // Populate mappings array with mock data
            (<any>service)['mappings'] = [
                { generatedLine: 1, generatedColumn: 5, fileIndex: 0 },
                { generatedLine: 3, generatedColumn: 6, fileIndex: 1 },
                { generatedLine: 3, generatedColumn: 10, fileIndex: 1 },
                { generatedLine: 5, generatedColumn: 15, fileIndex: 2 },
                { generatedLine: 7, generatedColumn: 20, fileIndex: 3 },
                { generatedLine: 9, generatedColumn: 25, fileIndex: 4 }
            ];
        });

        test('should find the exact mapping when it exists', () => {
            const targetLine = 5;
            const targetColumn = 15;
            const result = service['findMapping'](targetLine, targetColumn);

            expect(result).toEqual({ generatedLine: 5, generatedColumn: 15, fileIndex: 2 });
        });

        test('should return null if no mapping matches', () => {
            const targetLine = 6;
            const targetColumn = 15;
            const result = service['findMapping'](targetLine, targetColumn);

            expect(result).toBeNull();
        });

        test('should handle Bias.LOWER_BOUND correctly', () => {
            const targetLine = 3;
            const targetColumn = 8;
            const result = service['findMapping'](targetLine, targetColumn, Bias.LOWER_BOUND);

            expect(result).toEqual({ generatedLine: 3, generatedColumn: 6, fileIndex: 1 });
        });

        test('should handle Bias.UPPER_BOUND correctly', () => {
            const targetLine = 3;
            const targetColumn = 8;
            const result = service['findMapping'](targetLine, targetColumn, Bias.UPPER_BOUND);

            expect(result).toEqual({ generatedLine: 3, generatedColumn: 10, fileIndex: 1 });
        });

        test('should handle Bias.BOUND correctly when only line matches', () => {
            const targetLine = 3;
            const targetColumn = 12;

            const result = service['findMapping'](targetLine, targetColumn);

            expect(result).toBeNull();
        });

        test('should handle Bias.BOUND correctly when line and column do not match', () => {
            const targetLine = 4;
            const targetColumn = 12;

            const result = service['findMapping'](targetLine, targetColumn);

            expect(result).toBeNull();
        });

        test('should find the mapping for a line before the middle index', () => {
            const service = new SourceService(validSourceMap);
            const mappings: any = [
                { sourceLine: 2, generatedLine: 1, generatedColumn: 1 }, // Before target line
                { sourceLine: 5, generatedLine: 2, generatedColumn: 1 } // After target line
            ];
            (<any>service).mappings = mappings;

            const position = (<any>service).findMapping(1, 1);
            expect(position).toEqual(mappings[0]); // Mapping before target line
        });
    });

    describe('concat', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('should merge multiple source maps into the current source map object', () => {
            const sourceMap1: SourceMapInterface = {
                version: 3,
                names: [ 'name1' ],
                sources: [ 'source1.js' ],
                sourcesContent: [ 'console.log("source1");' ],
                mappings: 'AAAA'
            };

            const sourceMap2: SourceMapInterface = {
                version: 3,
                names: [ 'name2' ],
                sources: [ 'source2.js' ],
                sourcesContent: [ 'console.log("source2");' ],
                mappings: 'AAAA,AAAA'
            };

            const sourceService = new SourceService(sourceMap1);
            // Create a mock implementation for decodeMappings since it's a private method
            const mockDecodeMappings = jest.spyOn(sourceService as any, 'decodeMappings');

            // Call the concat method
            sourceService.concat(sourceMap2);

            // Check if the names, sources, and sourcesContent have been correctly concatenated
            expect(sourceService['names']).toEqual([ 'name1', 'name2' ]);
            expect(sourceService['sources']).toEqual([ 'source1.js', 'source2.js' ]);
            expect(sourceService['sourcesContent']).toEqual([ 'console.log("source1");', 'console.log("source2");' ]);

            // Check if decodeMappings was called with the correct arguments
            expect(mockDecodeMappings).toHaveBeenCalledWith(sourceMap2, {
                nameIndex: 1,
                fileIndex: 1,
                generatedLine: 2
            });

            expect((<any>sourceService).mappings).toEqual([
                {
                    'fileIndex': 0,
                    'generatedColumn': 1,
                    'generatedLine': 1,
                    'nameIndex': null,
                    'sourceColumn': 1,
                    'sourceLine': 1
                },
                {
                    'fileIndex': 1,
                    'generatedColumn': 1,
                    'generatedLine': 2,
                    'nameIndex': null,
                    'sourceColumn': 1,
                    'sourceLine': 1
                },
                {
                    'fileIndex': 1,
                    'generatedColumn': 1,
                    'generatedLine': 2,
                    'nameIndex': null,
                    'sourceColumn': 1,
                    'sourceLine': 1
                }
            ]);
        });

        test('should throw an error if no source maps are provided', () => {
            const sourceMap: SourceMapInterface = {
                version: 3,
                names: [],
                sources: [],
                sourcesContent: [],
                mappings: ''
            };

            const sourceService = new SourceService(sourceMap);

            // Check if the method throws an error when called without arguments
            expect(() => sourceService.concat()).toThrow('At least one map must be provided for concatenation.');
        });

        test('should merge multiple source maps into the current source map object2', () => {
            const map1 = {
                version: 3,
                sources: [ 'src/testx.ts' ],
                sourcesContent: [
                    '\n' +
                    '\n' +
                    'function ts() {\n' +
                    '    console.log(\'ts\');\n' +
                    '}\n' +
                    '\n' +
                    'function name22(data: string) {\n' +
                    '    console.log(\'name\' + data);\n' +
                    '}\n' +
                    '\n' +
                    'ts();\n' +
                    'name22(\'x\');\n'
                ],
                mappings: ';;;AAAO,IAAO,IAAI',
                names: []
            };

            const map2 = {
                version: 3,
                sources: [ 'src/x.spec.ts' ],
                sourcesContent: [
                    'function name(data: string) {\n' +
                    '    console.log(\'name\' + data);\n' +
                    '    throw new Error(\'xxxxxxxxxx\');\n' +
                    '}\n' +
                    '\n' +
                    'name(\'x\');\n'
                ],
                mappings: ';;;;;;;;;;;;;;;;;;;;AAAA;AAAA;AAAA;AAAA;AAAA;AAAO,IAAO,IAAI;',
                names: []
            };

            const sourceService = new SourceService(map1);
            sourceService.concat(map2);

            // eslint-disable-next-line max-len
            expect(sourceService.toString()).toBe('eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sInNvdXJjZXMiOlsic3JjL3Rlc3R4LnRzIiwic3JjL3guc3BlYy50cyJdLCJtYXBwaW5ncyI6Ijs7O0FBQU8sSUFBTyxJQUFJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0FsQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQU8sSUFBTyxJQUFJOyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG5mdW5jdGlvbiB0cygpIHtcbiAgICBjb25zb2xlLmxvZygndHMnKTtcbn1cblxuZnVuY3Rpb24gbmFtZTIyKGRhdGE6IHN0cmluZykge1xuICAgIGNvbnNvbGUubG9nKCduYW1lJyArIGRhdGEpO1xufVxuXG50cygpO1xubmFtZTIyKCd4Jyk7XG4iLCJmdW5jdGlvbiBuYW1lKGRhdGE6IHN0cmluZykge1xuICAgIGNvbnNvbGUubG9nKCduYW1lJyArIGRhdGEpO1xuICAgIHRocm93IG5ldyBFcnJvcigneHh4eHh4eHh4eCcpO1xufVxuXG5uYW1lKCd4Jyk7XG4iXX0=');
        });
    });

    describe('getMapObject', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        test('should return a SourceMapInterface object with the correct properties', () => {
            const sourceMap: SourceMapInterface = {
                version: 3,
                names: [ 'name1', 'name2' ],
                sources: [ 'source1.js', 'source2.js' ],
                sourcesContent: [ 'console.log("source1");', 'console.log("source2");' ],
                mappings: ''
            };

            const sourceService = new SourceService(sourceMap);
            // Create a mock implementation for encodeMappings since it's a private method
            const mockEncodeMappings = jest.spyOn(sourceService, <any>'encodeMappings');

            (<any>sourceService)['mappings'] = [
                { generatedLine: 1, generatedColumn: 0, sourceIndex: 0, sourceLine: 1, sourceColumn: 0, nameIndex: 1 },
                { generatedLine: 2, generatedColumn: 0, sourceIndex: 1, sourceLine: 1, sourceColumn: 0 }
            ];

            // Call the getMapObject method
            const result = sourceService.getMapObject();

            // Check if the result matches the expected SourceMapInterface object
            expect(result).toEqual({
                version: 3,
                names: [ 'name1', 'name2' ],
                sources: [ 'source1.js', 'source2.js' ],
                mappings: 'DAADC;DAAA;',
                sourcesContent: [ 'console.log("source1");', 'console.log("source2");' ]
            });

            // Check if encodeMappings was called with the correct argument
            expect(mockEncodeMappings).toHaveBeenCalledWith(sourceService['mappings']);
        });

        test('should return a SourceMapInterface object', () => {
            const mapOriginalObject = {
                version: 3,
                sources: [ 'src/testx.ts' ],
                sourcesContent: [
                    '\n' +
                    '\n' +
                    'function ts() {\n' +
                    '    console.log(\'ts\');\n' +
                    '}\n' +
                    '\n' +
                    'function name22(data: string) {\n' +
                    '    console.log(\'name\' + data);\n' +
                    '}\n' +
                    '\n' +
                    'ts();\n' +
                    'name22(\'x\');\n'
                ],
                mappings: ';;;AAEA,SAAS,KAAK;AACV,UAAQ,IAAI,IAAI;AACpB;AAEA,SAAS,OAAO,MAAc;AAC1B,UAAQ,IAAI,SAAS,IAAI;AAC7B;AAEA,GAAG;AACH,OAAO,GAAG;',
                names: []
            };

            const service = new SourceService(mapOriginalObject);
            const mapObject = service.getMapObject();

            expect(mapObject).toEqual(mapOriginalObject);
        });
    });
});