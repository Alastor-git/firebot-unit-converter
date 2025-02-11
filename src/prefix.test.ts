import { Prefix } from "./prefix";

test('constructor', () => {
    const testObject: Prefix = new Prefix('a', 'b', 0.01);

    expect(testObject).toHaveProperty('symbol', 'a');
    expect(testObject).toHaveProperty('name', 'b');
    expect(testObject).toHaveProperty('factor', 0.01);
});