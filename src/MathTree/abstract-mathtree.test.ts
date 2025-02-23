import { Empty } from "./empty";
import { Multiply } from "./multiply";
import { Numeric } from "./numeric";
import { StringSymbol } from "./string";

test('toString', () => {
    expect(new Empty().toString()).toBe('{}');
    expect(new Multiply(new Numeric(5), new StringSymbol('a')).toString()).toBe('{"factors":[{"value":5},{"value":"a"}]}');
});