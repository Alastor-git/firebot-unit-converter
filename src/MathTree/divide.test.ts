import "@/mocks/firebot-modules";
import { UnitParser } from "@/unit-parser";
import { ValueError } from "@/errors";
import { Unit } from "@/Unit/unit";
import { Prefix } from "@/Unit/prefix";
import { Quantity } from "@/quantity";
import { StringSymbol } from './string';
import { UnitSymbol } from "./unit";
import { Numeric } from "./numeric";
import { Multiply } from "./multiply";
import { Divide } from "./divide";
import { CompoundUnit } from "@/Unit/compound-unit";


test('constructor', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const aString: StringSymbol = new StringSymbol('A');
    const aSymbol: UnitSymbol = new UnitSymbol(unitA);
    const num5: Numeric = new Numeric(5);

    expect(new Divide(num5, aString)).toMatchObject({numerator: num5, denominator: aString});
    expect(new Divide(aString, aSymbol)).toMatchObject({numerator: aString, denominator: aSymbol});
    expect(new Divide(aSymbol, num5)).toMatchObject({numerator: aSymbol, denominator: num5});
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

    expect(new Divide(kaString, num5).parseUnits()).toMatchObject({numerator: kaSymbol, denominator: num5});
    expect(new Divide(num5, aString).parseUnits()).toMatchObject({numerator: num5, denominator: aSymbol});
    expect(new Divide(num5, num5).parseUnits()).toMatchObject({numerator: num5, denominator: num5});
});

test('collapse', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const unitC: Unit = new Unit('C', 'unit C', {M: 1}, 2, 1);
    const unitAC: CompoundUnit = unitA.divide(unitC);

    const quantityB: Quantity = new Quantity(-5, unitA);

    const emptyTree: Multiply = new Multiply();
    const aSymbol: UnitSymbol = new UnitSymbol(unitA);
    const cSymbol: UnitSymbol = new UnitSymbol(unitC);
    const num5: Numeric = new Numeric(5);
    const num2: Numeric = new Numeric(2);
    const num10: Multiply = new Multiply(num2, num5);
    const quant5A: Multiply = new Multiply(num5, aSymbol);
    const quant1C: Multiply = new Multiply(new Numeric(1), cSymbol);
    // TODO: test String ? 

    expect(() => new Divide(emptyTree, emptyTree).collapse()).toThrow(ValueError);
    expect(new Divide(num5, num10).collapse()).toBe(1 / 2);
    expect(new Divide(quant5A, new Numeric(-1)).collapse()).toMatchObject(quantityB);
    const expected: Quantity = new Quantity(1, Unit.ONE.divide(unitC).multiply(unitA));
    expect(new Divide(aSymbol, quant1C).collapse()).toMatchObject(expected);
    expect(new Divide(quant5A, quant1C).collapse()).toMatchObject(new Quantity(5, unitAC));
    expect(new Divide(aSymbol, cSymbol).collapse()).toMatchObject(unitAC);
    expect(new Divide(num5, cSymbol).collapse()).toMatchObject(new Quantity(5, Unit.ONE.divide(unitC)));
});