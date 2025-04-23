import "@/mocks/firebot-modules";
import { logger } from "@/shared/firebot-modules";
import { UnitParser } from "@/unit-parser";
import { Prefix } from "./prefix";
import { Unit } from "./unit";
import { CompoundUnit, UnitComponent } from "./compound-unit";
import { PrefixedUnit } from "./prefixed-unit";
import { PrefixError, UnitError } from "@/errors";
import { Quantity } from "@/quantity";

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
const unitF: Unit = new Unit('°F', 'fahrenheit', { THETA: 1 }, 5 / 9, 273.15 - 32 * 5 / 9);
const unitin: Unit = new Unit(['in', "''"], 'inch', { L: 1 }, 2.54e-2);
/* Strictly speaking, I don't think we need to register the units for this
UnitParser.registerUnit(unitL);
UnitParser.registerUnit(unitm);
UnitParser.registerUnit(unitg);
UnitParser.registerUnit(unitC);
*/
test('constructor', () => {
    // Test simple unit
    const unittA: CompoundUnit = new CompoundUnit(unitL);
    expect(unittA).toHaveProperty('dimensions', { L: 3, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittA).toHaveProperty('coeff', 1e-3);
    expect(unittA).toHaveProperty('offset', 0);
    expect(unittA).toHaveProperty('components',
        {
            'L': {
                unit: unitL,
                unitExponent: 1,
                prefixBase: 1,
                prefixExponent: 0
            }
        });
    expect(unittA).toHaveProperty('name', 'Liter');
    expect(unittA).toHaveProperty('symbols', ['L']);
    expect(unittA.preferredUnitSymbol).toBe('L');
    expect(unittA.preferredSymbol).toBe('L');
    // Test prefixed unit
    const unitmL: PrefixedUnit = new PrefixedUnit(prefixm, unitL);
    const unittB: CompoundUnit = new CompoundUnit(unitmL);
    expect(unittB).toHaveProperty('dimensions', { L: 3, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittB).toHaveProperty('coeff', 1e-6);
    expect(unittB).toHaveProperty('offset', 0);
    expect(unittB).toHaveProperty('components',
        {
            'L': {
                unit: unitL,
                unitExponent: 1,
                prefixBase: 10,
                prefixExponent: -3
            }
        });
    expect(unittB).toHaveProperty('name', 'miliLiter');
    expect(unittB).toHaveProperty('symbols', ['mL']);
    expect(unittB.preferredUnitSymbol).toBe('mL');
    expect(unittB.preferredSymbol).toBe('mL');
    // Same with offset
    const unitmC: PrefixedUnit = new PrefixedUnit(prefixm, unitC);
    const unittC: CompoundUnit = new CompoundUnit(unitmC);
    expect(unittC).toHaveProperty('dimensions', { L: 0, M: 0, T: 0, I: 0, THETA: 1, N: 0, J: 0});
    expect(unittC).toHaveProperty('coeff', 1e-3);
    expect(unittC).toHaveProperty('offset', 273.15);
    expect(unittC).toHaveProperty('components',
        {
            '°C': {
                unit: unitC,
                unitExponent: 1,
                prefixBase: 10,
                prefixExponent: -3
            }
        });
    expect(unittC).toHaveProperty('name', 'milicelsius');
    expect(unittC).toHaveProperty('symbols', ['m°C']);
    expect(unittC.preferredUnitSymbol).toBe('m°C');
    expect(unittC.preferredSymbol).toBe('m°C');
    // Test exponent on simple unit
    const unittD: CompoundUnit = new CompoundUnit(unitL, 3);
    expect(unittD).toHaveProperty('dimensions', { L: 9, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittD).toHaveProperty('coeff', 1e-9);
    expect(unittD).toHaveProperty('offset', 0);
    expect(unittD).toHaveProperty('components',
        {
            'L': {
                unit: unitL,
                unitExponent: 3,
                prefixBase: 1,
                prefixExponent: 0
            }
        });
    expect(unittD).toHaveProperty('name', 'Liter^3');
    expect(unittD).toHaveProperty('symbols', ['L^3']);
    expect(unittD.preferredUnitSymbol).toBe('L^3');
    expect(unittD.preferredSymbol).toBe('L^3');
    // Test exponent on prefixed unit
    const unittE: CompoundUnit = new CompoundUnit(unitmL, 3);
    expect(unittE).toHaveProperty('dimensions', { L: 9, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittE).toHaveProperty('coeff', 1e-18);
    expect(unittE).toHaveProperty('offset', 0);
    expect(unittE).toHaveProperty('components',
        {
            'L': {
                unit: unitL,
                unitExponent: 3,
                prefixBase: 10,
                prefixExponent: -9
            }
        });
    expect(unittE).toHaveProperty('name', 'miliLiter^3');
    expect(unittE).toHaveProperty('symbols', ['mL^3']);
    expect(unittE.preferredUnitSymbol).toBe('mL^3');
    expect(unittE.preferredSymbol).toBe('mL^3');
    // Test 0 exponent
    const unittF: CompoundUnit = new CompoundUnit(unitmL, 0);
    expect(unittF).toHaveProperty('dimensions', { L: 0, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittF).toHaveProperty('coeff', 1);
    expect(unittF).toHaveProperty('offset', 0);
    expect(unittF).toHaveProperty('components', {});
    expect(unittF).toHaveProperty('name', '');
    expect(unittF).toHaveProperty('symbols', ['']);
    expect(unittF.preferredUnitSymbol).toBe('');
    expect(unittF.preferredSymbol).toBe('');
    // Test null unit
    const unittG: CompoundUnit = new CompoundUnit(null, 1);
    expect(unittG).toHaveProperty('dimensions', { L: 0, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittG).toHaveProperty('coeff', 1);
    expect(unittG).toHaveProperty('offset', 0);
    expect(unittG).toHaveProperty('components', {});
    expect(unittG).toHaveProperty('name', '');
    expect(unittG).toHaveProperty('symbols', ['']);
    expect(unittG.preferredUnitSymbol).toBe('');
    expect(unittG.preferredSymbol).toBe('');
});

test('addFactor', () => {
    // Add null unit
    const unitt0: CompoundUnit = new CompoundUnit(unitm);
    expect(unitt0.addFactor(null)).toMatchObject(unitt0);
    // Add exponent 0 unit
    expect(unitt0.addFactor(unitL, 0)).toMatchObject(unitt0);
    // Dissimilar units preserve prefixes: mm * kg = mm * kg
    const unitmm: PrefixedUnit = new PrefixedUnit(prefixm, unitm);
    const unitkg: PrefixedUnit = new PrefixedUnit(prefixk, unitg);
    const unittA: CompoundUnit = new CompoundUnit(unitmm).addFactor(unitkg);
    expect(unittA).toHaveProperty('dimensions', { L: 1, M: 1, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittA).toHaveProperty('coeff', 1e-3);// g has a coeff of 1e-3
    expect(unittA).toHaveProperty('offset', 0);
    expect(unittA).toHaveProperty('components',
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
    expect(unittA).toHaveProperty('name', 'milimeter*kilogram');
    expect(unittA).toHaveProperty('symbols', ['mm*kg']);
    expect(unittA.preferredUnitSymbol).toBe('mm*kg');
    expect(unittA.preferredSymbol).toBe('mm*kg');
    // Same units cancel prefixes: mm * km = m^2
    const unitkm: PrefixedUnit = new PrefixedUnit(prefixk, unitm);
    const unittB: CompoundUnit = new CompoundUnit(unitmm).addFactor(unitkm);
    expect(unittB).toHaveProperty('dimensions', { L: 2, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittB).toHaveProperty('coeff', 1);
    expect(unittB).toHaveProperty('offset', 0);
    expect(unittB).toHaveProperty('components',
        {
            'm': {
                unit: unitm,
                unitExponent: 2,
                prefixBase: 10,
                prefixExponent: 0
            }
        });
    expect(unittB).toHaveProperty('name', 'meter^2');
    expect(unittB).toHaveProperty('symbols', ['m^2']);
    expect(unittB.preferredUnitSymbol).toBe('m^2');
    expect(unittB.preferredSymbol).toBe('m^2');
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
    const unittD: CompoundUnit = new CompoundUnit(unitL).addFactor(unitmg).addFactor(unitdg, -1);
    expect(unittD).toHaveProperty('dimensions', { L: 3, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittD.coeff).toBeCloseTo(1e-7);// Due to float errors
    expect(unittD).toHaveProperty('offset', 0);
    expect(unittD).toHaveProperty('components',
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
    expect(unittD).toHaveProperty('name', 'centiLiter');
    expect(unittD).toHaveProperty('symbols', ['cL']);
    expect(unittD.preferredUnitSymbol).toBe('cL');
    expect(unittD.preferredSymbol).toBe('cL');
    // Downgrade a prefix and upgrade another : Mm * mL * cg/g = km * cL
    const unitMm: PrefixedUnit = new PrefixedUnit(prefixM, unitm);
    const unitmL: PrefixedUnit = new PrefixedUnit(prefixm, unitL);
    const unitcg: PrefixedUnit = new PrefixedUnit(prefixc, unitg);
    const unittE: CompoundUnit = new CompoundUnit(unitMm).addFactor(unitmL).addFactor(unitcg).addFactor(unitg, -1);
    expect(unittE).toHaveProperty('dimensions', { L: 4, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittE.coeff).toBeCloseTo(1e-2);// Due to float errors
    expect(unittE).toHaveProperty('offset', 0);
    expect(unittE).toHaveProperty('components',
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
    expect(unittE).toHaveProperty('name', 'kilometer*centiLiter');
    expect(unittE).toHaveProperty('symbols', ['km*cL']);
    expect(unittE.preferredUnitSymbol).toBe('km*cL');
    expect(unittE.preferredSymbol).toBe('km*cL');
    // Downgrade a prefix and upgrade another on a unit with exponent : Mm^2 * mL * cg/g = km^2 * daL
    const unittF: CompoundUnit = new CompoundUnit(unitMm, 2).addFactor(unitmL).addFactor(unitcg).addFactor(unitg, -1);
    expect(unittF).toHaveProperty('dimensions', { L: 5, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittF.coeff).toBeCloseTo(1e4);// Due to float errors
    expect(unittF).toHaveProperty('offset', 0);
    expect(unittF).toHaveProperty('components',
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
    expect(unittF).toHaveProperty('name', 'kilometer^2*decaLiter');
    expect(unittF).toHaveProperty('symbols', ['km^2*daL']);
    expect(unittF.preferredUnitSymbol).toBe('km^2*daL');
    expect(unittF.preferredSymbol).toBe('km^2*daL');
    // Balance pairs of prefixes: dam hg * dm / mg mL = km^2 / cL
    const unitdm: PrefixedUnit = new PrefixedUnit(prefixd, unitm);
    const unitdam: PrefixedUnit = new PrefixedUnit(prefixda, unitm);
    const unithg: PrefixedUnit = new PrefixedUnit(prefixh, unitg);
    const unittG: CompoundUnit = new CompoundUnit(unitdam).addFactor(unithg).addFactor(unitdm).addFactor(unitmg, -1).addFactor(unitmL, -1);
    expect(unittG).toHaveProperty('dimensions', { L: -1, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittG.coeff).toBeCloseTo(1e11);// Due to float errors
    expect(unittG).toHaveProperty('offset', 0);
    expect(unittG).toHaveProperty('components',
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
    expect(unittG).toHaveProperty('name', 'kilometer^2*centiLiter^-1');
    expect(unittG).toHaveProperty('symbols', ['km^2*cL^-1']);
    expect(unittG.preferredUnitSymbol).toBe('km^2*cL^-1');
    expect(unittG.preferredSymbol).toBe('km^2*cL^-1');
    // Mm * dam = 10 km^2 : We don't have a choice but to keep separate powers
    const unittH: CompoundUnit = new CompoundUnit(unitMm).addFactor(unitdam);
    expect(unittH).toHaveProperty('dimensions', { L: 2, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittH.coeff).toBeCloseTo(1e7);// Due to float errors
    expect(unittH).toHaveProperty('offset', 0);
    expect(unittH).toHaveProperty('components',
        {
            'm': {
                unit: unitm,
                unitExponent: 2,
                prefixBase: 10,
                prefixExponent: 7
            }
        });
    expect(unittH).toHaveProperty('name', 'megameter*decameter');
    expect(unittH).toHaveProperty('symbols', ['Mm*dam']);
    expect(unittH.preferredUnitSymbol).toBe('Mm*dam');
    expect(unittH.preferredSymbol).toBe('Mm*dam');
    // cg / g = 0.01: We don't have a choice but to keep a ratio of units
    const unittI: CompoundUnit = new CompoundUnit(unitcg).addFactor(unitg, -1);
    expect(unittI).toHaveProperty('dimensions', { L: 0, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittI.coeff).toBeCloseTo(1e-2);// Due to float errors
    expect(unittI).toHaveProperty('offset', 0);
    expect(unittI).toHaveProperty('components',
        {
            'g': {
                unit: unitg,
                unitExponent: 0,
                prefixBase: 10,
                prefixExponent: -2
            }
        });
    expect(unittI).toHaveProperty('name', 'centigram*gram^-1');
    expect(unittI).toHaveProperty('symbols', ['cg*g^-1']);
    expect(unittI.preferredUnitSymbol).toBe('cg*g^-1');
    expect(unittI.preferredSymbol).toBe('cg*g^-1');
    // Mg / dag = 1e5: We don't have a choice but to keep a ratio of units, but the global prefix factor doesn't directly translate into a prefix
    const unitMg: PrefixedUnit = new PrefixedUnit(prefixM, unitg);
    const unitdag: PrefixedUnit = new PrefixedUnit(prefixda, unitg);
    const unittJ: CompoundUnit = new CompoundUnit(unitMg).addFactor(unitdag, -1);
    expect(unittJ).toHaveProperty('dimensions', { L: 0, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0});
    expect(unittJ.coeff).toBeCloseTo(1e5);// Due to float errors
    expect(unittJ).toHaveProperty('offset', 0);
    expect(unittJ).toHaveProperty('components',
        {
            'g': {
                unit: unitg,
                unitExponent: 0,
                prefixBase: 10,
                prefixExponent: 5
            }
        });
    expect(unittJ).toHaveProperty('name', 'megagram*decagram^-1');
    expect(unittJ).toHaveProperty('symbols', ['Mg*dag^-1']);
    expect(unittJ.preferredUnitSymbol).toBe('Mg*dag^-1');
    expect(unittJ.preferredSymbol).toBe('Mg*dag^-1');
    // Add factors involving offsets
    const unittK: CompoundUnit = new CompoundUnit(unitC, 1);
    expect(unittK.offset).toBe(unitC.offset);
    expect(unittK.addFactor(unitC, 1).offset).toBe(0);
    expect(unittK.addFactor(unitg, 1).offset).toBe(0);

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

test('addComponent', () => {
    const testObject: CompoundUnit = new CompoundUnit(null);
    // First component, we should keep the delta
    const component1: UnitComponent = {
        unit: unitC,
        unitExponent: 1,
        prefix: prefixm,
        prefixBase: 10,
        prefixExponent: -3
    };
    const expectedObject: CompoundUnit = new CompoundUnit(new PrefixedUnit(prefixm, unitC));
    testObject.addComponent(component1);
    expect(testObject).toMatchObject(expectedObject);
    expect(testObject.components['°C'].unit).toMatchObject(unitC);
    // Second component with another offset unit should drop the delta from both
    const component2: UnitComponent = {
        unit: unitF,
        unitExponent: 1,
        prefix: prefixd,
        prefixBase: 10,
        prefixExponent: -1
    };
    testObject.addComponent(component2);
    expectedObject.addFactor(new PrefixedUnit(prefixd, unitF));
    expect(testObject).toMatchObject(expectedObject);
    expect(testObject.components['°C'].unit).not.toMatchObject(unitC);
    expect(testObject.components['°C'].unit).toMatchObject(unitC.deltaUnit());
    expect(testObject.components['°F'].unit).not.toMatchObject(unitF);
    expect(testObject.components['°F'].unit).toMatchObject(unitF.deltaUnit());
    // Drop the delta from first component if there's an exponent.
    const testObject2: CompoundUnit = new CompoundUnit(null);
    const expectedObject2: CompoundUnit = new CompoundUnit(new PrefixedUnit(prefixm, unitC), 2);
    testObject2.addComponent(component1, 2);
    expect(testObject2).toMatchObject(expectedObject2);
    expect(testObject2.components['°C'].unit).not.toMatchObject(unitC);
    expect(testObject2.components['°C'].unit).toMatchObject(unitC.deltaUnit());
    const component3: UnitComponent = {
        unit: unitC,
        unitExponent: 2,
        prefix: prefixµ,
        prefixBase: 10,
        prefixExponent: -6
    };
    const testObject3: CompoundUnit = new CompoundUnit(null);
    const expectedObject3: CompoundUnit = new CompoundUnit(new PrefixedUnit(prefixm, unitC), 2);
    testObject3.addComponent(component3);
    expect(testObject3).toMatchObject(expectedObject3);
    expect(testObject3.components['°C'].unit).not.toMatchObject(unitC);
    expect(testObject3.components['°C'].unit).toMatchObject(unitC.deltaUnit());
    // Add to existing component
    const component4: UnitComponent = {
        unit: unitC,
        unitExponent: 1,
        prefix: prefixk,
        prefixBase: 10,
        prefixExponent: 3
    };
    testObject.addComponent(component4);
    expectedObject.addFactor(new PrefixedUnit(prefixk, unitC));
    expect(testObject).toMatchObject(expectedObject);

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
    const unitinComponent: UnitComponent = {
            unit: unitin,
            unitExponent: 1,
            prefixBase: 1,
            prefixExponent: 0
    };
    expect(() => unittL.addComponent(unitinComponent)).toThrow(UnitError);
    // We add two components that share the same symbol
    const unittM: CompoundUnit = new CompoundUnit(unitm);
    const unitFakem: Unit = new Unit('m', 'fake meter', { M: 1 });
    const unitFakemComponent: UnitComponent = {
            unit: unitFakem,
            unitExponent: 1,
            prefixBase: 1,
            prefixExponent: 0
    };
    expect(() => unittM.addComponent(unitFakemComponent)).toThrow(UnitError);

    // Add a factor with a prefix that has a different base than existing one
    const unittN: CompoundUnit = new CompoundUnit(new PrefixedUnit(prefixh, unitm), 1);
    const prefixMi: Prefix = new Prefix('Mi', 'Mébi', 2, 20);
    const unitMimComponent: UnitComponent = {
            unit: unitm,
            unitExponent: 1,
            prefix: prefixMi,
            prefixBase: 2,
            prefixExponent: 20
    };
    expect(() => unittN.addComponent(unitMimComponent)).toThrow(PrefixError);
});

test('copy', () => {
    const unittA: CompoundUnit = new CompoundUnit(unitg, 1);
    expect(unittA.copy()).toMatchObject(unittA);
    expect(unittA.copy().addFactor(unitg, 1)).not.toMatchObject(unittA);
    expect(unittA.copy().addFactor(unitL, 1)).not.toMatchObject(unittA);
    // Check that components are copies. We want a deep copy rather than a shallow one.
    const unitACopy: CompoundUnit = unittA.copy();
    unitACopy.addFactor(unitg, 1);
    expect(unitACopy).not.toMatchObject(unittA);
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

test("multiply", () => {
    const unitdC: PrefixedUnit = new PrefixedUnit(prefixd, unitC);
    const unitdaC: PrefixedUnit = new PrefixedUnit(prefixda, unitC);
    const unitmg: PrefixedUnit = new PrefixedUnit(prefixm, unitg);
    const unithg: PrefixedUnit = new PrefixedUnit(prefixh, unitg);
    const unitmL: PrefixedUnit = new PrefixedUnit(prefixm, unitL);
    const unittA: CompoundUnit = new CompoundUnit(unitdaC)
        .addFactor(unitmg, -1)
        .addFactor(unitmL, -1);
    const unittB: CompoundUnit = new CompoundUnit(unithg)
        .addFactor(unitdC);
    const quantityA: Quantity = new Quantity(5, unittA);
    const unittAB: CompoundUnit = new CompoundUnit(unitdaC)
        .addFactor(unithg)
        .addFactor(unitdC)
        .addFactor(unitmg, -1)
        .addFactor(unitmL, -1);
    const unittC: CompoundUnit = new CompoundUnit(unitdaC);

    expect(unittA.multiply(unittB)).toMatchObject(unittAB);
    expect(unittA.multiply(unittB).isEqual(unittAB)).toBe(true);
    expect(unittB.multiply(unittA).isEqual(unittAB)).toBe(true);
    expect(unittA.multiply(Unit.ONE).isDeltaEqual(unittA)).toBe(true);
    expect(unittA.multiply(Unit.ONE).isEqual(unittA)).toBe(true);
    expect(unittC.multiply(Unit.ONE).isDeltaEqual(unittC)).toBe(true);
    expect(unittC.multiply(Unit.ONE).isEqual(unittC)).toBe(false);
    expect(unittA.multiply(5).isEqual(quantityA)).toBe(true);
});

test("divide", () => {
    const unitdC: PrefixedUnit = new PrefixedUnit(prefixd, unitC);
    const unitdaC: PrefixedUnit = new PrefixedUnit(prefixda, unitC);
    const unitmg: PrefixedUnit = new PrefixedUnit(prefixm, unitg);
    const unithg: PrefixedUnit = new PrefixedUnit(prefixh, unitg);
    const unitmL: PrefixedUnit = new PrefixedUnit(prefixm, unitL);
    const unittA: CompoundUnit = new CompoundUnit(unitdaC)
        .addFactor(unithg)
        .addFactor(unitdC);
    const unittB: CompoundUnit = new CompoundUnit(unitmg)
        .addFactor(unitmL);
    const quantityA: Quantity = new Quantity(1 / 5, unittA);
    const unittAB: CompoundUnit = new CompoundUnit(unitdaC)
        .addFactor(unithg)
        .addFactor(unitdC)
        .addFactor(unitmg, -1)
        .addFactor(unitmL, -1);
    const unittC: CompoundUnit = new CompoundUnit(unitdaC);

    expect(unittA.divide(unittB)).toMatchObject(unittAB);
    expect(unittA.divide(unittB).isEqual(unittAB)).toBe(true);
    expect(unittB.divide(unittA).isEqual(unittAB)).toBe(false);
    expect(unittA.divide(unittB).multiply(unittB).isDeltaEqual(unittA)).toBe(true);
    expect(unittA.divide(Unit.ONE).isDeltaEqual(unittA)).toBe(true);
    expect(unittA.divide(Unit.ONE).isEqual(unittA)).toBe(true);
    expect(unittC.divide(Unit.ONE).isDeltaEqual(unittC)).toBe(true);
    expect(unittC.divide(Unit.ONE).isEqual(unittC)).toBe(false);
    expect(unittA.divide(5).isEqual(quantityA)).toBe(true);
});

test("power", () => {
    const power: number = 3;
    const unitdC: PrefixedUnit = new PrefixedUnit(prefixd, unitC);
    const unitdaC: PrefixedUnit = new PrefixedUnit(prefixda, unitC);
    const unitmg: PrefixedUnit = new PrefixedUnit(prefixm, unitg);
    const unithg: PrefixedUnit = new PrefixedUnit(prefixh, unitg);
    const unitmL: PrefixedUnit = new PrefixedUnit(prefixm, unitL);
    const unittA: CompoundUnit = new CompoundUnit(unitdaC)
        .addFactor(unithg)
        .addFactor(unitdC)
        .addFactor(unitmg, -1)
        .addFactor(unitmL, -1);
    const unittApow: CompoundUnit = new CompoundUnit(unitdaC, power)
        .addFactor(unithg, power)
        .addFactor(unitdC, power)
        .addFactor(unitmg, -power)
        .addFactor(unitmL, -power);

    expect(unittA.power(power).isEqual(unittApow)).toBe(true);
    expect(unittA.power(power).isEqual(unittA)).toBe(false);
    expect(unittA.power(power).power(1 / power).isDeltaEqual(unittA)).toBe(true);
    expect(unittA.power(0).isEqual(Unit.ONE)).toBe(true);
});
