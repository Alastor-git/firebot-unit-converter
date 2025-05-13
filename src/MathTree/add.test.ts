import "@/mocks/firebot-modules";
import { UnitParser } from "@/unit-parser";
import { InvalidOperationError, UnitMismatchError, ValueError } from "@/errors";
import { Unit } from "@/Unit/unit";
import { Prefix } from "@/Unit/prefix";
import { Quantity } from "@/quantity";
import { StringSymbol } from './string';
import { UnitSymbol } from "./unit";
import { Numeric } from "./numeric";
import { Multiply } from "./multiply";
import { Add } from "./add";

test('constructor', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 10, 2, 1);
    const aString: StringSymbol = new StringSymbol('A');
    const aSymbol: UnitSymbol = new UnitSymbol(unitA);
    const num5: Numeric = new Numeric(5);

    expect(new Add(num5, aSymbol, aString)).toMatchObject({terms: [num5, aSymbol, aString]});
});

test('parseUnits', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 10, 2, 1);
    const prefix_k: Prefix = new Prefix('k', 'kilo', 10, 3); // eslint-disable-line camelcase

    UnitParser.registerUnit(unitA);
    UnitParser.registerPrefix(prefix_k);
    const aString: StringSymbol = new StringSymbol('A');
    const aSymbol: UnitSymbol = new UnitSymbol(unitA);
    const kaSymbol: UnitSymbol = new UnitSymbol(unitA.applyPrefix(prefix_k, 'A'));
    const num5: Numeric = new Numeric(5);
    const kaString: StringSymbol = new StringSymbol('kA');

    expect(new Add(kaString, num5, aSymbol, aString).parseUnits()).toMatchObject({terms: [kaSymbol, num5, aSymbol, aSymbol]});
});
/* */
test('collapsePair', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 10, 2, 1);
    const quantityA: Quantity = new Quantity(5, unitA);
    const quantityB: Quantity = new Quantity(10, unitA);
    const quantityC: Quantity = new Quantity(-5, unitA);
    const quantityD: Quantity = new Quantity(5, Unit.ONE);
    const quantityE: Quantity = new Quantity(10, Unit.ONE);

    const emptyTree: Multiply = new Multiply();
    const aSymbol: UnitSymbol = new UnitSymbol(unitA);
    const num5: Numeric = new Numeric(5);
    const quant5A: Multiply = new Multiply(num5, aSymbol);
    // TODO: test String ? 

    expect(() => Add.collapsePair(null, emptyTree)).toThrow(ValueError);
    expect(() => Add.collapsePair(unitA, emptyTree)).toThrow(ValueError);
    expect(() => Add.collapsePair(quantityA, emptyTree)).toThrow(ValueError);
    expect(() => Add.collapsePair(5, emptyTree)).toThrow(ValueError);

    expect(() => Add.collapsePair(null, aSymbol)).toThrow(InvalidOperationError);
    expect(() => Add.collapsePair(unitA, aSymbol)).toThrow(InvalidOperationError);
    expect(() => Add.collapsePair(quantityA, aSymbol)).toThrow(InvalidOperationError);
    expect(() => Add.collapsePair(5, aSymbol)).toThrow(InvalidOperationError);

    expect(Add.collapsePair(null, quant5A)).toMatchObject(quantityA);
    expect(() => Add.collapsePair(unitA, quant5A)).toThrow(InvalidOperationError);
    expect(Add.collapsePair(quantityA, quant5A)).toMatchObject(quantityB);
    expect(Add.collapsePair(quantityC, quant5A)).toMatchObject(Quantity.zero(unitA));
    expect(() => Add.collapsePair(5, quant5A)).toThrow(UnitMismatchError);

    expect(Add.collapsePair(null, num5)).toBe(5);
    expect(() => Add.collapsePair(unitA, num5)).toThrow(InvalidOperationError);
    expect(() => Add.collapsePair(quantityA, num5)).toThrow(UnitMismatchError);
    expect(Add.collapsePair(quantityD, num5)).toMatchObject(quantityE);
    expect(Add.collapsePair(5, num5)).toBe(10);
});
/* */
test('collapse', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 10, 2, 1);
    const prefix_k: Prefix = new Prefix('k', 'kilo', 10, 3); // eslint-disable-line camelcase

    UnitParser.registerUnit(unitA);
    UnitParser.registerPrefix(prefix_k);
    const aSymbol: UnitSymbol = new UnitSymbol(unitA);
    const num5: Numeric = new Numeric(5);
    const num10opp: Numeric = new Numeric(-10);

    const quant5A: Multiply = new Multiply(num5, aSymbol);
    const quant10oppA: Multiply = new Multiply(num10opp, aSymbol);

    expect(new Add().collapse()).toBe(null);
    expect(new Add(num5).collapse()).toBe(5);
    expect(new Add(num5, num5, num10opp).collapse()).toBe(0);
    expect(() => new Add(num5, num5, aSymbol).collapse()).toThrow(InvalidOperationError);
    expect(() => new Add(aSymbol, aSymbol).collapse()).toThrow(InvalidOperationError);
    expect(new Add(num5, num5, new Multiply(num10opp, new UnitSymbol(Unit.ONE))).collapse()).toMatchObject(Quantity.zero());
    expect(() => new Add(num5, num5, quant10oppA).collapse()).toThrow(UnitMismatchError);
    expect(new Add(quant5A, quant5A, quant10oppA).collapse()).toMatchObject(Quantity.zero(unitA));
});
/* */