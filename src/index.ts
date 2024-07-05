
// Example usage:
import { parse } from '@core/services/parser.service';

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

console.log(parse(jsCode));
