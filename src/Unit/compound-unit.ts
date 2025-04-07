import { PrefixError, UnexpectedError, UnitError } from "@/errors";
import { PrefixedUnit } from "./prefixed-unit";
import { Unit } from "./unit";
import { AbstractUnit, UnitDimensions } from "./abstract-unit";
import { Quantity } from "@/quantity";
import { Prefix } from "./prefix";
import { UnitParser } from "@/unit-parser";
import { logger } from "@/shared/firebot-modules";

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

    addFactor(unit: Unit | PrefixedUnit, exponent: number = 1): CompoundUnit {
        let unitSymbol: string;
        let baseUnit: Unit;
        let prefixBase: number;
        let prefixExponent: number;
        // If exponent is 0, we aren't changing anything
        if (exponent === 0) {
            this.updateUnit();
            return this;
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
        // If this isn't the first component or it is to a power, the unit we add must be a delta unit
        if (componentsKeys.length > 0 || exponent !== 1) {
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
        return this;
    }

    updateUnit() {
        let firstComponent: boolean = true;
        // Initialize values that we recalculate
        this.dimensions = { L: 0, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0};
        this.coeff = 1;
        this.offset = 0;
        // Update dimensions and total coefficient
        for (const component of Object.values(this.components)) {
            const componentDimensions = component.unit.dimensions;
            let dimension: keyof UnitDimensions;
            for (dimension in componentDimensions) {
                if (Object.hasOwn(componentDimensions, dimension)) {
                    this.dimensions[dimension] += componentDimensions[dimension] * component.unitExponent;
                }
            }
            this.coeff *= component.prefixBase ** component.prefixExponent * component.unit.coeff ** component.unitExponent;
            if (firstComponent) {
                firstComponent = false;
                this.offset = component.unit.offset;
            }
        }
        const prefixedComponents: UnitComponent[] = this.updatePrefix();
        this.updateSymbol(prefixedComponents);
        this.updateName(prefixedComponents);
    }

    updatePrefix(): UnitComponent[] {
        let remainingFactor: number = 1;
        const sortedComponents: UnitComponent[] = Object.values(this.components).map((component) => { // Copy the components to not mutate them
            return {...component};
        }).sort((componentA, componentB) => { // Sort by ascending exponent
            return componentB.unitExponent - componentA.unitExponent;
        });
        const sortedFilteredComponents: UnitComponent[] = sortedComponents.filter((component) => { // Units with 0 exponent can't have a prefix
            if (component.unitExponent === 0) {
                remainingFactor *= component.prefixBase ** component.prefixExponent;
                return false;
            }
            return true;
        });
        // See if we find the exact prefix for the remaining units
        sortedFilteredComponents.forEach((component) => {
            const currentPrefixExponent: number = component.prefixExponent;
            const prefix: Prefix | null = UnitParser.findPrefixFromExponent(currentPrefixExponent / component.unitExponent, component.prefixBase);
            if (prefix) {
                component.prefix = prefix;
            } else {
                remainingFactor *= component.prefixBase ** component.prefixExponent;
            }
        });
        if (remainingFactor === 1) {
            return sortedFilteredComponents;
        }
        // For units without a prefix, see if we can find a lower prefix
        sortedFilteredComponents.forEach((component) => {
            if (!component.prefix) {
                const currentPrefixExponent: number = component.prefixExponent;
                const prefix: Prefix | null = UnitParser.findBestPrefixFromExponent(currentPrefixExponent / component.unitExponent, component.prefixBase);
                if (prefix) {
                    component.prefix = prefix;
                    remainingFactor /= component.prefixBase ** (prefix.exponent * component.unitExponent);
                }
            }
        });
        if (remainingFactor === 1) {
            return sortedFilteredComponents;
        }
        // See if we can improve the prefix of a unit, starting from the highest exponent unit
        sortedFilteredComponents.forEach((component) => {
            if (component.prefix) {
                const currentPrefixExponent: number = component.prefix.exponent * component.unitExponent;
                const remainingExponent: number = Math.log2(remainingFactor) / Math.log2(component.prefixBase);
                const prefix: Prefix | null = UnitParser.findBestPrefixFromExponent((currentPrefixExponent + remainingExponent) / component.unitExponent, component.prefixBase);
                if (prefix) {
                    component.prefix = prefix;
                    remainingFactor /= component.prefixBase ** ((prefix.exponent - currentPrefixExponent) * component.unitExponent);
                }
            } else {
                const newPrefixBase: number = 10; // TODO: Have units store a preferred base so we can know what to pick here?
                const remainingExponent: number = Math.log2(remainingFactor) / Math.log2(newPrefixBase);
                const prefix: Prefix | null = UnitParser.findBestPrefixFromExponent(remainingExponent / component.unitExponent, newPrefixBase);
                if (prefix) {
                    component.prefix = prefix;
                    component.prefixBase = newPrefixBase;
                    remainingFactor /= component.prefixBase ** (prefix.exponent * component.unitExponent);
                }
            }
        });
        if (remainingFactor === 1) {
            return sortedFilteredComponents;
        }
        // Recursively try to upgrade a prefix while downgrading another to see if we can get closer
        // Split a unit with an exponent > 1 into several factors with separate prefixes
        // Split a unit with 0 exponent into a ratio of units with prefixes to account for the remaining prefactor
        sortedComponents.forEach((component) => {
            if (remainingFactor !== 1 && component.unitExponent === 0) {
                const newPrefixBase: number = component.prefixBase !== 1 ? component.prefixBase : 10;// TODO: Have units store a preferred base so we can know what to pick here?
                const remainingExponent: number = Math.log2(remainingFactor) / Math.log2(component.prefixBase);
                // At the numerator is the closest to the exact exponent approached from larger absolute values
                const numeratorPrefix: Prefix | null = UnitParser.findNextPrefixFromExponent(remainingExponent, newPrefixBase);
                const numeratorExponent: number = numeratorPrefix?.exponent ?? 0;
                // At the denuminator, we take the largest prefix we can to account for all remaining prefixes
                const denominatorPrefix: Prefix | null = UnitParser.findBestPrefixFromExponent(numeratorExponent - remainingExponent, newPrefixBase);
                const denominatorExponent: number = denominatorPrefix?.exponent ?? 0;
                // If we find the prefixes, add the unit
                if (numeratorPrefix || denominatorPrefix) {
                    sortedFilteredComponents.push({
                        unit: component.unit,
                        unitExponent: 1,
                        prefixBase: newPrefixBase,
                        prefixExponent: numeratorExponent,
                        prefix: numeratorPrefix ?? undefined
                    });
                    sortedFilteredComponents.push({
                        unit: component.unit,
                        unitExponent: -1,
                        prefixBase: newPrefixBase,
                        prefixExponent: denominatorExponent,
                        prefix: denominatorPrefix ?? undefined
                    });
                    remainingFactor /= newPrefixBase ** (numeratorExponent - denominatorExponent);
                }
            }
        });
        if (remainingFactor === 1) {
            return sortedFilteredComponents;
        }
        // If we have a remaining factor, that's an error case
        if (remainingFactor !== 1) {
            logger.debug(JSON.stringify(this));
            logger.debug(JSON.stringify(sortedFilteredComponents));
            throw new UnexpectedError(`There was a remaining factor of ${remainingFactor} for this unit. `);
        }
        return sortedFilteredComponents;
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
        this.preferredUnitSymbol = symbolString;
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
                nameString = `${nameString}${component.prefix?.name}`;
            }
            nameString = `${nameString}${component.unit.name}`;
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