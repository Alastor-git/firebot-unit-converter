import "@/mocks/firebot-modules";
import { logger } from "@/shared/firebot-modules";
import { UnitParser } from "@/unit-parser";
import { Prefix } from "./prefix";
import { Unit } from "./unit";
import { CompoundUnit } from "./compound-unit";
import { PrefixedUnit } from "./prefixed-unit";

const prefixM: Prefix = new Prefix('M', 'mega', 10, 6); // eslint-disable-line camelcase
const prefixk: Prefix = new Prefix('k', 'kilo', 10, 3); // eslint-disable-line camelcase
const prefixh: Prefix = new Prefix('h', 'hecto', 10, 2); // eslint-disable-line camelcase
const prefixda: Prefix = new Prefix('da', 'deca', 10, 1); // eslint-disable-line camelcase
const prefixd: Prefix = new Prefix('d', 'deci', 10, -1); // eslint-disable-line camelcase
const prefixc: Prefix = new Prefix('c', 'centi', 10, -2); // eslint-disable-line camelcase
const prefixm: Prefix = new Prefix('m', 'mili', 10, -3); // eslint-disable-line camelcase
const prefixµ: Prefix = new Prefix('µ', 'micro', 10, -6); // eslint-disable-line camelcase

UnitParser.registerPrefix(prefixM);
UnitParser.registerPrefix(prefixk);
UnitParser.registerPrefix(prefixh);
UnitParser.registerPrefix(prefixda);
UnitParser.registerPrefix(prefixd);
UnitParser.registerPrefix(prefixc);
UnitParser.registerPrefix(prefixm);
UnitParser.registerPrefix(prefixµ);

const unitL: Unit = new Unit('L', 'Liter', { L: 3 }, 1e-3);
const unitm: Unit = new Unit('m', 'meter', { L: 1 });
const unitg: Unit = new Unit('g', 'gram', { M: 1 }, 1e-3);
const unitC: Unit = new Unit('°C', 'celsius', { THETA: 1 }, 1, 273.15);
/* Strictly speaking, I don't think we need to register the units for this
UnitParser.registerUnit(unitL);
UnitParser.registerUnit(unitm);
UnitParser.registerUnit(unitg);
UnitParser.registerUnit(unitC);
*/
test('constructor', () => {
    // Test simple unit
    const unitA: CompoundUnit = new CompoundUnit(unitL);
    expect(unitA).toHaveProperty('dimensions', { L: 3, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitA).toHaveProperty('coeff', 1e-3);
    expect(unitA).toHaveProperty('offset', 0);
    expect(unitA).toHaveProperty('components',
        {
            'L': {
                unit: unitL,
                unitExponent: 1,
                prefixBase: 1,
                prefixExponent: 0
            }
        });
    expect(unitA).toHaveProperty('name', 'Liter');
    expect(unitA).toHaveProperty('symbols', ['L']);
    expect(unitA.preferredUnitSymbol).toBe('L');
    expect(unitA.preferredSymbol).toBe('L');
    // Test prefixed unit
    const unitmL: PrefixedUnit = new PrefixedUnit(prefixm, unitL);
    const unitB: CompoundUnit = new CompoundUnit(unitmL);
    expect(unitB).toHaveProperty('dimensions', { L: 3, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitB).toHaveProperty('coeff', 1e-6);
    expect(unitB).toHaveProperty('offset', 0);
    expect(unitB).toHaveProperty('components',
        {
            'L': {
                unit: unitL,
                unitExponent: 1,
                prefixBase: 10,
                prefixExponent: -3
            }
        });
    expect(unitB).toHaveProperty('name', 'miliLiter');
    expect(unitB).toHaveProperty('symbols', ['mL']);
    expect(unitB.preferredUnitSymbol).toBe('mL');
    expect(unitB.preferredSymbol).toBe('mL');
    // Same with offset
    const unitmC: PrefixedUnit = new PrefixedUnit(prefixm, unitC);
    const unitCe: CompoundUnit = new CompoundUnit(unitmC);
    expect(unitCe).toHaveProperty('dimensions', { L: 0, M: 0, T: 0, I: 0, THETA: 1, N: 0, J: 0});
    expect(unitCe).toHaveProperty('coeff', 1e-3);
    expect(unitCe).toHaveProperty('offset', 273.15);
    expect(unitCe).toHaveProperty('components',
        {
            '°C': {
                unit: unitC,
                unitExponent: 1,
                prefixBase: 10,
                prefixExponent: -3
            }
        });
    expect(unitCe).toHaveProperty('name', 'milicelsius');
    expect(unitCe).toHaveProperty('symbols', ['m°C']);
    expect(unitCe.preferredUnitSymbol).toBe('m°C');
    expect(unitCe.preferredSymbol).toBe('m°C');
    // Test exponent on simple unit
    const unitD: CompoundUnit = new CompoundUnit(unitL, 3);
    expect(unitD).toHaveProperty('dimensions', { L: 9, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitD).toHaveProperty('coeff', 1e-9);
    expect(unitD).toHaveProperty('offset', 0);
    expect(unitD).toHaveProperty('components',
        {
            'L': {
                unit: unitL,
                unitExponent: 3,
                prefixBase: 1,
                prefixExponent: 0
            }
        });
    expect(unitD).toHaveProperty('name', 'Liter^3');
    expect(unitD).toHaveProperty('symbols', ['L^3']);
    expect(unitD.preferredUnitSymbol).toBe('L^3');
    expect(unitD.preferredSymbol).toBe('L^3');
    // Test exponent on prefixed unit
    const unitE: CompoundUnit = new CompoundUnit(unitmL, 3);
    expect(unitE).toHaveProperty('dimensions', { L: 9, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitE).toHaveProperty('coeff', 1e-18);
    expect(unitE).toHaveProperty('offset', 0);
    expect(unitE).toHaveProperty('components',
        {
            'L': {
                unit: unitL,
                unitExponent: 3,
                prefixBase: 10,
                prefixExponent: -9
            }
        });
    expect(unitE).toHaveProperty('name', 'miliLiter^3');
    expect(unitE).toHaveProperty('symbols', ['mL^3']);
    expect(unitE.preferredUnitSymbol).toBe('mL^3');
    expect(unitE.preferredSymbol).toBe('mL^3');
});

// Todo: mm * km = m^2 : That one's easy, things cancel out
// Todo: µm * hm = cm^2 : First problem, we end up with prefixes that weren't there in the first place
// Todo: L * mg / dg = cL : Second problem, prefixes are moving from one unit to another.
// Todo: dam hg * dm / mg mL = km^2 / cL : Add these two issues, we can end up with using none of the initial prefixes being pretty much the only solution, with the total prefix factor having to be spread across several units.
// Todo: Mm * dam = 10 km^2 : Hey! That's not even a unit anymore!!!