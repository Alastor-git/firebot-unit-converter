import "@/mocks/firebot-modules";
import { UnitParser } from "@/unit-parser";
import { ValueError } from "@/errors";
import { Unit } from "@/unit";
import { Prefix } from "@/prefix";
import { Quantity } from "@/quantity";
import { StringSymbol } from './string';
import { UnitSymbol } from "./unit";
import { Numeric } from "./numeric";
import { Multiply } from "./multiply";

test('constructor', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const aString: StringSymbol = new StringSymbol('A');
    const aSymbol: UnitSymbol = new UnitSymbol(unitA);
    const num5: Numeric = new Numeric(5);

    expect(new Multiply(num5, aSymbol, aString)).toMatchObject({factors: [num5, aSymbol, aString]});
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

    expect(new Multiply(kaString, num5, aSymbol, aString).parseUnits()).toMatchObject({factors: [kaSymbol, num5, aSymbol, aSymbol]});
});
/* */
test('collapsePair', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const unitB: Unit = unitA.multiply(unitA);
    const quantityA: Quantity = new Quantity(5, unitA);
    const quantityB: Quantity = new Quantity(-5, unitA);
    const quantityC: Quantity = new Quantity(5, unitB);

    const emptyTree: Multiply = new Multiply();
    const aSymbol: UnitSymbol = new UnitSymbol(unitA);
    const num5: Numeric = new Numeric(5);
    const quant5A: Multiply = new Multiply(num5, aSymbol);
    // TODO: test String ? 

    expect(() => Multiply.collapsePair(null, emptyTree)).toThrow(ValueError);
    expect(() => Multiply.collapsePair(unitA, emptyTree)).toThrow(ValueError);
    expect(() => Multiply.collapsePair(quantityA, emptyTree)).toThrow(ValueError);
    expect(() => Multiply.collapsePair(5, emptyTree)).toThrow(ValueError);

    expect(Multiply.collapsePair(null, num5)).toBe(5);
    expect(Multiply.collapsePair(null, aSymbol)).toMatchObject(unitA);
    expect(Multiply.collapsePair(null, quant5A)).toMatchObject(quantityA);

    expect(Multiply.collapsePair(5, num5)).toBe(25);
    expect(Multiply.collapsePair(5, aSymbol)).toMatchObject(quantityA);
    expect(Multiply.collapsePair(-1, quant5A)).toMatchObject(quantityB);

    expect(Multiply.collapsePair(unitA, num5)).toMatchObject(quantityA);
    expect(Multiply.collapsePair(unitA, aSymbol)).toMatchObject(unitB);
    expect(Multiply.collapsePair(unitA, quant5A)).toMatchObject(quantityC);

    expect(Multiply.collapsePair(quantityA, new Numeric(-1))).toMatchObject(quantityB);
    expect(Multiply.collapsePair(quantityA, aSymbol)).toMatchObject(quantityC);
    expect(Multiply.collapsePair(quantityB, new Multiply(new Numeric(-1), aSymbol))).toMatchObject(quantityC);
});
/* */
test('collapse', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const prefix_k: Prefix = new Prefix('k', 'kilo', 1e3); // eslint-disable-line camelcase
    const unitB: Unit = unitA.multiply(unitA);

    const quantityA: Quantity = new Quantity(5, unitA);
    const quantityB: Quantity = new Quantity(-5, unitA);

    UnitParser.registerUnit(unitA);
    UnitParser.registerPrefix(prefix_k);
    const aSymbol: UnitSymbol = new UnitSymbol(unitA);
    const kaSymbol: UnitSymbol = new UnitSymbol(unitA.applyPrefix(prefix_k));
    const num5: Numeric = new Numeric(5);
    const num1opp: Numeric = new Numeric(-1);

    expect(new Multiply(kaSymbol, num5, aSymbol, aSymbol).collapse())
    .toMatchObject(unitA.applyPrefix(prefix_k).multiply(5).multiply(unitA).multiply(unitA));

    expect(new Multiply().collapse()).toBe(null);
    expect(new Multiply(num5).collapse()).toBe(5);
    expect(new Multiply(num5, num5, num1opp).collapse()).toBe(-25);
    expect(new Multiply(num5, aSymbol).collapse()).toMatchObject(quantityA);
    expect(new Multiply(num5, num1opp, aSymbol).collapse()).toMatchObject(quantityB);
    expect(new Multiply(aSymbol, aSymbol).collapse()).toMatchObject(unitB);
});