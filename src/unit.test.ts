import { ValueError } from "./errors";
import { Prefix } from "./prefix";
import { Unit, UnitDimensions } from "./unit";

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

test("Constructor", () => {
    const unitA: Unit = new Unit(unitSymbol1, unitName1, dimensions1, coeff1, offset1);
    const unitB: Unit = new Unit([unitSymbol1, unitSymbol2], unitName1, dimensions1, coeff1, offset1);

    expect(unitA.name).toBe(unitName1);
    expect(unitA.symbols).toMatchObject([unitSymbol1]);
    expect(unitB.symbols).toMatchObject([unitSymbol1, unitSymbol2]);
    expect(unitA.dimensions).toMatchObject(dimensions1);
    expect(unitA.coeff).toBe(coeff1);
    expect(unitA.offset).toBe(offset1);

    let testObject: Unit;
    testObject = new Unit('a', 'b');
    expect(testObject).toHaveProperty('symbols', ['a']);
    expect(testObject).toHaveProperty('name', 'b');
    expect(testObject).toHaveProperty('dimensions', { L: 0, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(testObject).toHaveProperty('coeff', 1);
    expect(testObject).toHaveProperty('offset', 0);

    testObject = new Unit('a', 'b', { L: 1, M: 2, T: 3, I: 4, THETA: 5, N: 6, J: 7}, 8, 9);
    expect(testObject).toHaveProperty('symbols', ['a']);
    expect(testObject).toHaveProperty('name', 'b');
    expect(testObject).toHaveProperty('dimensions', { L: 1, M: 2, T: 3, I: 4, THETA: 5, N: 6, J: 7});
    expect(testObject).toHaveProperty('coeff', 8);
    expect(testObject).toHaveProperty('offset', 9);
});

test("isSameDimension", () => {
    const unitA: Unit = new Unit(unitSymbol1, unitName1, dimensions1, coeff1, offset1);
    const unitB: Unit = new Unit(unitSymbol2, unitName2, dimensions1, coeff1, offset1);
    const unitC: Unit = new Unit(unitSymbol2, unitName2, dimensions1, coeff1, offset2);
    const unitD: Unit = new Unit(unitSymbol2, unitName2, dimensions1, coeff2, offset2);
    const unitE: Unit = new Unit(unitSymbol2, unitName2, dimensions2, coeff2, offset2);

    expect(unitA.isSameDimension(unitA)).toBe(true);
    expect(unitA.isSameDimension(unitB)).toBe(true);
    expect(unitA.isSameDimension(unitC)).toBe(true);
    expect(unitA.isSameDimension(unitD)).toBe(true);
    expect(unitA.isSameDimension(unitE)).toBe(false);
});

test("isDeltaEqual", () => {
    const unitA: Unit = new Unit(unitSymbol1, unitName1, dimensions1, coeff1, offset1);
    const unitB: Unit = new Unit(unitSymbol2, unitName2, dimensions1, coeff1, offset1);
    const unitC: Unit = new Unit(unitSymbol2, unitName2, dimensions1, coeff1, offset2);
    const unitD: Unit = new Unit(unitSymbol2, unitName2, dimensions1, coeff2, offset2);
    const unitE: Unit = new Unit(unitSymbol2, unitName2, dimensions2, coeff2, offset2);

    expect(unitA.isDeltaEqual(unitA)).toBe(true);
    expect(unitA.isDeltaEqual(unitB)).toBe(true);
    expect(unitA.isDeltaEqual(unitC)).toBe(true);
    expect(unitA.isDeltaEqual(unitD)).toBe(false);
    expect(unitA.isDeltaEqual(unitE)).toBe(false);
});

test("isEqual", () => {
    const unitA: Unit = new Unit(unitSymbol1, unitName1, dimensions1, coeff1, offset1);
    const unitB: Unit = new Unit(unitSymbol2, unitName2, dimensions1, coeff1, offset1);
    const unitC: Unit = new Unit(unitSymbol2, unitName2, dimensions1, coeff1, offset2);
    const unitD: Unit = new Unit(unitSymbol2, unitName2, dimensions1, coeff2, offset2);
    const unitE: Unit = new Unit(unitSymbol2, unitName2, dimensions2, coeff2, offset2);

    expect(unitA.isEqual(unitA)).toBe(true);
    expect(unitA.isEqual(unitB)).toBe(true);
    expect(unitA.isEqual(unitC)).toBe(false);
    expect(unitA.isEqual(unitD)).toBe(false);
    expect(unitA.isEqual(unitE)).toBe(false);
});

test("isDimensionless", () => {
    expect(Unit.ONE.isDimensionless()).toBe(true);
    let unit: Unit = new Unit('a', 'a', {}, 1, 0);
    expect(unit.isDimensionless()).toBe(true);
    unit = new Unit('a', 'a', {}, coeff1, 0);
    expect(unit.isDimensionless()).toBe(true);
    unit = new Unit('a', 'a', {}, coeff1, offset1);
    expect(unit.isDimensionless()).toBe(true);
    unit = new Unit('a', 'a', {L: 1}, coeff1, offset1);
    expect(unit.isDimensionless()).toBe(false);
    unit = new Unit('a', 'a', {M: 1}, coeff1, offset1);
    expect(unit.isDimensionless()).toBe(false);
    unit = new Unit('a', 'a', {T: 1}, coeff1, offset1);
    expect(unit.isDimensionless()).toBe(false);
    unit = new Unit('a', 'a', {I: 1}, coeff1, offset1);
    expect(unit.isDimensionless()).toBe(false);
    unit = new Unit('a', 'a', {THETA: 1}, coeff1, offset1);
    expect(unit.isDimensionless()).toBe(false);
    unit = new Unit('a', 'a', {N: 1}, coeff1, offset1);
    expect(unit.isDimensionless()).toBe(false);
    unit = new Unit('a', 'a', {J: 1}, coeff1, offset1);
    expect(unit.isDimensionless()).toBe(false);
});

test("isNeutralElement", () => {
    expect(Unit.ONE.isNeutralElement()).toBe(true);
    let unit: Unit = new Unit('a', 'a', {}, 1, 0);
    expect(unit.isNeutralElement()).toBe(true);
    unit = new Unit('a', 'a', {}, coeff1, 0);
    expect(unit.isNeutralElement()).toBe(false);
    unit = new Unit('a', 'a', {}, coeff1, offset1);
    expect(unit.isNeutralElement()).toBe(false);
    unit = new Unit('a', 'a', {L: 1}, coeff1, offset1);
    expect(unit.isNeutralElement()).toBe(false);
    unit = new Unit('a', 'a', {M: 1}, coeff1, offset1);
    expect(unit.isNeutralElement()).toBe(false);
    unit = new Unit('a', 'a', {T: 1}, coeff1, offset1);
    expect(unit.isNeutralElement()).toBe(false);
    unit = new Unit('a', 'a', {I: 1}, coeff1, offset1);
    expect(unit.isNeutralElement()).toBe(false);
    unit = new Unit('a', 'a', {THETA: 1}, coeff1, offset1);
    expect(unit.isNeutralElement()).toBe(false);
    unit = new Unit('a', 'a', {N: 1}, coeff1, offset1);
    expect(unit.isNeutralElement()).toBe(false);
    unit = new Unit('a', 'a', {J: 1}, coeff1, offset1);
    expect(unit.isNeutralElement()).toBe(false);
});

test("isAffine/isLinear", () => {

    const unitA: Unit = new Unit(unitSymbol1, unitName1, dimensions1, coeff1, offset1);
    const unitB: Unit = new Unit(unitSymbol2, unitName2, dimensions2, coeff2, 0);

    expect(unitA.isAffine()).toBe(true);
    expect(unitB.isAffine()).toBe(false);
    expect(unitA.isLinear()).toBe(false);
    expect(unitB.isLinear()).toBe(true);
});

test("deltaUnit", () => {
    const unitA: Unit = new Unit(unitSymbol1, unitName1, dimensions1, coeff1, offset1);
    const unitB: Unit = new Unit(unitSymbol1, unitName1, dimensions1, coeff1, 0);

    expect(unitA.deltaUnit().isEqual(unitB)).toBe(true);
    expect(unitA.deltaUnit().isEqual(unitA)).toBe(false);
    expect(unitB.deltaUnit().isEqual(unitB)).toBe(true);
});

test("multiply", () => {
    const unitA: Unit = new Unit(unitSymbol1, unitName1, dimensions1, coeff1, offset1);
    const unitB: Unit = new Unit(unitSymbol2, unitName2, dimensions2, coeff2, offset2);
    const dimensionMult: UnitDimensions = {
        L: dimensions1.L + dimensions2.L,
        M: dimensions1.M + dimensions2.M,
        T: dimensions1.T + dimensions2.T,
        I: dimensions1.I + dimensions2.I,
        THETA: dimensions1.THETA + dimensions2.THETA,
        N: dimensions1.N + dimensions2.N,
        J: dimensions1.J + dimensions2.J
    };
    const unitAB: Unit = new Unit(`${unitSymbol1}*${unitSymbol2}`, `${unitName1}*${unitName2}`, dimensionMult, coeff1 * coeff2, 0);

    expect(unitA.multiply(unitB).isEqual(unitAB)).toBe(true);
    expect(unitB.multiply(unitA).isEqual(unitAB)).toBe(true);
    expect(Unit.ONE.multiply(unitA).isDeltaEqual(unitA)).toBe(true);
    expect(Unit.ONE.multiply(unitA).isEqual(unitA)).toBe(false);
});

test("divide", () => {
    const unitA: Unit = new Unit(unitSymbol1, unitName1, dimensions1, coeff1, offset1);
    const unitB: Unit = new Unit(unitSymbol2, unitName2, dimensions2, coeff2, offset2);
    const dimensionDiv: UnitDimensions = {
        L: dimensions1.L - dimensions2.L,
        M: dimensions1.M - dimensions2.M,
        T: dimensions1.T - dimensions2.T,
        I: dimensions1.I - dimensions2.I,
        THETA: dimensions1.THETA - dimensions2.THETA,
        N: dimensions1.N - dimensions2.N,
        J: dimensions1.J - dimensions2.J
    };
    const unitAB: Unit = new Unit(`${unitSymbol1}/${unitSymbol2}`, `${unitName1}/${unitName2}`, dimensionDiv, coeff1 / coeff2, 0);

    expect(unitA.divide(unitB).isEqual(unitAB)).toBe(true);
    expect(unitB.divide(unitA).isEqual(unitAB)).toBe(false);
    expect(unitA.divide(unitB).multiply(unitB).isDeltaEqual(unitA)).toBe(true);
    expect(unitA.divide(Unit.ONE).isDeltaEqual(unitA)).toBe(true);
    expect(unitA.divide(Unit.ONE).isEqual(unitA)).toBe(false);
    expect(unitA.divide(unitA).isEqual(Unit.ONE)).toBe(true);
});

test("power", () => {
    const power: number = 3;
    const unitA: Unit = new Unit(unitSymbol1, unitName1, dimensions1, coeff1, offset1);
    const dimensioPow: UnitDimensions = {
        L: dimensions1.L * power,
        M: dimensions1.M * power,
        T: dimensions1.T * power,
        I: dimensions1.I * power,
        THETA: dimensions1.THETA * power,
        N: dimensions1.N * power,
        J: dimensions1.J * power
    };
    const unitApow: Unit = new Unit(`${unitSymbol1}^${power}`, `${unitName1}^${power}`, dimensioPow, coeff1 ** power, 0);

    expect(unitA.power(power).isEqual(unitApow)).toBe(true);
    expect(unitA.power(power).isEqual(unitA)).toBe(false);
    expect(unitA.power(power).power(1 / power).isDeltaEqual(unitA)).toBe(true);
    expect(unitA.power(0).isEqual(Unit.ONE)).toBe(true);
    expect(Unit.ONE.power(power).isEqual(Unit.ONE)).toBe(true);
});

test('applyPrefix', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1});
    const unitB: Unit = new Unit(['A', 'B'], unitA.name, unitA.dimensions);
    const prefix_k: Prefix = new Prefix('k', 'kilo', 1e3);
    const untikA: Unit = new Unit(
        `${prefix_k.symbol}${unitA.symbols[0]}`,
        `${prefix_k.name}${unitA.name}`,
        unitA.dimensions,
        unitA.coeff * prefix_k.factor,
        unitA.offset
    );
    const untikB: Unit = new Unit(
        unitB.symbols.map(symbol => `${prefix_k.symbol}${symbol}`),
        `${prefix_k.name}${unitB.name}`,
        unitB.dimensions,
        unitB.coeff * prefix_k.factor,
        unitB.offset
    );
    expect(unitA.applyPrefix(prefix_k)).toMatchObject(untikA);
    expect(unitA.applyPrefix(prefix_k, 'A')).toMatchObject(untikA);
    expect(unitB.applyPrefix(prefix_k, 'A')).toMatchObject(untikA);
    expect(unitB.applyPrefix(prefix_k)).toMatchObject(untikB);
    expect(() => unitB.applyPrefix(prefix_k, 'C')).toThrow(ValueError);
});