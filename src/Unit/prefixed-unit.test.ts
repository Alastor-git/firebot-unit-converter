/* eslint-disable camelcase */
import { ValueError } from "@/errors";
import { UnitDimensions } from "./abstract-unit";
import { Prefix } from "./prefix";
import { PrefixedUnit } from "./prefixed-unit";
import { Unit } from "./unit";

const unitSymbol1: string = "uA";
const unitSymbol2: string = "uB";

const unitName1: string = "unit A";
const unitName2: string = "unit B";

const dimensions1: UnitDimensions = { L: 1, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0};
const dimensions2: UnitDimensions = { L: 0, M: 1, T: 0, I: 0, THETA: 0, N: 0, J: 0};

const coeff1: number = 1.5;
const coeff2: number = 2;

const offset1: number = 50;
const offset2: number = 125;

const unitA: Unit = new Unit(unitSymbol1, unitName1, dimensions1, coeff1, offset1);
const unitB: Unit = new Unit([unitSymbol1, unitSymbol2], unitName1, dimensions1, coeff1, offset1);

const prefix_k: Prefix = new Prefix('k', 'kilo', 10, 3);
const prefix_m: Prefix = new Prefix('m', 'mili', 10, -3);

test('constructor', () => {
    const prefixedUnitA: PrefixedUnit = new PrefixedUnit(prefix_k, unitA);
    const prefixedUnitB: PrefixedUnit = new PrefixedUnit(prefix_k, unitA, unitSymbol1);
    const prefixedUnitC: PrefixedUnit = new PrefixedUnit(prefix_k, unitB);
    const prefixedUnitD: PrefixedUnit = new PrefixedUnit(prefix_k, unitB, unitSymbol1);

    expect(prefixedUnitA.baseUnit).toMatchObject(unitA);
    expect(prefixedUnitB.baseUnit).toMatchObject(unitA);
    expect(prefixedUnitA.dimensions).toMatchObject(unitA.dimensions);
    expect(prefixedUnitB.dimensions).toMatchObject(unitA.dimensions);
    expect(prefixedUnitA.offset).toBe(unitA.offset);
    expect(prefixedUnitB.offset).toBe(unitA.offset);
    expect(prefixedUnitA.symbols).toMatchObject([`${prefix_k.symbol}${unitSymbol1}`]);
    expect(prefixedUnitB.symbols).toMatchObject([`${prefix_k.symbol}${unitSymbol1}`]);
    expect(prefixedUnitC.symbols).toMatchObject([`${prefix_k.symbol}${unitSymbol1}`, `${prefix_k.symbol}${unitSymbol2}`]);
    expect(prefixedUnitD.symbols).toMatchObject([`${prefix_k.symbol}${unitSymbol1}`]);
    expect(prefixedUnitA.name).toBe(`${prefix_k.name}${unitA.name}`);
    expect(prefixedUnitB.name).toBe(`${prefix_k.name}${unitA.name}`);
    expect(prefixedUnitA.coeff).toBe(prefix_k.factor * unitA.coeff);
    expect(prefixedUnitB.coeff).toBe(prefix_k.factor * unitA.coeff);
});

test('preferredUnitSymbol', () => {
    const prefixedUnitA: PrefixedUnit = new PrefixedUnit(prefix_k, unitA);
    const prefixedUnitB: PrefixedUnit = new PrefixedUnit(prefix_k, unitA, unitSymbol1);
    const prefixedUnitC: PrefixedUnit = new PrefixedUnit(prefix_k, unitB, unitSymbol2);

    expect(() => prefixedUnitA.preferredUnitSymbol).toThrow(ValueError);
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
    const prefixedUnitA: PrefixedUnit = new PrefixedUnit(prefix_k, unitA);
    const prefixedUnitB: PrefixedUnit = new PrefixedUnit(prefix_k, unitA, unitSymbol1);
    const prefixedUnitC: PrefixedUnit = new PrefixedUnit(prefix_k, unitB, unitSymbol2);
    const prefixedUnitD: PrefixedUnit = new PrefixedUnit(prefix_k, unitB);

    expect(prefixedUnitA).toHaveProperty('_prefix', prefix_k);
    expect(prefixedUnitB).toHaveProperty('_prefix', prefix_k);
    expect(prefixedUnitC).toHaveProperty('_prefix', prefix_k);
    expect(prefixedUnitD).toHaveProperty('_prefix', prefix_k);

    expect(prefixedUnitA.symbols).toMatchObject([`${prefix_k.symbol}${unitSymbol1}`]);
    expect(prefixedUnitB.symbols).toMatchObject([`${prefix_k.symbol}${unitSymbol1}`]);
    expect(prefixedUnitC.symbols).toMatchObject([`${prefix_k.symbol}${unitSymbol2}`]);
    expect(prefixedUnitD.symbols).toMatchObject([`${prefix_k.symbol}${unitSymbol1}`, `${prefix_k.symbol}${unitSymbol2}`]);

    expect(prefixedUnitA.name).toBe(`${prefix_k.name}${unitA.name}`);
    expect(prefixedUnitB.name).toBe(`${prefix_k.name}${unitA.name}`);
    expect(prefixedUnitC.name).toBe(`${prefix_k.name}${unitB.name}`);
    expect(prefixedUnitD.name).toBe(`${prefix_k.name}${unitB.name}`);

    expect(prefixedUnitA.coeff).toBe(prefix_k.factor * unitA.coeff);
    expect(prefixedUnitB.coeff).toBe(prefix_k.factor * unitA.coeff);
    expect(prefixedUnitC.coeff).toBe(prefix_k.factor * unitB.coeff);
    expect(prefixedUnitD.coeff).toBe(prefix_k.factor * unitB.coeff);

    prefixedUnitA.prefix = prefix_m;
    prefixedUnitB.prefix = prefix_m;
    prefixedUnitC.prefix = prefix_m;
    prefixedUnitD.prefix = prefix_m;

    expect(prefixedUnitA).toHaveProperty('_prefix', prefix_m);
    expect(prefixedUnitB).toHaveProperty('_prefix', prefix_m);
    expect(prefixedUnitC).toHaveProperty('_prefix', prefix_m);
    expect(prefixedUnitD).toHaveProperty('_prefix', prefix_m);

    expect(prefixedUnitA.symbols).toMatchObject([`${prefix_m.symbol}${unitSymbol1}`]);
    expect(prefixedUnitB.symbols).toMatchObject([`${prefix_m.symbol}${unitSymbol1}`]);
    expect(prefixedUnitC.symbols).toMatchObject([`${prefix_m.symbol}${unitSymbol2}`]);
    expect(prefixedUnitD.symbols).toMatchObject([`${prefix_m.symbol}${unitSymbol1}`, `${prefix_m.symbol}${unitSymbol2}`]);

    expect(prefixedUnitA.name).toBe(`${prefix_m.name}${unitA.name}`);
    expect(prefixedUnitB.name).toBe(`${prefix_m.name}${unitA.name}`);
    expect(prefixedUnitC.name).toBe(`${prefix_m.name}${unitB.name}`);
    expect(prefixedUnitD.name).toBe(`${prefix_m.name}${unitB.name}`);

    expect(prefixedUnitA.coeff).toBe(prefix_m.factor * unitA.coeff);
    expect(prefixedUnitB.coeff).toBe(prefix_m.factor * unitA.coeff);
    expect(prefixedUnitC.coeff).toBe(prefix_m.factor * unitB.coeff);
    expect(prefixedUnitD.coeff).toBe(prefix_m.factor * unitB.coeff);

    prefixedUnitA._prefix = null;
    expect(() => prefixedUnitA.prefix).toThrow(ValueError);
});

test('preferredSymbol', () => {
    const prefixedUnitA: PrefixedUnit = new PrefixedUnit(prefix_k, unitA);
    const prefixedUnitB: PrefixedUnit = new PrefixedUnit(prefix_k, unitA, unitSymbol1);

    expect(() => prefixedUnitA.preferredSymbol).toThrow(ValueError);
    expect(prefixedUnitB.preferredSymbol).toBe(`${prefix_k.symbol}${unitSymbol1}`);
});

test('deltaUnit', () => {
    const unitC: Unit = new Unit(unitSymbol1, unitName1, dimensions1, coeff1, 0);

    const prefixedUnitA: PrefixedUnit = new PrefixedUnit(prefix_k, unitA, unitSymbol1);
    const prefixedUnitB: PrefixedUnit = new PrefixedUnit(prefix_k, unitC, unitSymbol1);
    expect(prefixedUnitA.deltaUnit()).toMatchObject(prefixedUnitB);

    const prefixedUnitC: PrefixedUnit = new PrefixedUnit(prefix_k, unitA);
    const prefixedUnitD: PrefixedUnit = new PrefixedUnit(prefix_k, unitC);
    expect(prefixedUnitC.deltaUnit()).toMatchObject(prefixedUnitD);
});