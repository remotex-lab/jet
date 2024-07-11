import { cwd } from 'process';
import type { BuildOptions } from 'esbuild';
import { build } from 'esbuild';
import { defaultBuildOptions, extractSourceMap, transpileFile } from '@core/services/transpiler.service';

jest.mock('esbuild');
const mockedBuild = build as jest.MockedFunction<typeof build>;

describe('RemoteX Transpiler', () => {
    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('extractSourceMap', () => {
        test('should extract the source map and return the modified code and source map', () => {
            // eslint-disable-next-line max-len
            const dataString = 'console.log("hello world"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvaW5kZXgudHMiLCJzb3VyY2VzIjpbInNyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyJ9';
            const result = extractSourceMap(dataString);

            expect(result).toEqual({
                code: 'console.log("hello world"); ',
                // eslint-disable-next-line max-len
                sourceMap: 'eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvaW5kZXgudHMiLCJzb3VyY2VzIjpbInNyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyJ9'
            });
        });

        test('should throw an error if the source map URL is not found', () => {
            const dataString = 'console.log("hello world");';

            expect(() => extractSourceMap(dataString)).toThrow('Source map URL not found in the output.');
        });
    });

    describe('transpileFile', () => {
        const filePath = './src/index.ts';
        // eslint-disable-next-line max-len
        const transpiledCode = 'console.log("hello world"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvaW5kZXgudHMiLCJzb3VyY2VzIjpbInNyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyJ9';

        beforeEach(() => {
            mockedBuild.mockResolvedValue(<any> {
                outputFiles: [{ text: transpiledCode }]
            });
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        test('should transpile a TypeScript file and extract the source map', async () => {
            const result = await transpileFile(filePath);

            expect(mockedBuild).toHaveBeenCalledWith(expect.objectContaining({
                absWorkingDir: cwd(),
                ...defaultBuildOptions,
                entryPoints: [ filePath ]
            }));
            expect(result).toEqual({
                code: 'console.log("hello world"); ',
                // eslint-disable-next-line max-len
                sourceMap: 'eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvaW5kZXgudHMiLCJzb3VyY2VzIjpbInNyYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyJ9'
            });
        });

        test('should use provided build options to override default options', async () => {
            const customOptions: BuildOptions = {
                minify: false
            };

            await transpileFile(filePath, customOptions);

            expect(mockedBuild).toHaveBeenCalledWith(expect.objectContaining({
                absWorkingDir: cwd(),
                ...defaultBuildOptions,
                ...customOptions,
                entryPoints: [ filePath ]
            }));
        });

        test('should throw an error if the build process fails', async () => {
            mockedBuild.mockRejectedValue(new Error('Build failed'));

            await expect(transpileFile(filePath)).rejects.toThrow('Build failed');
        });
    });
});
