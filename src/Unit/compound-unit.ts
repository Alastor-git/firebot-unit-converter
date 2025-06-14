import { PrefixError, UnexpectedError, UnitError } from "@/errors";
import { PrefixedUnit } from "./prefixed-unit";
import { Unit } from "./unit";
import { AbstractUnit, UnitDimensions } from "./abstract-unit";
import { Quantity } from "@/quantity";
import { Prefix } from "./prefix";
import { UnitParser } from "@/unit-parser";
import { logger } from "@/shared/firebot-modules";

export type UnitComponent = {
            unit: Unit,
            unitExponent: number,
            prefixBase: number,
            prefixExponent: number,
            prefix?: Prefix
        };

export class CompoundUnit extends AbstractUnit {
    components: {[unitSymbol: string]: UnitComponent} = {};

    constructor(unit: Unit | PrefixedUnit | null, unitExponent: number = 1) {
        super();

        this.addFactor(unit, unitExponent);
    }

    copy(): CompoundUnit {
        const newUnit: CompoundUnit = new CompoundUnit(null);
        Object.values(this.components).forEach((component) => {
            newUnit.addComponent({...component});
        });
        return newUnit;
    }

    addFactor(unit: Unit | PrefixedUnit | null, exponent: number = 1): CompoundUnit {
        let component: UnitComponent;
        // If exponent is 0, we aren't changing anything
        if (exponent === 0 || unit === null) {
            this.updateUnit();
            return this;
        }
        if (unit instanceof PrefixedUnit) {
            component = {
                unit: unit.baseUnit,
                unitExponent: 1,
                prefix: unit.prefix,
                prefixBase: unit.base,
                prefixExponent: unit.prefix.exponent
            };
        } else { // (unit instanceof Unit)
            component = {
                unit: unit,
                unitExponent: 1,
                prefixBase: unit.base,
                prefixExponent: 0
            };
        }
        return this.addComponent(component, exponent);
    }

    addComponent(component: UnitComponent, exponent: number = 1): CompoundUnit {
        let unitSymbol: string;
        let baseUnit: Unit = component.unit;
        const unitExponent: number = component.unitExponent * exponent;
        //const prefix: Prefix | undefined = component.prefix ?? undefined;
        const prefixBase: number = component.prefixBase;
        const prefixExponent: number = component.prefixExponent * exponent;

        const componentsKeys = Object.keys(this.components);
        const matchingSymbols = componentsKeys.filter(componentSymbol => baseUnit.symbols.includes(componentSymbol));
        // If there was a single components, we switch the existing component to a delta unit.
        if (componentsKeys.length === 1) {
            this.components[componentsKeys[0]].unit = this.components[componentsKeys[0]].unit.deltaUnit();
        }
        // If this isn't the first component or it is to a power, the unit we add must be a delta unit
        if (componentsKeys.length > 0 || unitExponent !== 1) {
            baseUnit = baseUnit.deltaUnit();
        }
        // If the unit is already part of the compound, add to the component, otherwise add the unit.
        if (matchingSymbols.length > 1) {
            throw new UnitError(`Several components match with unit ${component}. `);
        } else if (matchingSymbols.length === 1) {
            unitSymbol = matchingSymbols[0];
            if (!this.components[unitSymbol].unit.isDeltaEqual(baseUnit)) {
                throw new UnitError(`Symbols match for ${unitSymbol} but units do not match. `);
            }
            if (this.components[unitSymbol].prefixBase !== 1 && prefixBase !== 1 && this.components[unitSymbol].prefixBase !== prefixBase) {
                throw new PrefixError(`Prefixes for unit ${unitSymbol} don't have the same base. `);
            }
            if (prefixBase !== 1) {
                this.components[unitSymbol].prefixBase = prefixBase;
            }
            this.components[unitSymbol].unitExponent += unitExponent;
            this.components[unitSymbol].prefixExponent += prefixExponent;
            // We keep the unit registered as part of the component if the exponent cancels out.
            // Allows to keep prefixCoeff and possibly reapply it to future factors using the same unit
        } else { // No matching symbol
            unitSymbol = baseUnit.preferredUnitSymbol;
            this.components[unitSymbol] = {
                unit: baseUnit,
                unitExponent: unitExponent,
                //prefix: prefix,
                prefixBase: prefixBase,
                prefixExponent: prefixExponent
            };
        }
        this.updateUnit();
        return this;
    }

    updateUnit() {
        let firstComponent: boolean = true;
        // Initialize values that we recalculate
        this.dimensions = { L: 0, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0, A: 0, D: 0};
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
            } else { // Set offset to 0 as soon as we reach second component. Not sure that's strictly necessary, but better safe
                this.offset = 0;
            }
        }
        const prefixedComponents: UnitComponent[] = this.updatePrefix();
        this.updateSymbol(prefixedComponents);
        this.updateName(prefixedComponents);
    }

    updatePrefix(): UnitComponent[] {
        let prefixedComponents: UnitComponent[] = [];
        const bases: number[] = [];
        Object.values(this.components).forEach((component) => {
            const newBase = component.prefixBase;
            if (!bases.includes(newBase)) {
                bases.push(newBase);
            }
        });

        bases.forEach((base) => {
            prefixedComponents = prefixedComponents.concat(this.updatePrefixBase(base));
        });

        // TODO: Separate non prefixable units and bases so we avoid situations like kg*in*g^-1 ?
        return prefixedComponents.sort((componentA, componentB) => { // Sort by ascending exponent
            return componentB.unitExponent - componentA.unitExponent;
        });
    }

    updatePrefixBase(base: number): UnitComponent[] {
        let remainingFactor: number = 1;
        const components: {[unitSymbol: string]: UnitComponent} = {...this.components};
        if ('' in components) {
            components[''].unitExponent = 0;
        }
        const sortedComponents: UnitComponent[] = Object.values(components).map((component) => { // Copy the components to not mutate them
            return {...component};
        }).filter((component) => {
            if (component.prefixBase === base) {
                return true;
            }
            return false;
        }).sort((componentA, componentB) => { // Sort by ascending exponent
            return componentB.unitExponent - componentA.unitExponent;
        });
        const nonPrefixableComponents: UnitComponent[] = sortedComponents.filter((component) => {
            return !component.unit.prefixable && component.unitExponent !== 0;
        });
        const sortedFilteredComponents: UnitComponent[] = sortedComponents.filter((component) => { // Units with 0 exponent can't have a prefix
            if (component.unitExponent === 0 || !component.unit.prefixable) {
                remainingFactor *= component.prefixBase ** component.prefixExponent;
                return false;
            }
            return true;
        });
        // Round the remainingFactor to avoid precision loss
        remainingFactor = Math.round(remainingFactor * 1e6) / 1e6;
        // See if we find the exact prefix for the remaining units
        sortedFilteredComponents.forEach((component) => {
            const currentPrefixExponent: number = component.prefixExponent;
            const prefix: Prefix | null = UnitParser.findPrefixFromExponent(currentPrefixExponent / component.unitExponent, component.prefixBase);
            if (currentPrefixExponent === 0) {
                component.prefix = undefined;
            } else if (prefix) {
                component.prefix = prefix;
            } else {
                remainingFactor *= component.prefixBase ** component.prefixExponent;
            }
        });
        // Round the remainingFactor to avoid precision loss
        remainingFactor = Math.round(remainingFactor * 1e6) / 1e6;
        if (remainingFactor === 1) {
            return sortedFilteredComponents.concat(nonPrefixableComponents);
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
        // Round the remainingFactor to avoid precision loss
        remainingFactor = Math.round(remainingFactor * 1e6) / 1e6;
        if (remainingFactor === 1) {
            return sortedFilteredComponents.concat(nonPrefixableComponents);
        }
        // See if we can improve the prefix of a unit, starting from the highest exponent unit
        sortedFilteredComponents.forEach((component) => {
            if (component.prefix) {
                const currentPrefixExponent: number = component.prefix.exponent * component.unitExponent;
                const remainingExponent: number = Math.log2(remainingFactor) / Math.log2(component.prefixBase);
                const prefix: Prefix | null = UnitParser.findBestPrefixFromExponent((currentPrefixExponent + remainingExponent) / component.unitExponent, component.prefixBase);
                if (prefix) {
                    component.prefix = prefix;
                    remainingFactor /= component.prefixBase ** (prefix.exponent * component.unitExponent - currentPrefixExponent);
                }
            } else {
                const newPrefixBase: number = component.unit.base;
                const remainingExponent: number = Math.log2(remainingFactor) / Math.log2(newPrefixBase);
                const prefix: Prefix | null = UnitParser.findBestPrefixFromExponent(remainingExponent / component.unitExponent, newPrefixBase);
                if (prefix) {
                    component.prefix = prefix;
                    component.prefixBase = newPrefixBase;
                    remainingFactor /= component.prefixBase ** (prefix.exponent * component.unitExponent);
                }
            }
        });
        // Round the remainingFactor to avoid precision loss
        remainingFactor = Math.round(remainingFactor * 1e6) / 1e6;
        if (remainingFactor === 1) {
            return sortedFilteredComponents.concat(nonPrefixableComponents);
        }
        // Recursively try to upgrade a prefix while downgrading another to see if we can get closer
        const componentSolutions: {
            component1: UnitComponent;
            component1NewPrefix: Prefix;
            component1NewPrefixExponent: number;
            component2: UnitComponent;
            component2NewPrefix: Prefix | null;
            component2NewPrefixExponent: number;
            newPrefixBase: number;
            exponentDifference: number;
        }[] = [];
        sortedFilteredComponents.forEach((component1) => {
            const newPrefixBase: number = component1.unit.base;
            const remainingExponent: number = Math.log2(remainingFactor) / Math.log2(newPrefixBase);
            const component1OldExponent: number = (component1.prefix?.exponent ?? 0) * component1.unitExponent;

            sortedFilteredComponents.forEach((component2) => {
                // NOTE: Do we need to test only a single upgrade ot every possible upgrade?
                // More computationally efficient to test a signle upgrade but is it enough?
                // I think it's enough. Not 100% sure though.
                const component2OldExponent: number = (component2.prefix?.exponent ?? 0) * component2.unitExponent;
                if (component1 === component2) {
                    return;
                }
                // Can't be a candidate if both units don't have the same prefix base
                if (component2.prefixBase !== 1 && component2.prefixBase !== newPrefixBase) {
                    return;
                }
                // Find the next best for component1 using prefix + remainingFactor, see what the prefixDifference is
                const component1NewPrefix: Prefix | null = UnitParser.findNextPrefixFromExponent((component1OldExponent + remainingExponent) / component1.unitExponent, newPrefixBase);
                const component1NewPrefixExponent: number = (component1NewPrefix?.exponent ?? 0) * component1.unitExponent;
                const exponentDifference: number = component1NewPrefixExponent - component1OldExponent - remainingExponent;
                // See if we have a prefix for component2 using prefix - exponentDifference
                // component1NewPrefixExponent = component1OldExponent + remainingExponent + exponentDifference
                // component2NewPrefixExponent = component2OldExponent - exponentDifference
                const component2NewPrefix: Prefix | null = UnitParser.findPrefixFromExponent((component2OldExponent - exponentDifference) / component2.unitExponent, newPrefixBase);
                // If so, that's a candidate solution
                // There's a corner case if the resulting prefix is no prefix that we need to handle here
                if (component1NewPrefix !== null && (component2NewPrefix !== null || component2OldExponent === exponentDifference)) {
                    componentSolutions.push({
                        component1: component1,
                        component1NewPrefix: component1NewPrefix,
                        component1NewPrefixExponent: component1NewPrefixExponent,
                        component2: component2,
                        component2NewPrefix: component2NewPrefix,
                        component2NewPrefixExponent: (component2NewPrefix?.exponent ?? 0) * component2.unitExponent,
                        newPrefixBase: newPrefixBase,
                        exponentDifference: exponentDifference
                    });
                }
            });
        });
        // Pick the best candidate solution
        // Criteria for best candidate:
        // - MUST catch up the remainingExponent (should we allow partial catch up ?)
        // - SHOULD minimize exponentDifference (minimum backchange required)
        // - ???
        // Sort best to worst
        const sortedCandidates = componentSolutions.sort((candidate1, candidate2) => Math.abs(candidate1.exponentDifference) - Math.abs(candidate2.exponentDifference));
        if (sortedCandidates.length > 0) {
            const solution = sortedCandidates[0];
            remainingFactor *= solution.component1.prefixBase ** ((solution.component1?.prefix?.exponent ?? 0) * solution.component1.unitExponent);
            remainingFactor *= solution.component2.prefixBase ** ((solution.component2?.prefix?.exponent ?? 0) * solution.component2.unitExponent);
            solution.component1.prefix = solution.component1NewPrefix;
            solution.component1.prefixBase = solution.newPrefixBase;
            solution.component2.prefix = solution.component2NewPrefix ?? undefined;
            solution.component2.prefixBase = solution.newPrefixBase;
            remainingFactor /= solution.component1.prefixBase ** ((solution.component1?.prefix?.exponent ?? 0) * solution.component1.unitExponent);
            remainingFactor /= solution.component2.prefixBase ** ((solution.component2?.prefix?.exponent ?? 0) * solution.component2.unitExponent);
        }
        // Round the remainingFactor to avoid precision loss
        remainingFactor = Math.round(remainingFactor * 1e6) / 1e6;
        if (remainingFactor === 1) {
            return sortedFilteredComponents.concat(nonPrefixableComponents);
        }
        // Split a unit with an exponent > 1 into several factors with separate prefixes
        const resortedFilteredComponents = [...sortedFilteredComponents].sort((component1, component2) => {
            const exp1: number = Math.abs(component1.unitExponent) + 0.25 * (1 + Math.sign(component1.unitExponent));
            const exp2: number = Math.abs(component2.unitExponent) + 0.25 * (1 + Math.sign(component2.unitExponent));
            return exp1 - exp2;
        });
        resortedFilteredComponents.forEach((component) => {
            if (remainingFactor !== 1 && component.unitExponent >= 2) {
                const newPrefixBase: number = component.unit.base;
                const remainingExponent: number = Math.log2(remainingFactor) / Math.log2(component.prefixBase);
                const totalComponentPrefixExponent: number = remainingExponent + (component.prefix?.exponent ?? 0) * component.unitExponent;
                // The first term, we fit with as much exponent as we can get.
                const component1UnitExponent: number = component.unitExponent - 1;
                const component1Prefix: Prefix | null = UnitParser.findBestPrefixFromExponent(totalComponentPrefixExponent / component1UnitExponent, newPrefixBase);
                const component1PrefixExponent: number = component1Prefix?.exponent ?? 0;
                // Then we complement with the second term
                const component2UnitExponent: number = 1;
                const component2Prefix: Prefix | null = UnitParser.findBestPrefixFromExponent((totalComponentPrefixExponent - component1PrefixExponent * component1UnitExponent) / component2UnitExponent, newPrefixBase);
                const component2PrefixExponent: number = component2Prefix?.exponent ?? 0;
                // If we found a solution with different prefixes, update stuff
                if (component1PrefixExponent !== component2PrefixExponent) {
                    remainingFactor *= newPrefixBase ** ((component.prefix?.exponent ?? 0) * component.unitExponent);
                    component.unitExponent = component1UnitExponent;
                    component.prefixBase = newPrefixBase;
                    component.prefix = component1Prefix ?? undefined;
                    component.prefixExponent = component1PrefixExponent;
                    remainingFactor /= newPrefixBase ** (component1PrefixExponent * component1UnitExponent);
                    sortedFilteredComponents.push({
                        unit: component.unit,
                        unitExponent: component2UnitExponent,
                        prefixBase: newPrefixBase,
                        prefixExponent: component2PrefixExponent,
                        prefix: component2Prefix ?? undefined
                    });
                    remainingFactor /= newPrefixBase ** (component2PrefixExponent * component2UnitExponent);
                }
            }
        });
        // Round the remainingFactor to avoid precision loss
        remainingFactor = Math.round(remainingFactor * 1e6) / 1e6;
        if (remainingFactor === 1) {
            return sortedFilteredComponents.concat(nonPrefixableComponents);
        }
        // Split a unit with 0 exponent into a ratio of units with prefixes to account for the remaining prefactor
        sortedComponents.forEach((component) => {
            if (remainingFactor !== 1 && component.unitExponent === 0 && component.unit.prefixable) {
                const newPrefixBase: number = component.unit.base;
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
        // Round the remainingFactor to avoid precision loss
        remainingFactor = Math.round(remainingFactor * 1e6) / 1e6;
        // If we have a remaining factor, that's an error case
        if (remainingFactor !== 1) {
            logger.debug(JSON.stringify(this));
            logger.debug(JSON.stringify(sortedFilteredComponents));
            throw new UnexpectedError(`There was a remaining factor of ${remainingFactor} for this unit. `);
        }
        return sortedFilteredComponents.concat(nonPrefixableComponents);
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
        const newUnit: CompoundUnit = this.copy();
        Object.values(newUnit.components).forEach((element) => {
            element.unit = element.unit.deltaUnit();
        });
        newUnit.updateUnit();
        return newUnit;
    }

    multiply(other: AbstractUnit): CompoundUnit;
    multiply(other: number): Quantity;
    multiply(other: AbstractUnit | number): CompoundUnit | Quantity;
    multiply(other: AbstractUnit | number): CompoundUnit | Quantity {
        if (typeof other === 'number') {
            return new Quantity(other, this);
        } else if (other instanceof Unit || other instanceof PrefixedUnit) {
            return this.copy().addFactor(other, 1);
        } else if (other instanceof CompoundUnit) {
            const product: CompoundUnit = this.copy();
            Object.values(other.components).forEach((component) => {
                product.addComponent(component);
            });
            return product;
        }
        throw new UnitError(`Unsupported unit type ${other.constructor.name} for multiplication with CompoundUnit. `);
    }

    divide(other: AbstractUnit): CompoundUnit;
    divide(other: number): Quantity;
    divide(other: AbstractUnit | number): CompoundUnit | Quantity;
    divide(other: AbstractUnit | number): CompoundUnit | Quantity {
        if (typeof other === 'number') {
            return new Quantity(1 / other, this);
        } else if (other instanceof Unit || other instanceof PrefixedUnit) {
            return this.copy().addFactor(other, -1);
        } else if (other instanceof CompoundUnit) {
            const ratio: CompoundUnit = this.copy();
            Object.values(other.components).forEach((component) => {
                ratio.addComponent(component, -1);
            });
            return ratio;
        }
        throw new UnitError(`Unsupported unit type ${other.constructor.name} for multiplication with CompoundUnit. `);
    }

    power(exponent: number): CompoundUnit {
        const result: CompoundUnit = this.copy();
        Object.values(result.components).forEach((component) => {
            component.unitExponent *= exponent;
            component.prefixExponent *= exponent;
        });
        result.updateUnit();
        return result;
    }
}