import "@/mocks/firebot-modules";
import { UnitParser } from "@/unit-parser";
import { InvalidOperation, ValueError } from "@/errors";
import { Unit } from "@/Unit/unit";
import { Prefix } from "@/Unit/prefix";
import { Quantity } from "@/quantity";
import { StringSymbol } from './string';
import { UnitSymbol } from "./unit";
import { Numeric } from "./numeric";
import { Multiply } from "./multiply";
import { Power } from "./power";

test('constructor', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const aString: StringSymbol = new StringSymbol('A');
    const aSymbol: UnitSymbol = new UnitSymbol(unitA);
    const num5: Numeric = new Numeric(5);

    expect(new Power(num5, aString)).toMatchObject({base: num5, exponent: aString});
    expect(new Power(aString, aSymbol)).toMatchObject({base: aString, exponent: aSymbol});
    expect(new Power(aSymbol, num5)).toMatchObject({base: aSymbol, exponent: num5});
});

test('parseUnits', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const prefix_k: Prefix = new Prefix('k', 'kilo', 10, 3); // eslint-disable-line camelcase

    UnitParser.registerUnit(unitA);
    UnitParser.registerPrefix(prefix_k);
    const aString: StringSymbol = new StringSymbol('A');
    const aSymbol: UnitSymbol = new UnitSymbol(unitA);
    const kaSymbol: UnitSymbol = new UnitSymbol(unitA.applyPrefix(prefix_k, 'A'));
    const num5: Numeric = new Numeric(5);
    const kaString: StringSymbol = new StringSymbol('kA');

    expect(new Power(kaString, num5).parseUnits()).toMatchObject({base: kaSymbol, exponent: num5});
    expect(new Power(num5, aString).parseUnits()).toMatchObject({base: num5, exponent: aSymbol});
    expect(new Power(num5, num5).parseUnits()).toMatchObject({base: num5, exponent: num5});
});

test('collapse', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const unitC: Unit = new Unit('C', 'unit C', {}, 2, 1);

    const quantityA: Quantity = new Quantity(5, unitA);

    const emptyTree: Multiply = new Multiply();
    const aSymbol: UnitSymbol = new UnitSymbol(unitA);
    const cSymbol: UnitSymbol = new UnitSymbol(unitC);
    const num5: Numeric = new Numeric(5);
    const quant5A: Multiply = new Multiply(num5, aSymbol);
    const quant1C: Multiply = new Multiply(num5, cSymbol);

        expect(() => new Power(emptyTree, emptyTree).collapse()).toThrow(ValueError);
        expect(() => new Power(aSymbol, aSymbol).collapse()).toThrow(InvalidOperation);
        expect(() => new Power(aSymbol, quant5A).collapse()).toThrow(InvalidOperation);
        expect(new Power(num5, num5).collapse()).toBe(5 ** 5);
        expect(new Power(aSymbol, num5).collapse()).toMatchObject(unitA.power(5));
        expect(new Power(quant5A, num5).collapse()).toMatchObject(quantityA.power(5));
        expect(new Power(quant5A, quant1C).collapse()).toMatchObject(quantityA.power(5 * 2 + 1));
});