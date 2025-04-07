import "@/mocks/firebot-modules";
import { logger } from "@/shared/firebot-modules";
import { UnitParser } from "@/unit-parser";
import { Prefix } from "./prefix";
import { Unit } from "./unit";
import { CompoundUnit } from "./compound-unit";
import { PrefixedUnit } from "./prefixed-unit";
import { ValueError } from "@/errors";

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
    // Test 0 exponent
    const unitF: CompoundUnit = new CompoundUnit(unitmL, 0);
    expect(unitF).toHaveProperty('dimensions', { L: 0, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitF).toHaveProperty('coeff', 1);
    expect(unitF).toHaveProperty('offset', 0);
    expect(unitF).toHaveProperty('components', {});
    expect(unitF).toHaveProperty('name', '');
    expect(unitF).toHaveProperty('symbols', ['']);
    expect(() => unitF.preferredUnitSymbol).toThrow(ValueError);
    expect(() => unitF.preferredSymbol).toThrow(ValueError);
});

test('addFactor', () => {
    // Dissimilar units preserve prefixes: mm * kg = mm * kg
    const unitmm: PrefixedUnit = new PrefixedUnit(prefixm, unitm);
    const unitkg: PrefixedUnit = new PrefixedUnit(prefixk, unitg);
    const unitA: CompoundUnit = new CompoundUnit(unitmm).addFactor(unitkg);
    expect(unitA).toHaveProperty('dimensions', { L: 1, M: 1, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitA).toHaveProperty('coeff', 1e-3);// g has a coeff of 1e-3
    expect(unitA).toHaveProperty('offset', 0);
    expect(unitA).toHaveProperty('components',
        {
            'm': {
                unit: unitm,
                unitExponent: 1,
                prefixBase: 10,
                prefixExponent: -3
            },
            'g': {
                unit: unitg,
                unitExponent: 1,
                prefixBase: 10,
                prefixExponent: 3
            }
        });
    expect(unitA).toHaveProperty('name', 'milimeter*kilogram');
    expect(unitA).toHaveProperty('symbols', ['mm*kg']);
    expect(unitA.preferredUnitSymbol).toBe('mm*kg');
    expect(unitA.preferredSymbol).toBe('mm*kg');
    // Same units cancel prefixes: mm * km = m^2
    const unitkm: PrefixedUnit = new PrefixedUnit(prefixk, unitm);
    const unitB: CompoundUnit = new CompoundUnit(unitmm).addFactor(unitkm);
    expect(unitB).toHaveProperty('dimensions', { L: 2, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitB).toHaveProperty('coeff', 1);
    expect(unitB).toHaveProperty('offset', 0);
    expect(unitB).toHaveProperty('components',
        {
            'm': {
                unit: unitm,
                unitExponent: 2,
                prefixBase: 10,
                prefixExponent: 0
            }
        });
    expect(unitB).toHaveProperty('name', 'meter^2');
    expect(unitB).toHaveProperty('symbols', ['m^2']);
    expect(unitB.preferredUnitSymbol).toBe('m^2');
    expect(unitB.preferredSymbol).toBe('m^2');
    // Same unit combine asymetrical prefixes: µm * hm = cm^2
    const unitµm: PrefixedUnit = new PrefixedUnit(prefixµ, unitm);
    const unithm: PrefixedUnit = new PrefixedUnit(prefixh, unitm);
    const unitC: CompoundUnit = new CompoundUnit(unitµm).addFactor(unithm);
    expect(unitC).toHaveProperty('dimensions', { L: 2, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitC.coeff).toBeCloseTo(1e-4);// Due to float error
    expect(unitC).toHaveProperty('offset', 0);
    expect(unitC).toHaveProperty('components',
        {
            'm': {
                unit: unitm,
                unitExponent: 2,
                prefixBase: 10,
                prefixExponent: -4
            }
        });
    expect(unitC).toHaveProperty('name', 'centimeter^2');
    expect(unitC).toHaveProperty('symbols', ['cm^2']);
    expect(unitC.preferredUnitSymbol).toBe('cm^2');
    expect(unitC.preferredSymbol).toBe('cm^2');
    // Report prefixes on other unit that didn't have a prefix: L * mg / dg = cL
    const unitmg: PrefixedUnit = new PrefixedUnit(prefixm, unitg);
    const unitdg: PrefixedUnit = new PrefixedUnit(prefixd, unitg);
    const unitD: CompoundUnit = new CompoundUnit(unitL).addFactor(unitmg).addFactor(unitdg, -1);
    expect(unitD).toHaveProperty('dimensions', { L: 3, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitD.coeff).toBeCloseTo(1e-7);// Due to float errors
    expect(unitD).toHaveProperty('offset', 0);
    expect(unitD).toHaveProperty('components',
        {
            'L': {
                unit: unitL,
                unitExponent: 1,
                prefixBase: 1,// TODO: Should probably be set to 10 by knowing the unit base
                prefixExponent: 0
            },
            'g': {
                unit: unitg,
                unitExponent: 0,
                prefixBase: 10,
                prefixExponent: -2
            }
        });
    expect(unitD).toHaveProperty('name', 'centiLiter');
    expect(unitD).toHaveProperty('symbols', ['cL']);
    expect(unitD.preferredUnitSymbol).toBe('cL');
    expect(unitD.preferredSymbol).toBe('cL');
    // Balance pairs of prefixes: dam hg * dm / mg mL = km^2 / cL
    /*const unitdam: PrefixedUnit = new PrefixedUnit(prefixda, unitm);
    const unitdm: PrefixedUnit = new PrefixedUnit(prefixd, unitm);
    const unithg: PrefixedUnit = new PrefixedUnit(prefixh, unitg);
    const unitmL: PrefixedUnit = new PrefixedUnit(prefixm, unitL);
    const unitE: CompoundUnit = new CompoundUnit(unitdam).addFactor(unithg).addFactor(unitdm).addFactor(unitmg, -1).addFactor(unitmL, -1);
    expect(unitE).toHaveProperty('dimensions', { L: -1, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitE.coeff).toBeCloseTo(1e11);// Due to float errors
    expect(unitE).toHaveProperty('offset', 0);
    expect(unitE).toHaveProperty('components',
        {
            'm': {
                unit: unitm,
                unitExponent: 2,
                prefixBase: 10,
                prefixExponent: 0
            },
            'g': {
                unit: unitg,
                unitExponent: 0,
                prefixBase: 10,
                prefixExponent: 5
            },
            'L': {
                unit: unitL,
                unitExponent: 1,
                prefixBase: 10,
                prefixExponent: 3
            }
        });
    expect(unitE).toHaveProperty('name', 'kilometer^2*centiLiter^-1');
    expect(unitE).toHaveProperty('symbols', ['km^2*cL^-1']);
    expect(unitE.preferredUnitSymbol).toBe('km^2*cL^-1');
    expect(unitE.preferredSymbol).toBe('km^2*cL^-1');*/
    /*
    const unitE: CompoundUnit = new CompoundUnit(unitdam).addFactor(unithg).addFactor(unitdm).addFactor(unitmg, -1).addFactor(unitmL, -1)
    this: {
        "symbols":["m^2*hg"],
        "name":"meter^2*hectogram",
        "_preferredUnitSymbol":"m^2*hg",
        "coeff":100000,
        "offset":0,
        "dimensions":{"L":2,"M":0,"T":0,"I":0,"THETA":0,"N":0,"J":0},
        "components":{
            "m":{
                "unit":{
                    "symbols":["m"],
                    "name":"meter",
                    "_preferredUnitSymbol":"m",
                    "coeff":1,
                    "offset":0,
                    "dimensions":{"L":1,"M":0,"T":0,"I":0,"THETA":0,"N":0,"J":0}
                },
                "unitExponent":2,
                "prefixBase":10,
                "prefixExponent":0
            },
            "g":{
                "unit":{
                    "symbols":["g"],
                    "name":"gram",
                    "_preferredUnitSymbol":"g",
                    "coeff":0.001,
                    "offset":0,
                    "dimensions":{"L":0,"M":1,"T":0,"I":0,"THETA":0,"N":0,"J":0}
                },
                "unitExponent":0,
                "prefixBase":10,
                "prefixExponent":5
            }
        }
    }
    sortedComponents: [
        {
            "unit":{
                "symbols":["m"],
                "name":"meter",
                "_preferredUnitSymbol":"m",
                "coeff":1,
                "offset":0,
                "dimensions":{"L":1,"M":0,"T":0,"I":0,"THETA":0,"N":0,"J":0}
            },
            "unitExponent":2,
            "prefixBase":10,
            "prefixExponent":0,
            "prefix":{
                "symbol":"h",
                "name":"hecto",
                "factor":100,
                "_base":10,
                "_exponent":2
            }
        }
    ]

    const unitE: CompoundUnit = new CompoundUnit(unitdam).addFactor(unithg).addFactor(unitdm).addFactor(unitmL, -1).addFactor(unitmg, -1)
    this: {
        "symbols":["m^2*hg*mL^-1"],
        "name":"meter^2*hectogram*miliLiter^-1",
        "_preferredUnitSymbol":"m^2*hg*mL^-1",
        "coeff":100000000000,
        "offset":0,
        "dimensions":{"L":-1,"M":0,"T":0,"I":0,"THETA":0,"N":0,"J":0},
        "components":{
            "m":{
                "unit":{
                    "symbols":["m"],
                    "name":"meter",
                    "_preferredUnitSymbol":"m",
                    "coeff":1,
                    "offset":0,
                    "dimensions":{"L":1,"M":0,"T":0,"I":0,"THETA":0,"N":0,"J":0}
                },
                "unitExponent":2,
                "prefixBase":10,
                "prefixExponent":0
            },
            "g":{
                "unit":{
                    "symbols":["g"],
                    "name":"gram",
                    "_preferredUnitSymbol":"g",
                    "coeff":0.001,
                    "offset":0,
                    "dimensions":{"L":0,"M":1,"T":0,"I":0,"THETA":0,"N":0,"J":0}
                },
                "unitExponent":0,
                "prefixBase":10,
                "prefixExponent":5
            },
            "L":{
                "unit":{
                    "symbols":["L"],
                    "name":"Liter",
                    "_preferredUnitSymbol":"L",
                    "coeff":0.001,
                    "offset":0,
                    "dimensions":{"L":3,"M":0,"T":0,"I":0,"THETA":0,"N":0,"J":0}
                },
                "unitExponent":-1,
                "prefixBase":10,
                "prefixExponent":3
            }
        }
    }
    sortedComponents: [
        {
            "unit":{
                "symbols":["m"],
                "name":"meter",
                "_preferredUnitSymbol":"m",
                "coeff":1,
                "offset":0,
                "dimensions":{"L":1,"M":0,"T":0,"I":0,"THETA":0,"N":0,"J":0}
            },
            "unitExponent":2,
            "prefixBase":10,
            "prefixExponent":0,
            "prefix":{
                "symbol":"h",
                "name":"hecto",
                "factor":100,
                "_base":10,
                "_exponent":2
            }
        },{
            "unit":{
                "symbols":["L"],
                "name":"Liter",
                "_preferredUnitSymbol":"L",
                "coeff":0.001,
                "offset":0,
                "dimensions":{"L":3,"M":0,"T":0,"I":0,"THETA":0,"N":0,"J":0}
            },
            "unitExponent":-1,
            "prefixBase":10,
            "prefixExponent":3,
            "prefix":{
                "symbol":"m",
                "name":"mili",
                "factor":0.001,
                "_base":10,
                "_exponent":-3
            }
        }
    ]
    */
    // cg / g = 0.01: We don't have a choice but to keep a ratio of units
    const unitcg: PrefixedUnit = new PrefixedUnit(prefixc, unitg);
    const unitI: CompoundUnit = new CompoundUnit(unitcg).addFactor(unitg, -1);
    expect(unitI).toHaveProperty('dimensions', { L: 0, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitI.coeff).toBeCloseTo(1e-2);// Due to float errors
    expect(unitI).toHaveProperty('offset', 0);
    expect(unitI).toHaveProperty('components',
        {
            'g': {
                unit: unitg,
                unitExponent: 0,
                prefixBase: 10,
                prefixExponent: -2
            }
        });
    expect(unitI).toHaveProperty('name', 'centigram*gram^-1');
    expect(unitI).toHaveProperty('symbols', ['cg*g^-1']);
    expect(unitI.preferredUnitSymbol).toBe('cg*g^-1');
    expect(unitI.preferredSymbol).toBe('cg*g^-1');
    // Mg / dag = 1e5: We don't have a choice but to keep a ratio of units, but the global prefix factor doesn't directly translate into a prefix
    const unitMg: PrefixedUnit = new PrefixedUnit(prefixM, unitg);
    const unitdag: PrefixedUnit = new PrefixedUnit(prefixda, unitg);
    const unitJ: CompoundUnit = new CompoundUnit(unitMg).addFactor(unitdag, -1);
    expect(unitJ).toHaveProperty('dimensions', { L: 0, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitJ.coeff).toBeCloseTo(1e5);// Due to float errors
    expect(unitJ).toHaveProperty('offset', 0);
    expect(unitJ).toHaveProperty('components',
        {
            'g': {
                unit: unitg,
                unitExponent: 0,
                prefixBase: 10,
                prefixExponent: 5
            }
        });
    expect(unitJ).toHaveProperty('name', 'megagram*decagram^-1');
    expect(unitJ).toHaveProperty('symbols', ['Mg*dag^-1']);
    expect(unitJ.preferredUnitSymbol).toBe('Mg*dag^-1');
    expect(unitJ.preferredSymbol).toBe('Mg*dag^-1');
});

// logger.debug(JSON.stringify(unitD));
// Done: mm * kg = mm * kg : Preserves the prefixes
// Done: mm * km = m^2 : That one's easy, things cancel out
// Done: µm * hm = cm^2 : First problem, we end up with prefixes that weren't there in the first place
// Done: L * mg / dg = cL : Second problem, prefixes are moving from one unit to another.
// TODO: dam hg * dm / mg mL = km^2 / cL : Add these two issues, we can end up with using none of the initial prefixes being pretty much the only solution, with the total prefix factor having to be spread across several units.
// Todo: Mm * dam = 10 km^2 : We don't have a choice but to keep separate powers
// Done: cg / g = 0.01: We don't have a choice but to keep a ratio of units
// Done: Mg / dg = 1e5: We don't have a choice but to keep a ratio of units
// Todo: Mm * mL * cg/g = dm * L : We have to downgrade something and upgrade something
// Todo: Mm^2 * mL * cg/g = km^2 * daL
