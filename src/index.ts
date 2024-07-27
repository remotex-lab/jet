/**
 * Export Global types
 */

import { getConfiguration } from '@core/providers/configuration.provider';

export type * from './interfaces/index.interface';

const rootPath = 'C:\\Users\\Just\\OneDrive\\Desktop\\ttt';

process.stdout.write('\x1Bc');


getConfiguration(rootPath);
