import "@/mocks/firebot-modules";
import { logger } from "@/shared/firebot-modules";
import { UnitParser } from "@/unit-parser";
import { Prefix } from "./prefix";
import { Unit } from "./unit";
import { CompoundUnit } from "./compound-unit";
import { PrefixedUnit } from "./prefixed-unit";
import { PrefixError, UnitError, ValueError } from "@/errors";
import { compileFunction } from "vm";

const prefixM: Prefix = new Prefix('M', 'mega', 10, 6);
const prefixk: Prefix = new Prefix('k', 'kilo', 10, 3);
const prefixh: Prefix = new Prefix('h', 'hecto', 10, 2);
const prefixda: Prefix = new Prefix('da', 'deca', 10, 1);
const prefixd: Prefix = new Prefix('d', 'deci', 10, -1);
const prefixc: Prefix = new Prefix('c', 'centi', 10, -2);
const prefixm: Prefix = new Prefix('m', 'mili', 10, -3);
const prefixµ: Prefix = new Prefix('µ', 'micro', 10, -6);

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
const unitin: Unit = new Unit(['in', "''"], 'inch', { L: 1 }, 2.54e-2);
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
    // Test null unit
    const unitG: CompoundUnit = new CompoundUnit(null, 1);
    expect(unitG).toHaveProperty('dimensions', { L: 0, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitG).toHaveProperty('coeff', 1);
    expect(unitG).toHaveProperty('offset', 0);
    expect(unitG).toHaveProperty('components', {});
    expect(unitG).toHaveProperty('name', '');
    expect(unitG).toHaveProperty('symbols', ['']);
    expect(() => unitG.preferredUnitSymbol).toThrow(ValueError);
    expect(() => unitG.preferredSymbol).toThrow(ValueError);
});

test('addFactor', () => {
    // Add null unit
    const unit0: CompoundUnit = new CompoundUnit(unitm);
    expect(unit0.addFactor(null)).toMatchObject(unit0);
    // Add exponent 0 unit
    expect(unit0.addFactor(unitL, 0)).toMatchObject(unit0);
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
    const unittC: CompoundUnit = new CompoundUnit(unitµm).addFactor(unithm);
    expect(unittC).toHaveProperty('dimensions', { L: 2, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittC.coeff).toBeCloseTo(1e-4);// Due to float error
    expect(unittC).toHaveProperty('offset', 0);
    expect(unittC).toHaveProperty('components',
        {
            'm': {
                unit: unitm,
                unitExponent: 2,
                prefixBase: 10,
                prefixExponent: -4
            }
        });
    expect(unittC).toHaveProperty('name', 'centimeter^2');
    expect(unittC).toHaveProperty('symbols', ['cm^2']);
    expect(unittC.preferredUnitSymbol).toBe('cm^2');
    expect(unittC.preferredSymbol).toBe('cm^2');
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
                prefixBase: 1, // TODO: Should probably be set to 10 by knowing the unit base
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
    // Downgrade a prefix and upgrade another : Mm * mL * cg/g = km * cL
    const unitMm: PrefixedUnit = new PrefixedUnit(prefixM, unitm);
    const unitmL: PrefixedUnit = new PrefixedUnit(prefixm, unitL);
    const unitcg: PrefixedUnit = new PrefixedUnit(prefixc, unitg);
    const unitE: CompoundUnit = new CompoundUnit(unitMm).addFactor(unitmL).addFactor(unitcg).addFactor(unitg, -1);
    expect(unitE).toHaveProperty('dimensions', { L: 4, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitE.coeff).toBeCloseTo(1e-2);// Due to float errors
    expect(unitE).toHaveProperty('offset', 0);
    expect(unitE).toHaveProperty('components',
        {
            'm': {
                unit: unitm,
                unitExponent: 1,
                prefixBase: 10,
                prefixExponent: 6
            },
            'L': {
                unit: unitL,
                unitExponent: 1,
                prefixBase: 10,
                prefixExponent: -3
            },
            'g': {
                unit: unitg,
                unitExponent: 0,
                prefixBase: 10,
                prefixExponent: -2
            }
        });
    expect(unitE).toHaveProperty('name', 'kilometer*centiLiter');
    expect(unitE).toHaveProperty('symbols', ['km*cL']);
    expect(unitE.preferredUnitSymbol).toBe('km*cL');
    expect(unitE.preferredSymbol).toBe('km*cL');
    // Downgrade a prefix and upgrade another on a unit with exponent : Mm^2 * mL * cg/g = km^2 * daL
    const unitF: CompoundUnit = new CompoundUnit(unitMm, 2).addFactor(unitmL).addFactor(unitcg).addFactor(unitg, -1);
    expect(unitF).toHaveProperty('dimensions', { L: 5, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitF.coeff).toBeCloseTo(1e4);// Due to float errors
    expect(unitF).toHaveProperty('offset', 0);
    expect(unitF).toHaveProperty('components',
        {
            'm': {
                unit: unitm,
                unitExponent: 2,
                prefixBase: 10,
                prefixExponent: 12
            },
            'L': {
                unit: unitL,
                unitExponent: 1,
                prefixBase: 10,
                prefixExponent: -3
            },
            'g': {
                unit: unitg,
                unitExponent: 0,
                prefixBase: 10,
                prefixExponent: -2
            }
        });
    expect(unitF).toHaveProperty('name', 'kilometer^2*decaLiter');
    expect(unitF).toHaveProperty('symbols', ['km^2*daL']);
    expect(unitF.preferredUnitSymbol).toBe('km^2*daL');
    expect(unitF.preferredSymbol).toBe('km^2*daL');
    // Balance pairs of prefixes: dam hg * dm / mg mL = km^2 / cL
    const unitdm: PrefixedUnit = new PrefixedUnit(prefixd, unitm);
    const unitdam: PrefixedUnit = new PrefixedUnit(prefixda, unitm);
    const unithg: PrefixedUnit = new PrefixedUnit(prefixh, unitg);
    const unitG: CompoundUnit = new CompoundUnit(unitdam).addFactor(unithg).addFactor(unitdm).addFactor(unitmg, -1).addFactor(unitmL, -1);
    expect(unitG).toHaveProperty('dimensions', { L: -1, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitG.coeff).toBeCloseTo(1e11);// Due to float errors
    expect(unitG).toHaveProperty('offset', 0);
    expect(unitG).toHaveProperty('components',
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
                unitExponent: -1,
                prefixBase: 10,
                prefixExponent: 3
            }
        });
    expect(unitG).toHaveProperty('name', 'kilometer^2*centiLiter^-1');
    expect(unitG).toHaveProperty('symbols', ['km^2*cL^-1']);
    expect(unitG.preferredUnitSymbol).toBe('km^2*cL^-1');
    expect(unitG.preferredSymbol).toBe('km^2*cL^-1');
    // Mm * dam = 10 km^2 : We don't have a choice but to keep separate powers
    const unitH: CompoundUnit = new CompoundUnit(unitMm).addFactor(unitdam);
    expect(unitH).toHaveProperty('dimensions', { L: 2, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unitH.coeff).toBeCloseTo(1e7);// Due to float errors
    expect(unitH).toHaveProperty('offset', 0);
    expect(unitH).toHaveProperty('components',
        {
            'm': {
                unit: unitm,
                unitExponent: 2,
                prefixBase: 10,
                prefixExponent: 7
            }
        });
    expect(unitH).toHaveProperty('name', 'megameter*decameter');
    expect(unitH).toHaveProperty('symbols', ['Mm*dam']);
    expect(unitH.preferredUnitSymbol).toBe('Mm*dam');
    expect(unitH.preferredSymbol).toBe('Mm*dam');
    // cg / g = 0.01: We don't have a choice but to keep a ratio of units
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
    // Add factors involving offsets
    const unitK: CompoundUnit = new CompoundUnit(unitC, 1);
    expect(unitK.offset).toBe(unitC.offset);
    expect(unitK.addFactor(unitC, 1).offset).toBe(0);
    expect(unitK.addFactor(unitg, 1).offset).toBe(0);

    // Test error cases
    // Unit added matches two separate factors
    const unittL: CompoundUnit = new CompoundUnit(null);
    unittL.components['in'] = {
            unit: unitin,
            unitExponent: 1,
            prefixBase: 1,
            prefixExponent: 0
    };
    unittL.components["''"] = {
            unit: unitin,
            unitExponent: 1,
            prefixBase: 1,
            prefixExponent: 0
    };
    expect(() => unittL.addFactor(unitin, 1)).toThrow(UnitError);
    // We add two components that share the same symbol
    const unittM: CompoundUnit = new CompoundUnit(unitm);
    const unitFakem: Unit = new Unit('m', 'fake meter', { M: 1 });
    expect(() => unittM.addFactor(unitFakem, 1)).toThrow(UnitError);

    // Add a factor with a prefix that has a different base than existing one
    const unittN: CompoundUnit = new CompoundUnit(new PrefixedUnit(prefixh, unitm), 1);
    const prefixMi: Prefix = new Prefix('Mi', 'Mébi', 2, 20);
    expect(() => unittN.addFactor(new PrefixedUnit(prefixMi, unitm), 1)).toThrow(PrefixError);
});

test('copy', () => {
    const unitA: CompoundUnit = new CompoundUnit(unitg, 1);
    expect(unitA.copy()).toMatchObject(unitA);
    expect(unitA.copy().addFactor(unitg, 1)).not.toMatchObject(unitA);
    expect(unitA.copy().addFactor(unitL, 1)).not.toMatchObject(unitA);
    // Check that components are copies. We want a deep copy rather than a shallow one.
    const unitACopy: CompoundUnit = unitA.copy();
    unitACopy.components['g'].unit = unitm;
    expect(unitACopy).not.toMatchObject(unitA);
});

test('deltaUnit', () => {
    const unitdC: PrefixedUnit = new PrefixedUnit(prefixd, unitC);
    const unitdaC: PrefixedUnit = new PrefixedUnit(prefixda, unitC);
    const unitmg: PrefixedUnit = new PrefixedUnit(prefixm, unitg);
    const unithg: PrefixedUnit = new PrefixedUnit(prefixh, unitg);
    const unitmL: PrefixedUnit = new PrefixedUnit(prefixm, unitL);
    const deltaUnitdC: PrefixedUnit = unitdC.deltaUnit();
    const deltaUnitdaC: PrefixedUnit = unitdaC.deltaUnit();
    const deltaUnitmg: PrefixedUnit = unitmg.deltaUnit();
    const deltaUnithg: PrefixedUnit = unithg.deltaUnit();
    const deltaUnitmL: PrefixedUnit = unitmL.deltaUnit();
    // In this situation, the deltaUnit should match, but the base unit should be a delta to begin with
    const testObject: CompoundUnit = new CompoundUnit(unitdaC)
    .addFactor(unithg)
    .addFactor(unitdC)
    .addFactor(unitmg, -1)
    .addFactor(unitmL, -1);
    const expectedDeltaObject: CompoundUnit = new CompoundUnit(deltaUnitdaC)
    .addFactor(deltaUnithg)
    .addFactor(deltaUnitdC)
    .addFactor(deltaUnitmg, -1)
    .addFactor(deltaUnitmL, -1);
    const deltaObject: CompoundUnit = testObject.deltaUnit();
    expect(deltaObject).toMatchObject(expectedDeltaObject);
    expect(deltaObject).toMatchObject(testObject);
    // Test a situation where all units aren't delta units already
    const testObject2: CompoundUnit = new CompoundUnit(unitdaC);
    const expectedDeltaObject2: CompoundUnit = new CompoundUnit(deltaUnitdaC);
    const deltaObject2: CompoundUnit = testObject2.deltaUnit();
    expect(deltaObject2).not.toMatchObject(testObject2);
    expect(deltaObject2).toMatchObject(expectedDeltaObject2);
    expect(expectedDeltaObject2).not.toMatchObject(testObject2);
});