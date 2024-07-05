import { parse } from '@core/services/parser.service';

describe('parse function', () => {
    test('should extract functions, classes, and variables from JavaScript code', () => {
        const jsCode = `
            const x = 10;
            let y = 20;
            var z = 30;

            class MyClass {}
            const arrowFunc = () => {};
            const arrowFunc2 = function(){};
            function regularFunction() {}
            const anonymousClass = class {};

            const obj = {
            method() {},
            };
        `;

        const result = parse(jsCode);
        console.log(result);

        // Assert that the expected functions, classes, and variables are extracted
        expect(result.variables).toEqual([ 'x', 'y', 'z', 'obj' ]);
        expect(result.classes).toEqual([ 'MyClass', 'anonymousClass' ]);
        expect(result.functions).toEqual([ 'arrowFunc', 'arrowFunc2', 'regularFunction' ]);
    });
});
