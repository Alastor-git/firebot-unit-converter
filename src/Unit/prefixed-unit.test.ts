import "@/mocks/firebot-modules";
import { logger } from "@/shared/firebot-modules";
import { ValueError } from "@/errors";
import { UnitDimensions } from "./abstract-unit";
import { Prefix } from "./prefix";
import { PrefixedUnit } from "./prefixed-unit";
import { Unit } from "./unit";
import { Quantity } from "@/quantity";
import { CompoundUnit } from "./compound-unit";
import { UnitParser } from "@/unit-parser";

const unitSymbol1: string = "uA";
const unitSymbol2: string = "uB";

const unitName1: string = "unit A";
const unitName2: string = "unit B";

const dimensions1: UnitDimensions = { L: 1, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0, D: 0, A: 0 };
const dimensions2: UnitDimensions = { L: 0, M: 1, T: 0, I: 0, THETA: 0, N: 0, J: 0, D: 0, A: 0 };

const base1: number = 10;
const base2: number = 10;

const coeff1: number = 1.5;
const coeff2: number = 2;

const offset1: number = 50;
const offset2: number = 125;

const unitA: Unit = new Unit(unitSymbol1, unitName1, dimensions1, base1, coeff1, offset1);
const unitB: Unit = new Unit([unitSymbol1, unitSymbol2], unitName1, dimensions1, base1, coeff1, offset1);
const unitC: Unit = new Unit(unitSymbol2, unitName2, dimensions2, base2, coeff2, offset2);

const prefixk: Prefix = new Prefix('k', 'kilo', 10, 3);
const prefixm: Prefix = new Prefix('m', 'mili', 10, -3);

UnitParser.registerPrefix(prefixk);

test('constructor', () => {
    const prefixedUnitA: PrefixedUnit = new PrefixedUnit(prefixk, unitA);
    const prefixedUnitB: PrefixedUnit = new PrefixedUnit(prefixk, unitA, unitSymbol1);
    const prefixedUnitC: PrefixedUnit = new PrefixedUnit(prefixk, unitB);
    const prefixedUnitD: PrefixedUnit = new PrefixedUnit(prefixk, unitB, unitSymbol1);

    expect(prefixedUnitA.baseUnit).toMatchObject(unitA);
    expect(prefixedUnitB.baseUnit).toMatchObject(unitA);
    expect(prefixedUnitA.dimensions).toMatchObject(unitA.dimensions);
    expect(prefixedUnitB.dimensions).toMatchObject(unitA.dimensions);
    expect(prefixedUnitA.offset).toBe(unitA.offset);
    expect(prefixedUnitB.offset).toBe(unitA.offset);
    expect(prefixedUnitA.symbols).toMatchObject([`${prefixk.symbol}${unitSymbol1}`]);
    expect(prefixedUnitB.symbols).toMatchObject([`${prefixk.symbol}${unitSymbol1}`]);
    expect(prefixedUnitC.symbols).toMatchObject([`${prefixk.symbol}${unitSymbol1}`, `${prefixk.symbol}${unitSymbol2}`]);
    expect(prefixedUnitD.symbols).toMatchObject([`${prefixk.symbol}${unitSymbol1}`]);
    expect(prefixedUnitA.name).toBe(`${prefixk.name}${unitA.name}`);
    expect(prefixedUnitB.name).toBe(`${prefixk.name}${unitA.name}`);
    expect(prefixedUnitA.coeff).toBe(prefixk.factor * unitA.coeff);
    expect(prefixedUnitB.coeff).toBe(prefixk.factor * unitA.coeff);
});

test('copy', () => {
    const testObject: PrefixedUnit = new PrefixedUnit(prefixk, unitA);
    const testObjectCopy: PrefixedUnit = testObject.copy();
    expect(testObjectCopy).toMatchObject(testObject);
    testObjectCopy.prefix = prefixm;
    expect(testObjectCopy).not.toMatchObject(testObject);
});

test('preferredUnitSymbol', () => {
    const prefixedUnitA: PrefixedUnit = new PrefixedUnit(prefixk, unitA);
    const prefixedUnitB: PrefixedUnit = new PrefixedUnit(prefixk, unitA, unitSymbol1);
    const prefixedUnitC: PrefixedUnit = new PrefixedUnit(prefixk, unitB, unitSymbol2);

    expect(prefixedUnitA.preferredUnitSymbol).toBe(unitA.preferredSymbol);
    expect(prefixedUnitB.preferredUnitSymbol).toBe(unitSymbol1);
    expect(prefixedUnitC.preferredUnitSymbol).toBe(unitSymbol2);

    expect(() => {
        prefixedUnitA.preferredUnitSymbol = unitSymbol2;
    }).toThrow(ValueError);
    prefixedUnitA.preferredUnitSymbol = unitSymbol1;
    expect(prefixedUnitA.preferredUnitSymbol).toBe(unitSymbol1);
    prefixedUnitC.preferredUnitSymbol = unitSymbol1;
    expect(prefixedUnitC.preferredUnitSymbol).toBe(unitSymbol1);
});

test('prefix', () => {
    const prefixedUnitA: PrefixedUnit = new PrefixedUnit(prefixk, unitA);
    const prefixedUnitB: PrefixedUnit = new PrefixedUnit(prefixk, unitA, unitSymbol1);
    const prefixedUnitC: PrefixedUnit = new PrefixedUnit(prefixk, unitB, unitSymbol2);
    const prefixedUnitD: PrefixedUnit = new PrefixedUnit(prefixk, unitB);

    expect(prefixedUnitA).toHaveProperty('_prefix', prefixk);
    expect(prefixedUnitB).toHaveProperty('_prefix', prefixk);
    expect(prefixedUnitC).toHaveProperty('_prefix', prefixk);
    expect(prefixedUnitD).toHaveProperty('_prefix', prefixk);

    expect(prefixedUnitA.symbols).toMatchObject([`${prefixk.symbol}${unitSymbol1}`]);
    expect(prefixedUnitB.symbols).toMatchObject([`${prefixk.symbol}${unitSymbol1}`]);
    expect(prefixedUnitC.symbols).toMatchObject([`${prefixk.symbol}${unitSymbol2}`]);
    expect(prefixedUnitD.symbols).toMatchObject([`${prefixk.symbol}${unitSymbol1}`, `${prefixk.symbol}${unitSymbol2}`]);

    expect(prefixedUnitA.name).toBe(`${prefixk.name}${unitA.name}`);
    expect(prefixedUnitB.name).toBe(`${prefixk.name}${unitA.name}`);
    expect(prefixedUnitC.name).toBe(`${prefixk.name}${unitB.name}`);
    expect(prefixedUnitD.name).toBe(`${prefixk.name}${unitB.name}`);

    expect(prefixedUnitA.coeff).toBe(prefixk.factor * unitA.coeff);
    expect(prefixedUnitB.coeff).toBe(prefixk.factor * unitA.coeff);
    expect(prefixedUnitC.coeff).toBe(prefixk.factor * unitB.coeff);
    expect(prefixedUnitD.coeff).toBe(prefixk.factor * unitB.coeff);

    prefixedUnitA.prefix = prefixm;
    prefixedUnitB.prefix = prefixm;
    prefixedUnitC.prefix = prefixm;
    prefixedUnitD.prefix = prefixm;

    expect(prefixedUnitA).toHaveProperty('_prefix', prefixm);
    expect(prefixedUnitB).toHaveProperty('_prefix', prefixm);
    expect(prefixedUnitC).toHaveProperty('_prefix', prefixm);
    expect(prefixedUnitD).toHaveProperty('_prefix', prefixm);

    expect(prefixedUnitA.symbols).toMatchObject([`${prefixm.symbol}${unitSymbol1}`]);
    expect(prefixedUnitB.symbols).toMatchObject([`${prefixm.symbol}${unitSymbol1}`]);
    expect(prefixedUnitC.symbols).toMatchObject([`${prefixm.symbol}${unitSymbol2}`]);
    expect(prefixedUnitD.symbols).toMatchObject([`${prefixm.symbol}${unitSymbol1}`, `${prefixm.symbol}${unitSymbol2}`]);

    expect(prefixedUnitA.name).toBe(`${prefixm.name}${unitA.name}`);
    expect(prefixedUnitB.name).toBe(`${prefixm.name}${unitA.name}`);
    expect(prefixedUnitC.name).toBe(`${prefixm.name}${unitB.name}`);
    expect(prefixedUnitD.name).toBe(`${prefixm.name}${unitB.name}`);

    expect(prefixedUnitA.coeff).toBe(prefixm.factor * unitA.coeff);
    expect(prefixedUnitB.coeff).toBe(prefixm.factor * unitA.coeff);
    expect(prefixedUnitC.coeff).toBe(prefixm.factor * unitB.coeff);
    expect(prefixedUnitD.coeff).toBe(prefixm.factor * unitB.coeff);

    prefixedUnitA._prefix = null;
    expect(() => prefixedUnitA.prefix).toThrow(ValueError);
});

test('preferredSymbol', () => {
    const prefixedUnitA: PrefixedUnit = new PrefixedUnit(prefixk, unitA);
    const prefixedUnitB: PrefixedUnit = new PrefixedUnit(prefixk, unitA, unitSymbol1);

    expect(prefixedUnitA.preferredSymbol).toBe(`${prefixk.symbol}${unitA.preferredSymbol}`);
    expect(prefixedUnitB.preferredSymbol).toBe(`${prefixk.symbol}${unitSymbol1}`);
});

test('deltaUnit', () => {
    const unitC: Unit = new Unit(unitSymbol1, unitName1, dimensions1, base1, coeff1, 0);

    const prefixedUnitA: PrefixedUnit = new PrefixedUnit(prefixk, unitA, unitSymbol1);
    const prefixedUnitB: PrefixedUnit = new PrefixedUnit(prefixk, unitC, unitSymbol1);
    expect(prefixedUnitA.deltaUnit()).toMatchObject(prefixedUnitB);

    const prefixedUnitC: PrefixedUnit = new PrefixedUnit(prefixk, unitA);
    const prefixedUnitD: PrefixedUnit = new PrefixedUnit(prefixk, unitC);
    expect(prefixedUnitC.deltaUnit()).toMatchObject(prefixedUnitD);
});

test("multiply", () => {
    const prefixedUnitA: PrefixedUnit = new PrefixedUnit(prefixk, unitA, unitSymbol1);
    const prefixedUnitB: PrefixedUnit = new PrefixedUnit(prefixk, unitC, unitSymbol2);
    const quantityA: Quantity = new Quantity(5, prefixedUnitA);
    const unitAB: CompoundUnit = new CompoundUnit(prefixedUnitA).addFactor(prefixedUnitB);

    expect(prefixedUnitA.multiply(prefixedUnitB).isEqual(unitAB)).toBe(true);
    expect(prefixedUnitB.multiply(prefixedUnitA).isEqual(unitAB)).toBe(true);
    expect(prefixedUnitA.multiply(Unit.ONE).isDeltaEqual(prefixedUnitA)).toBe(true);
    expect(prefixedUnitA.multiply(Unit.ONE).isEqual(prefixedUnitA)).toBe(false);

    expect(prefixedUnitA.multiply(5).isEqual(quantityA)).toBe(true);
});

test("divide", () => {
    const prefixedUnitA: PrefixedUnit = new PrefixedUnit(prefixk, unitA, unitSymbol1);
    const prefixedUnitB: PrefixedUnit = new PrefixedUnit(prefixk, unitC, unitSymbol2);
    const quantityA: Quantity = new Quantity(1 / 5, prefixedUnitA);
    const unitAB: CompoundUnit = new CompoundUnit(prefixedUnitA).addFactor(prefixedUnitB, -1);

    expect(prefixedUnitA.divide(prefixedUnitB).isEqual(unitAB)).toBe(true);
    expect(prefixedUnitB.divide(prefixedUnitA).isEqual(unitAB)).toBe(false);
    expect(prefixedUnitA.divide(prefixedUnitB).multiply(prefixedUnitB).isDeltaEqual(prefixedUnitA)).toBe(true);
    expect(prefixedUnitA.divide(Unit.ONE).isDeltaEqual(prefixedUnitA)).toBe(true);
    expect(prefixedUnitA.divide(Unit.ONE).isEqual(prefixedUnitA)).toBe(false);
    expect(prefixedUnitA.divide(prefixedUnitA).isEqual(Unit.ONE)).toBe(true);

    expect(prefixedUnitA.divide(5).isEqual(quantityA)).toBe(true);
});

test("power", () => {
    const power: number = 3;
    const prefixedUnitA: PrefixedUnit = new PrefixedUnit(prefixk, unitA, unitSymbol1);
    const unitApow: CompoundUnit = new CompoundUnit(prefixedUnitA, power);

    expect(prefixedUnitA.power(power).isEqual(unitApow)).toBe(true);
    expect(prefixedUnitA.power(power).isEqual(prefixedUnitA)).toBe(false);
    expect(prefixedUnitA.power(power).power(1 / power).isDeltaEqual(prefixedUnitA)).toBe(true);
    expect(prefixedUnitA.power(0).isEqual(Unit.ONE)).toBe(true);
});