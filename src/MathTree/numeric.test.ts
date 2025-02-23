import { Numeric } from "./numeric";

test('constructor', () => {
    expect(new Numeric(5)).toMatchObject({value: 5});
});

test('parseUnits', () => {
    expect(new Numeric(5).parseUnits()).toMatchObject(new Numeric(5));
});

test('collapse', () => {
    expect(new Numeric(5).collapse()).toBe(5);
});