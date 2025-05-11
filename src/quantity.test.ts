import { UnitMismatchError, ValueError } from "./errors";
import { Quantity } from "./quantity";
import { UnitDimensions } from "./Unit/abstract-unit";
import { CompoundUnit } from "./Unit/compound-unit";
import { Unit } from "./Unit/unit";


const unitSymbol1: string = "uA";
const unitSymbol2: string = "uB";

const unitName1: string = "unit A";
const unitName2: string = "unit B";

const dimensions1: UnitDimensions = { L: 1, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0, D: 0, A: 0};
const dimensions2: UnitDimensions = { L: 0, M: 1, T: 0, I: 0, THETA: 0, N: 0, J: 0, D: 0, A: 0};

const base1: number = 10;
const base2: number = 10; // TODO: Test different values

const coeff1: number = 1.5;
const coeff2: number = 2;

const offset1: number = 50;
const offset2: number = 125;

const unitA: Unit = new Unit(unitSymbol1, unitName1, dimensions1, base1, coeff1, offset1);
const unitB: Unit = new Unit(unitSymbol2, unitName2, dimensions2, base2, coeff2, offset2);

const value1: number = 6;
const value2: number = 7;

test("Constructor", () => {
    const quantity: Quantity = new Quantity(value1, unitA);
    expect(quantity.value).toBe(value1);
    expect(quantity.unit.isEqual(unitA)).toBe(true);
});

test('zero', () => {
    expect(Quantity.zero()).toMatchObject(new Quantity(0, Unit.ONE));
    expect(Quantity.zero(unitA)).toMatchObject(new Quantity(0, unitA));
});

test('isNull', () => {
    const quantityA: Quantity = new Quantity(value1, unitA);
    const quantityB: Quantity = new Quantity(0, unitA);

    expect(Quantity.isNull(quantityA)).toBe(false);
    expect(Quantity.isNull(quantityB)).toBe(true);
});

test("isEqual", () => {
    const quantityA: Quantity = new Quantity(value1, unitA);
    const quantityB: Quantity = new Quantity(value1, unitA.deltaUnit());
    const quantityC: Quantity = new Quantity(value2, unitA);
    const quantityD: Quantity = new Quantity(value1, unitB);

    expect(quantityA.isEqual(quantityA)).toBe(true);
    expect(quantityA.isEqual(quantityB)).toBe(false);
    expect(quantityA.isEqual(quantityC)).toBe(false);
    expect(quantityA.isEqual(quantityD)).toBe(false);
});

test("isDeltaEqual", () => {
    const quantityA: Quantity = new Quantity(value1, unitA);
    const quantityB: Quantity = new Quantity(value1, unitA.deltaUnit());
    const quantityC: Quantity = new Quantity(value2, unitA);
    const quantityD: Quantity = new Quantity(value1, unitB);

    expect(quantityA.isDeltaEqual(quantityA)).toBe(true);
    expect(quantityA.isDeltaEqual(quantityB)).toBe(true);
    expect(quantityA.isDeltaEqual(quantityC)).toBe(false);
    expect(quantityA.isDeltaEqual(quantityD)).toBe(false);
});

test("isEquivalent", () => {
    const unitA: Unit = new Unit(unitSymbol1, unitName1, dimensions1, base1, coeff1, offset1);
    const unitB: Unit = new Unit(unitSymbol2, unitName2, dimensions1, base1, coeff2, offset2);
    const unitC: Unit = new Unit(unitSymbol1, unitName1, dimensions2, base1, coeff1, offset1);
    const quantityA: Quantity = new Quantity(value1, unitA);
    const quantityB: Quantity = new Quantity((value1 * coeff1 - offset2 + offset1) / coeff2, unitB);
    const quantityC: Quantity = new Quantity(value1, unitC);
    const quantityD: Quantity = new Quantity(value1, unitB);

    expect(quantityA.isEquivalent(quantityA)).toBe(true);
    expect(quantityA.isEquivalent(quantityB)).toBe(true);
    expect(quantityA.isEquivalent(quantityC)).toBe(false);
    expect(quantityA.isEquivalent(quantityD)).toBe(false);

    // Real world data just for sanity check
    const unitF: Unit = new Unit('°F', 'fahrenheit', { THETA: 1 }, 10, 5 / 9, 273.15 - 32 * 5 / 9);
    const unitCe: Unit = new Unit('°C', 'celsius', { THETA: 1 }, 10, 1, 273.15);
    const unitK: Unit = new Unit('K', 'kelvin', { THETA: 1 }, 10);

    const tempValueK: Quantity = new Quantity(334.15, unitK);
    const tempValueC: Quantity = new Quantity(61, unitCe);
    const tempValueF: Quantity = new Quantity(141.79999999999998, unitF);

    expect(tempValueK.isEquivalent(tempValueC)).toBe(true);
    expect(tempValueK.isEquivalent(tempValueF)).toBe(true);
    expect(tempValueC.isEquivalent(tempValueF)).toBe(true);
});

test("add", () => {
    const quantityA: Quantity = new Quantity(value1, unitA);
    const quantityB: Quantity = new Quantity(value2, unitA);
    const quantityC: Quantity = new Quantity(value1 + value2, unitA);
    const unitC: Unit = new Unit('t', 't', unitA.dimensions, base1, unitA.coeff * 2, unitA.offset);
    const quantityD: Quantity = quantityA.convert(unitC);
    const quantityE: Quantity = new Quantity(value2, unitB);

    expect(quantityA.add(quantityB).isEqual(quantityC)).toBe(true);
    expect(quantityB.add(quantityA).isEqual(quantityC)).toBe(true);

    expect(quantityA.add(Quantity.zero(unitA)).isEqual(quantityA)).toBe(true);
    expect(quantityA.add(Quantity.zero(unitA)).isDeltaEqual(quantityA)).toBe(true);
    expect(Quantity.zero(unitA).add(quantityA).isEqual(quantityA)).toBe(true);
    expect(Quantity.zero(unitA).add(quantityA).isDeltaEqual(quantityA)).toBe(true);

    expect(Quantity.zero(unitA).add(quantityD).isEqual(quantityD)).toBe(false);
    expect(Quantity.zero(unitA).add(quantityD).isEqual(quantityA)).toBe(true);
    expect(Quantity.zero(unitA).add(quantityD).isDeltaEqual(quantityA)).toBe(true);
    expect(Quantity.zero(unitA).add(quantityD).isEquivalent(quantityD)).toBe(true);

    expect(() => quantityA.add(quantityE)).toThrow(UnitMismatchError);

    // number parameter
    const unit1A: Unit = Unit.ONE;
    const unit1B: Unit = new Unit('B', 'shift scalar', {}, 10, 1, 10);
    const unit1C: Unit = new Unit('C', 'scaled scalar', {}, 10, 2);

    const quantity1A: Quantity = new Quantity(10, unit1A);
    const quantity1B: Quantity = new Quantity(0, unit1B);
    const quantity1C: Quantity = new Quantity(5, unit1C);

    expect(quantity1A.add(-10).isEqual(Quantity.zero())).toBe(true);
    expect(quantity1B.add(-10).isEqual(Quantity.zero())).toBe(true);
    expect(quantity1C.add(-10).isEqual(Quantity.zero())).toBe(true);

    expect(() => quantityA.add(2)).toThrow(UnitMismatchError);
});

test('oppose', () => {
    const quantityA: Quantity = new Quantity(value1, unitA);
    const quantityB: Quantity = new Quantity(-value1, unitA);

    expect(quantityA.oppose().isEqual(quantityB)).toBe(true);
    expect(Quantity.zero().oppose().isEqual(Quantity.zero())).toBe(true);
    expect(Quantity.zero(unitA).oppose().isEqual(Quantity.zero(unitA))).toBe(true);
});
/*
test("subtract", () => {
    const quantityA: Quantity = new Quantity(value1, unitA);
    const quantityB: Quantity = new Quantity(value2, unitA);
    const quantityC: Quantity = new Quantity(value1 - value2, unitA);
    const unitC: Unit = new Unit('t', 't', unitA.dimensions, 10, unitA.coeff * 2, unitA.offset);
    const quantityD: Quantity = quantityA.convert(unitC);
    const quantityE: Quantity = new Quantity(value2, unitB);
    const quantityF: Quantity = new Quantity(-value1, unitA);
    const quantityG: Quantity = quantityF.convert(unitC);

    expect(quantityA.subtract(quantityB).isEqual(quantityC)).toBe(true);
    expect(quantityB.subtract(quantityA).isEqual(quantityC)).toBe(false);
    expect(quantityA.subtract(quantityB).add(quantityB).isEqual(quantityA)).toBe(true);

    expect(quantityA.subtract(quantityA).isEqual(Quantity.zero(unitA))).toBe(true);

    expect(quantityA.subtract(Quantity.zero(unitA)).isEqual(quantityA)).toBe(true);
    expect(quantityA.subtract(Quantity.zero(unitA)).isDeltaEqual(quantityA)).toBe(true);
    expect(Quantity.zero(unitA).subtract(quantityA).isEqual(quantityF)).toBe(true);
    expect(Quantity.zero(unitA).subtract(quantityA).isDeltaEqual(quantityF)).toBe(true);

    expect(Quantity.zero(unitA).subtract(quantityD).isEqual(quantityG)).toBe(false);
    expect(Quantity.zero(unitA).subtract(quantityD).isEqual(quantityF)).toBe(true);
    expect(Quantity.zero(unitA).subtract(quantityD).isDeltaEqual(quantityF)).toBe(true);
    expect(Quantity.zero(unitA).subtract(quantityD).isEquivalent(quantityG)).toBe(true);

    expect(() => quantityA.subtract(quantityE)).toThrow(UnitMismatchError);
});
*/
test("multiply", () => {
    const unitC: CompoundUnit = unitA.multiply(unitB);
    const quantityA: Quantity = new Quantity(value1, unitA);
    const quantityB: Quantity = new Quantity(value2, unitB);
    const quantityC: Quantity = new Quantity(value1 * value2, unitC);
    const quantityD: Quantity = new Quantity(value1, unitC);

    expect(quantityA.multiply(unitB).isEqual(quantityD)).toBe(true);

    expect(quantityA.multiply(quantityB).isEqual(quantityC)).toBe(true);
    expect(quantityB.multiply(quantityA).isEqual(quantityC)).toBe(true);
    expect(quantityA.multiply(Quantity.ONE).isEqual(quantityA)).toBe(false);
    expect(quantityA.multiply(Quantity.ONE).isDeltaEqual(quantityA)).toBe(true);
    expect(Quantity.ONE.multiply(quantityA).isEqual(quantityA)).toBe(false);
    expect(Quantity.ONE.multiply(quantityA).isDeltaEqual(quantityA)).toBe(true);

    const multiplier: number = 5.4;
    const quantityE: Quantity = new Quantity(value1 * multiplier, unitA);

    expect(quantityA.multiply(1).isEqual(quantityA)).toBe(true);
    expect(quantityA.multiply(multiplier).isEqual(quantityE)).toBe(true);
});

test("divide", () => {
    const unitC: CompoundUnit = unitA.divide(unitB);
    const quantityA: Quantity = new Quantity(value1, unitA);
    const quantityB: Quantity = new Quantity(value2, unitB);
    const quantityC: Quantity = new Quantity(value1 / value2, unitC);
    const quantityD: Quantity = new Quantity(value1, unitC);

    expect(quantityA.divide(unitB).isEqual(quantityD)).toBe(true);

    expect(quantityA.divide(quantityB).isEqual(quantityC)).toBe(true);
    expect(quantityB.divide(quantityA).isEqual(quantityC)).toBe(false);
    expect(quantityA.divide(quantityB).multiply(quantityB).isEqual(quantityA.deltaQuantity())).toBe(true);

    expect(quantityA.divide(quantityA).isEqual(Quantity.ONE)).toBe(true);

    expect(quantityA.divide(Quantity.ONE).isEqual(quantityA)).toBe(false);
    expect(quantityA.divide(Quantity.ONE).isDeltaEqual(quantityA)).toBe(true);

    expect(() => quantityA.divide(Quantity.zero(unitB))).toThrow(ValueError);

    const divider: number = 3.5;
    const quantityE: Quantity = new Quantity(value1 / divider, unitA);
    expect(quantityA.divide(1).isEqual(quantityA)).toBe(true);
    expect(quantityA.divide(divider).isEqual(quantityE)).toBe(true);

    expect(() => quantityA.divide(0)).toThrow(ValueError);
});

test('power', () => {
    const powerA: number = 2.3;
    const powerB: number = -powerA;
    const powerC: number = 2;
    const powerD: number = -powerC;

    const unitC: CompoundUnit = unitA.power(powerA);
    const unitD: CompoundUnit = unitA.power(powerB);
    const unitE: CompoundUnit = unitA.power(powerC);
    const unitF: CompoundUnit = unitA.power(powerD);

    const quantityA: Quantity = new Quantity(value1, unitA);
    const quantityAA: Quantity = new Quantity(value1 ** powerA, unitC);
    const quantityAB: Quantity = new Quantity(value1 ** powerB, unitD);
    const quantityAC: Quantity = new Quantity(value1 ** powerC, unitE);
    const quantityAD: Quantity = new Quantity(value1 ** powerD, unitF);
    const quantityB: Quantity = Quantity.zero(unitA);
    const quantityC: Quantity = new Quantity(-value1, unitA);
    const quantityCC: Quantity = new Quantity((-value1) ** powerC, unitE);
    const quantityCD: Quantity = new Quantity((-value1) ** powerD, unitF);

    expect(quantityA.power(0).isEqual(Quantity.ONE)).toBe(true);
    expect(quantityA.power(1).isDeltaEqual(quantityA)).toBe(true);
    expect(quantityA.power(powerA).isEqual(quantityAA)).toBe(true);
    expect(quantityA.power(powerB).isEqual(quantityAB)).toBe(true);
    expect(quantityA.power(powerC).isEqual(quantityAC)).toBe(true);
    expect(quantityA.power(powerD).isEqual(quantityAD)).toBe(true);

    expect(() => quantityB.power(0)).toThrow(ValueError);
    expect(Quantity.isNull(quantityB.power(powerA))).toBe(true);
    expect(() => quantityB.power(powerB)).toThrow(ValueError);
    expect(Quantity.isNull(quantityB.power(powerC))).toBe(true);
    expect(() => quantityB.power(powerD)).toThrow(ValueError);

    expect(quantityC.power(0).isEqual(Quantity.ONE)).toBe(true);
    expect(quantityC.power(1).isDeltaEqual(quantityC)).toBe(true);
    expect(() => quantityC.power(powerA)).toThrow(ValueError);
    expect(() => quantityC.power(powerB)).toThrow(ValueError);
    expect(quantityC.power(powerC).isEqual(quantityCC)).toBe(true);
    expect(quantityC.power(powerD).isEqual(quantityCD)).toBe(true);
});

test('convert', () => {
    const unitF: Unit = new Unit('°F', 'fahrenheit', { THETA: 1 }, 10, 5 / 9, 273.15 - 32 * 5 / 9);
    const unitCe: Unit = new Unit('°C', 'celsius', { THETA: 1 }, 10, 1, 273.15);
    const unitK: Unit = new Unit('K', 'kelvin', { THETA: 1 }, 10);
    const unitm: Unit = new Unit('m', 'meter', { L: 1 }, 10);

    const tempValueK: Quantity = new Quantity(334.15, unitK);
    const tempValueC: Quantity = new Quantity(61, unitCe);
    const tempValueF: Quantity = new Quantity(141.79999999999998, unitF);

    expect(tempValueK.convert(unitCe).isEqual(tempValueC)).toBe(true);
    expect(tempValueK.convert(unitF).isEqual(tempValueF)).toBe(true);
    expect(tempValueF.convert(unitK).isEqual(tempValueK)).toBe(true);
    expect(tempValueF.convert(unitCe).isEqual(tempValueC)).toBe(true);
    expect(tempValueC.convert(unitK).isEqual(tempValueK)).toBe(true);
    expect(tempValueC.convert(unitF).isEqual(tempValueF)).toBe(true);
    expect(() => tempValueC.convert(unitm)).toThrow(UnitMismatchError);
});

test('deltaQuantity', () => {
    const quantityA: Quantity = new Quantity(value1, unitA);

    expect(quantityA.deltaQuantity().isEqual(quantityA)).toBe(false);
    expect(quantityA.deltaQuantity().isDeltaEqual(quantityA)).toBe(true);
});

test('toString', () => {
    const unitK: Unit = new Unit('K', 'kelvin', { THETA: 1 }, 10);

    const tempValueK: Quantity = new Quantity(334.15, unitK);

    expect(tempValueK.toString()).toBe('334.15 K');
});