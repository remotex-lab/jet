/**
 * Import will remove at compile time
 */

import type { ConfigurationInterface } from '@providers/interfaces/configuration.interface';

/**
 * Imports
 */

import { join } from 'node:path';
import { statSync, existsSync } from 'node:fs';
import { decode } from '@components/base64.component';
import { sandboxExecute } from '@providers/vm.provider';
import { SourceService } from '@services/source.service';
import { transpileFile } from '@services/transpiler.service';
import { Colors, FormatHighlightErrorCode } from '@components/highlighter.component';
import { parseErrorStack } from '@services/parser.service';
import { formatCode, formatStack } from '@components/formatter.component';

/**
 * The default configuration settings.
 */

export const defaultConfiguration: ConfigurationInterface = {
    fileType: [ '*.spec.ts' ],
    limitParallelSuites: 1
};

export async function parseConfigurationFile(configFile: string): Promise<ConfigurationInterface> {
    const { code, sourceMap } = await transpileFile(configFile);
    const source = new SourceService(JSON.parse(decode(sourceMap)));

    try {
        const res = await sandboxExecute(code);
    } catch (error) {
        const stack = parseErrorStack((<any>error).stack);
        console.log(stack);

        const errorPos = stack[0];
        if (!errorPos) {
            return;
        }

        // if (errorPos.executor) {
        //     console.log('x');
        //     stack.unshift(errorPos.executor);
        // }
        //
        //

        console.log(Colors.red + 'Error: ' + error.message + Colors.reset + '\n');

        const sourceError = source.getSourcePosition(errorPos.line, errorPos.column);
        if (sourceError) {
            console.log(FormatHighlightErrorCode(sourceError, stack));
        }
    }

    return defaultConfiguration;
}

export async function getConfiguration(rootPath: string): Promise<ConfigurationInterface> {
    const configFile = join(rootPath, 'jet/config.jet.ts');
    if (!existsSync(configFile)) {
        return defaultConfiguration;
    }

    return await parseConfigurationFile(configFile);
}
