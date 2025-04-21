import { Prefix } from "./prefix";

test('constructor', () => {
    const testObject: Prefix = new Prefix('a', 'b', 10, -2);

    expect(testObject).toHaveProperty('symbol', 'a');
    expect(testObject).toHaveProperty('name', 'b');
    expect(testObject).toHaveProperty('factor', 0.01);
    expect(testObject).toHaveProperty('base', 10);
    expect(testObject).toHaveProperty('exponent', -2);
});

test('base', () => {
    const testObject: Prefix = new Prefix('a', 'b', 10, -2);
    expect(testObject).toHaveProperty('_base', 10);
    expect(testObject.base).toBe(10);
    expect(testObject.factor).toBe(10 ** -2);
    testObject.base = 2;
    expect(testObject).toHaveProperty('_base', 2);
    expect(testObject.base).toBe(2);
    expect(testObject.factor).toBe(2 ** -2);
});

test('exponent', () => {
    const testObject: Prefix = new Prefix('a', 'b', 10, -2);
    expect(testObject).toHaveProperty('_exponent', -2);
    expect(testObject.exponent).toBe(-2);
    expect(testObject.factor).toBe(10 ** -2);
    testObject.exponent = 2;
    expect(testObject).toHaveProperty('_exponent', 2);
    expect(testObject.exponent).toBe(2);
    expect(testObject.factor).toBe(10 ** 2);
});


test('copy', () => {
    const testObject: Prefix = new Prefix('a', 'b', 10, -2);
    const testObjectCopy: Prefix = testObject.copy();
    expect(testObjectCopy).toMatchObject(testObject);
    testObjectCopy.exponent += 2;
    expect(testObjectCopy).not.toMatchObject(testObject);
});