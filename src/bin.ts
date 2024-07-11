#!/usr/bin/env node

import { Script, createContext } from 'vm';
import { SourceService } from '@core/services/source.service';
import { transpileFile } from '@core/services/transpiler.service';
import type { ConfigurationInterface } from '@components/interfaces/configuration.interface';

const targetPath = process.cwd();

transpileFile(targetPath + '/jet/config.jet.ts').then(async (e) => {
    const module = <any>await import('module');
    const require = module.createRequire(import.meta.url);
    const customModule = {
        ...module,
        exports: {}
    };

    const source = new SourceService(JSON.parse(atob(e.sourceMap)));
    const wrappedCode = `(function(module, exports) { ${ e.code } })(module, module.exports);`;
    const script = new Script(wrappedCode);
    const sandbox = {
        module: customModule,
        require,
        // console,
    };

    try {
        const context = createContext(sandbox);
        script.runInContext(context);
        const xc = <ConfigurationInterface>customModule.exports.default;

        const onData = (data: string) => {
            // console.log('data', data);
        };

        if (xc.init && xc.execCode && xc.close) {
            await xc.init(onData);
            // await xc.execCode('event("data new arg")');
            // await xc.close();
        }
    } catch (dd: any) {
        console.log('xxx');
        // console.log(dd.stack);
        console.log(source.getSourcePosition(1,727));
    }
});
