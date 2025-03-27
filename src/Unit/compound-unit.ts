import { PrefixError, UnexpectedError, UnitError } from "@/errors";
import { PrefixedUnit } from "./prefixed-unit";
import { Unit } from "./unit";
import { AbstractUnit, UnitDimensions } from "./abstract-unit";
import { Quantity } from "@/quantity";
import { Prefix } from "./prefix";
import { UnitParser } from "@/unit-parser";

type UnitComponent = {
            unit: Unit,
            unitExponent: number,
            prefixBase: number,
            prefixExponent: number,
            prefix?: Prefix
        };

export class CompoundUnit extends AbstractUnit {
    components: {[unitSymbol: string]: UnitComponent} = {};

    constructor(unit: Unit | PrefixedUnit, unitExponent: number = 1) {
        super();

        this.addFactor(unit, unitExponent);
    }

    copy(): CompoundUnit {
        throw new UnexpectedError(`Unimplemented method`);
    }

    addFactor(unit: Unit | PrefixedUnit, exponent: number = 1) {
        let unitSymbol: string;
        let baseUnit: Unit;
        let prefixBase: number;
        let prefixExponent: number;
        // If exponent is 0, we aren't changing anything
        if (exponent === 0) {
            return;
        }
        if (unit instanceof PrefixedUnit) {
            baseUnit = unit.baseUnit;
            prefixBase = unit.prefix.base;
            prefixExponent = unit.prefix.exponent;
        } else { // (unit instanceof Unit)
            baseUnit = unit;
            prefixBase = 1;
            prefixExponent = 0;
        }
        const componentsKeys = Object.keys(this.components);
        const matchingSymbols = componentsKeys.filter(componentSymbol => baseUnit.symbols.includes(componentSymbol));
        // If there was a single components, we switch the existing component to a delta unit.
        if (componentsKeys.length === 1) {
            this.components[componentsKeys[0]].unit = this.components[componentsKeys[0]].unit.deltaUnit();
        }
        // If this isn't the first component, the unit we add must be a delta unit
        if (componentsKeys.length > 0) {
            unit = unit.deltaUnit();
        }
        // If the unit is already part of the compound, add to the component, otherwise add the unit.
        if (matchingSymbols.length > 1) {
            throw new UnitError(`Several components match with unit ${unit}`);
        } else if (matchingSymbols.length === 1) {
            unitSymbol = matchingSymbols[0];
            if (!this.components[unitSymbol].unit.isEqual(baseUnit)) {
                throw new UnitError(`Symbols match for ${unitSymbol} but units do not match.`);
            }
            if (this.components[unitSymbol].prefixBase !== 1 && prefixBase !== 1 && this.components[unitSymbol].prefixBase !== prefixBase) {
                throw new PrefixError(`Prefixes for unit ${unitSymbol} don't have the same base.`);
            }
            if (prefixBase !== 1) {
                this.components[unitSymbol].prefixBase = prefixBase;
            }
            this.components[unitSymbol].unitExponent = this.components[unitSymbol].unitExponent + exponent;
            this.components[unitSymbol].prefixExponent = this.components[unitSymbol].prefixExponent + prefixExponent * exponent;
            // We keep the unit registered as part of the component if the exponent cancels out.
            // Allows to keep prefixCoeff and possibly reapply it to future factors using the same unit
        } else { // No matching symbol
            unitSymbol = unit.preferredUnitSymbol;
            this.components[unitSymbol] = {
                unit: baseUnit,
                unitExponent: exponent,
                prefixBase: prefixBase,
                prefixExponent: prefixExponent * exponent
            };
        }
        this.updateUnit();
    }

    updateUnit() {
        // Update dimensions and total coefficient
        for (const component of Object.values(this.components)) {
            const componentDimensions = component.unit.dimensions;
            let dimension: keyof UnitDimensions;
            for (dimension in componentDimensions) {
                if (Object.hasOwn(componentDimensions, dimension)) {
                    this.dimensions[dimension] = componentDimensions[dimension] * component.unitExponent
                                                + (this.dimensions[dimension] ? this.dimensions[dimension] : 0);
                }
            }
            this.coeff = this.coeff * component.prefixBase ** component.prefixExponent * component.unit.coeff ** component.unitExponent;
        }
        const prefixedComponents: UnitComponent[] = this.updatePrefix();
        this.updateSymbol(prefixedComponents);
        this.updateName(prefixedComponents);
    }

    updatePrefix(): UnitComponent[] {
        let remainingFactor: number = 1;
        const sortedComponents: UnitComponent[] = Object.values(this.components).sort((componentA, componentB) => {
            return componentB.unitExponent - componentA.unitExponent;
        }).filter((component) => { // Units with 0 exponent can't have a prefix
            if (component.unitExponent === 0) {
                remainingFactor = remainingFactor * component.prefixBase ** component.prefixExponent;
                return false;
            }
            return true;
        });
        // See if we find the exact prefix for the remaining units
        sortedComponents.forEach((component, componentIndex) => {
            const prefix: Prefix | null = UnitParser.findPrefixFromExponent(component.prefixExponent / component.unitExponent, component.prefixBase);
            if (prefix) {
                sortedComponents[componentIndex].prefix = prefix;
            } else {
                remainingFactor = remainingFactor * component.prefixBase ** component.prefixExponent;
            }
        });
        if (remainingFactor === 1) {
            return sortedComponents;
        }
        // For units without a prefix, see if we can find a lower prefix
        sortedComponents.forEach((component, componentIndex) => {
            if (!component.prefix) {
                const prefix: Prefix | null = UnitParser.findBestPrefixFromExponent(component.prefixExponent / component.unitExponent, component.prefixBase);
                if (prefix) {
                    sortedComponents[componentIndex].prefix = prefix;
                    remainingFactor = remainingFactor / component.prefixBase ** (component.prefixExponent - prefix.exponent * component.unitExponent);
                }
            }
        });
        if (remainingFactor === 1) {
            return sortedComponents;
        }
        // See if we can improve the prefix of a unit, starting from the highest exponent unit
        // See if we can have a pair of prefixes for the remaining factor on a unit with no factor
        // See if we can have a pair of prefixes for the remaining factor on a unit with already a factor
        // Move to a quantity
        // If we have a remaining factor, that's an error case
        if (remainingFactor !== 1) {
            throw new UnexpectedError(`There was a remaining factor of ${remainingFactor} for this unit. `);
        }
        return [];
    }

    updateSymbol(prefixedComponents: UnitComponent[]) {
        let symbolString: string = "";
        let first = true;
        for (const component of prefixedComponents) {
            if (!first) {
                symbolString = `${symbolString}*`;
            }
            first = false;
            if (component.prefix) {
                symbolString = `${symbolString}${component.prefix?.symbol}`;
            }
            symbolString = `${symbolString}${component.unit.preferredSymbol}`;
            if (component.unitExponent !== 1) {
                symbolString = `${symbolString}^${component.unitExponent}`;
            }
        }
        this.symbols = [symbolString];
    }

    updateName(prefixedComponents: UnitComponent[]) {
        let nameString: string = "";
        let first = true;
        for (const component of prefixedComponents) {
            if (!first) {
                nameString = `${nameString}*`;
            }
            first = false;
            if (component.prefix) {
                nameString = `${nameString}${component.prefix?.symbol}`;
            }
            nameString = `${nameString}${component.unit.preferredSymbol}`;
            if (component.unitExponent !== 1) {
                nameString = `${nameString}^${component.unitExponent}`;
            }
        }
        this.name = nameString;
    }

    deltaUnit(): CompoundUnit {
        throw new UnexpectedError(`Unimplemented method`);
    }

    multiply(other: AbstractUnit): CompoundUnit;
    multiply(other: number): Quantity;
    multiply(other: AbstractUnit | number): CompoundUnit | Quantity;
    multiply(other: AbstractUnit | number): CompoundUnit | Quantity {
        throw new UnexpectedError(`Unimplemented method`);
    }

    divide(other: AbstractUnit): CompoundUnit;
    divide(other: number): Quantity;
    divide(other: AbstractUnit | number): CompoundUnit | Quantity;
    divide(other: unknown): CompoundUnit | Quantity {
        throw new UnexpectedError(`Unimplemented method`);
    }

    power(exponent: number): CompoundUnit {
        throw new UnexpectedError(`Unimplemented method`);
    }
}