import "@/mocks/firebot-modules";
import { UnitParser } from "@/unit-parser";
import { InvalidOperation, ValueError } from "@/errors";
import { Unit } from "@/unit";
import { Prefix } from "@/prefix";
import { Quantity } from "@/quantity";
import { StringSymbol } from './string';
import { UnitSymbol } from "./unit";
import { Numeric } from "./numeric";
import { Multiply } from "./multiply";
import { Oppose } from "./oppose";

test('constructor', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const aString: StringSymbol = new StringSymbol('A');
    const aSymbol: UnitSymbol = new UnitSymbol(unitA);
    const num5: Numeric = new Numeric(5);

    expect(new Oppose(num5)).toMatchObject({element: num5});
    expect(new Oppose(aString)).toMatchObject({element: aString});
    expect(new Oppose(aSymbol)).toMatchObject({element: aSymbol});
});

test('parseUnits', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const prefix_k: Prefix = new Prefix('k', 'kilo', 1e3); // eslint-disable-line camelcase

    UnitParser.registerUnit(unitA);
    UnitParser.registerPrefix(prefix_k);
    const aString: StringSymbol = new StringSymbol('A');
    const aSymbol: UnitSymbol = new UnitSymbol(unitA);
    const kaSymbol: UnitSymbol = new UnitSymbol(unitA.applyPrefix(prefix_k));
    const num5: Numeric = new Numeric(5);
    const kaString: StringSymbol = new StringSymbol('kA');

    expect(new Oppose(kaString).parseUnits()).toMatchObject({element: kaSymbol});
    expect(new Oppose(aString).parseUnits()).toMatchObject({element: aSymbol});
    expect(new Oppose(num5).parseUnits()).toMatchObject({element: num5});
});

test('collapse', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const prefix_k: Prefix = new Prefix('k', 'kilo', 1e3); // eslint-disable-line camelcase

    const aString: StringSymbol = new StringSymbol('A');
    const aSymbol: UnitSymbol = new UnitSymbol(unitA);
    const kaSymbol: UnitSymbol = new UnitSymbol(unitA.applyPrefix(prefix_k));
    const num5: Numeric = new Numeric(5);
    const quant5A: Multiply = new Multiply(num5, aSymbol);

    expect(() => new Oppose(new Multiply()).collapse()).toThrow(ValueError);
    expect(() => new Oppose(kaSymbol).collapse()).toThrow(InvalidOperation);
    expect(() => new Oppose(aString).collapse()).toThrow(ValueError);
    expect(new Oppose(num5).collapse()).toBe(-5);
    expect(new Oppose(quant5A).collapse()).toMatchObject(new Quantity(-5, unitA));
});