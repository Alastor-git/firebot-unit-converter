import "@/mocks/firebot-modules";
import { logger } from "./shared/firebot-modules";
import { Unit } from "./Unit/unit";
import { UnitParser } from "./unit-parser";
import { Prefix } from "./Unit/prefix";
import { UnitNotFoundError } from "./errors";
import { AbstractUnit } from "./Unit/abstract-unit";

const unit_g: Unit = new Unit('g', 'gramme', { M: 1 }, 10, 1, 0); // eslint-disable-line camelcase
const unit_kg: Unit = new Unit('kg', 'kilogramme', { M: 1 }, 10, 1e3, 0); // eslint-disable-line camelcase
const unit_in: Unit = new Unit(['in', "''"], 'inch', { L: 1 }, 10, 2.54e-2); // eslint-disable-line camelcase

const prefix_k: Prefix = new Prefix('k', 'kilo', 10, 3); // eslint-disable-line camelcase
const prefix_m: Prefix = new Prefix('m', 'mili', 10, -3); // eslint-disable-line camelcase

beforeEach(() => {
    // Reset UnitParser registrations
    UnitParser.registeredUnits = {};
    UnitParser.registeredPrefixes = {};
});

test('registerUnit - valid registration', () => {
    let expectedMessage: string;
    expectedMessage = `UnitConverter: Registering unit gramme under symbol g. `;
    UnitParser.registerUnit(unit_g);
    expect(logger.info).toHaveBeenLastCalledWith(expectedMessage);
    expectedMessage = `UnitConverter: Registering unit kilogramme under symbol kg. `;
    UnitParser.registerUnit(unit_kg);
    expect(logger.info).toHaveBeenLastCalledWith(expectedMessage);

    UnitParser.registerUnit(unit_in);
    expectedMessage = `UnitConverter: Registering unit inch under symbol in. `;
    expect(logger.info).toHaveBeenCalledWith(expectedMessage);
    expectedMessage = `UnitConverter: Registering unit inch under symbol ''. `;
    expect(logger.info).toHaveBeenCalledWith(expectedMessage);
});

test('registerPrefix - valid registration', () => {
    let expectedMessage: string;
    expectedMessage = `UnitConverter: Registering prefix kilo under symbol k. `;
    UnitParser.registerPrefix(prefix_k);
    expect(logger.info).toHaveBeenLastCalledWith(expectedMessage);
    expectedMessage = `UnitConverter: Registering prefix mili under symbol m. `;
    UnitParser.registerPrefix(prefix_m);
    expect(logger.info).toHaveBeenLastCalledWith(expectedMessage);
});

test('registerUnit - unit in use', () => {
    const expectedMessage: string = `UnitConverter: Unit symbol g already in use. Couldn't register unit gramme. `;
    UnitParser.registerUnit(unit_g);
    UnitParser.registerUnit(unit_g);
    expect(logger.warn).toHaveBeenLastCalledWith(expectedMessage);
});

test('registerPrefix - prefix in use', () => {
    const expectedMessage: string = `UnitConverter: Prefix symbol k already in use. Couldn't register prefix kilo. `;
    UnitParser.registerPrefix(prefix_k);
    UnitParser.registerPrefix(prefix_k);
    expect(logger.warn).toHaveBeenLastCalledWith(expectedMessage);
});

test('registerUnit - Already parses', () => {
    const expectedMessage: string = `UnitConverter: kilogramme's symbol kg is conflicting with unit kilogramme and being parsed as kg. One of them isn't gonna work. `;
    UnitParser.registerUnit(unit_g);
    UnitParser.registerPrefix(prefix_k);
    UnitParser.registerUnit(unit_kg);
    expect(logger.warn).toHaveBeenLastCalledWith(expectedMessage);
});

test('registerPrefix - Already parses', () => {
    const expectedMessage: string = `UnitConverter: Prefix kilo's symbol k is creating a conflict between units gramme and kilogramme. kg is being parsed as kg. One of them isn't gonna work. `;
    UnitParser.registerUnit(unit_g);
    UnitParser.registerUnit(unit_kg);
    UnitParser.registerPrefix(prefix_k);
    expect(logger.warn).toHaveBeenLastCalledWith(expectedMessage);
});

test('registerUnit - Creates unit/prefix conflict', () => {
    const expectedMessage: string = `UnitConverter: unit gramme's symbol g is conflicting with unit kilogramme when using prefix k. kg is being parsed as kg. One of them isn't gonna work. `;
    jest.clearAllMocks();
    UnitParser.registerUnit(unit_kg);
    expect(logger.warn).not.toHaveBeenCalled();
    UnitParser.registerPrefix(prefix_k);
    expect(logger.warn).not.toHaveBeenCalled();
    UnitParser.registerUnit(unit_g);
    expect(logger.warn).toHaveBeenLastCalledWith(expectedMessage);
});

test('parseUnit - valid parse', () => {
    let expectedUnit: AbstractUnit;
    // Simple unit
    UnitParser.registerUnit(unit_g);
    expectedUnit = unit_g; // eslint-disable-line camelcase
    expect(UnitParser.parseUnit('g').isEqual(expectedUnit)).toBe(true);
    // Simple unit with prefix
    UnitParser.registerPrefix(prefix_k);
    expectedUnit = unit_g.applyPrefix(prefix_k, 'g'); // eslint-disable-line camelcase
    expect(UnitParser.parseUnit('kg').isEqual(expectedUnit)).toBe(true);
});

test('parseUnit - invalid parse', () => {
    // unit not found
    expect(() => UnitParser.parseUnit('g')).toThrow(UnitNotFoundError);
    // prefix not found
    UnitParser.registerUnit(unit_g);
    expect(() => UnitParser.parseUnit('kg')).toThrow(UnitNotFoundError);
});

test('findBestPrefixFromExponent', () => {
    // TODO more completely test it
    const prefix_M: Prefix = new Prefix('M', 'mega', 10, 6); // eslint-disable-line camelcase
    const prefix_k: Prefix = new Prefix('k', 'kilo', 10, 3); // eslint-disable-line camelcase
    const prefix_h: Prefix = new Prefix('h', 'hecto', 10, 2); // eslint-disable-line camelcase
    const prefix_da: Prefix = new Prefix('da', 'deca', 10, 1); // eslint-disable-line camelcase
    const prefix_d: Prefix = new Prefix('d', 'deci', 10, -1); // eslint-disable-line camelcase
    const prefix_c: Prefix = new Prefix('c', 'centi', 10, -2); // eslint-disable-line camelcase
    const prefix_m: Prefix = new Prefix('m', 'mili', 10, -3); // eslint-disable-line camelcase
    const prefix_µ: Prefix = new Prefix('µ', 'micro', 10, -6); // eslint-disable-line camelcase

    UnitParser.registerPrefix(prefix_M);
    UnitParser.registerPrefix(prefix_k);
    UnitParser.registerPrefix(prefix_h);
    UnitParser.registerPrefix(prefix_da);
    UnitParser.registerPrefix(prefix_d);
    UnitParser.registerPrefix(prefix_c);
    UnitParser.registerPrefix(prefix_m);
    UnitParser.registerPrefix(prefix_µ);

    expect(UnitParser.findBestPrefixFromExponent(-4)).toMatchObject(prefix_m);
    expect(UnitParser.findBestPrefixFromExponent(-2)).toMatchObject(prefix_c);
    expect(UnitParser.findBestPrefixFromExponent(4)).toMatchObject(prefix_k);
    expect(UnitParser.findBestPrefixFromExponent(2)).toMatchObject(prefix_h);
    expect(UnitParser.findBestPrefixFromExponent(0)).toBe(null);
});

test('findNextPrefixFromExponent', () => {
    // TODO more completely test it
    const prefix_M: Prefix = new Prefix('M', 'mega', 10, 6); // eslint-disable-line camelcase
    const prefix_k: Prefix = new Prefix('k', 'kilo', 10, 3); // eslint-disable-line camelcase
    const prefix_h: Prefix = new Prefix('h', 'hecto', 10, 2); // eslint-disable-line camelcase
    const prefix_da: Prefix = new Prefix('da', 'deca', 10, 1); // eslint-disable-line camelcase
    const prefix_d: Prefix = new Prefix('d', 'deci', 10, -1); // eslint-disable-line camelcase
    const prefix_c: Prefix = new Prefix('c', 'centi', 10, -2); // eslint-disable-line camelcase
    const prefix_m: Prefix = new Prefix('m', 'mili', 10, -3); // eslint-disable-line camelcase
    const prefix_µ: Prefix = new Prefix('µ', 'micro', 10, -6); // eslint-disable-line camelcase

    UnitParser.registerPrefix(prefix_M);
    UnitParser.registerPrefix(prefix_k);
    UnitParser.registerPrefix(prefix_h);
    UnitParser.registerPrefix(prefix_da);
    UnitParser.registerPrefix(prefix_d);
    UnitParser.registerPrefix(prefix_c);
    UnitParser.registerPrefix(prefix_m);
    UnitParser.registerPrefix(prefix_µ);

    expect(UnitParser.findNextPrefixFromExponent(-4)).toMatchObject(prefix_µ);
    expect(UnitParser.findNextPrefixFromExponent(-2)).toMatchObject(prefix_c);
    expect(UnitParser.findNextPrefixFromExponent(4)).toMatchObject(prefix_M);
    expect(UnitParser.findNextPrefixFromExponent(2)).toMatchObject(prefix_h);
    expect(UnitParser.findNextPrefixFromExponent(0)).toBe(null);
});