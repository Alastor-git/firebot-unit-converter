import { UnexpectedError, UnitNotFoundError } from "./errors";
import { Prefix } from "./prefix";
import { Unit } from "./unit";
import { logger } from "@shared/firebot-modules";


export class UnitParser {
    static registeredUnits: {[key: string]: Unit} = {};
    static registeredPrefixes: {[key: string]: Prefix} = {};

    static registerUnit(unit: Unit): void {
        unit.symbols.forEach((symbol) => {
            if (symbol in UnitParser.registeredUnits) {
                logger.warn(`UnitConverter: Unit symbol ${symbol} already in use. Couldn't register unit ${unit.name}.`);
                return;
            }
            logger.info(`UnitConverter: Registering unit ${unit.name} under symbol ${symbol}.`);
            // Check that unit isn't already parsed as something else
            try {
                const parsedUnit = UnitParser.parseUnit(symbol);
                logger.warn(`UnitConverter: ${unit.name}'s symbol ${symbol} is conflicting with unit ${parsedUnit.name} and being parsed as ${parsedUnit.symbols[0]}. One of them isn't gonna work.`);
            } catch {
                // symbol isn't conflicting with any of the currently registered combinations
            }
            // Check that the unit works with each registered prefix
            for (const prefixSymbol of Object.keys(UnitParser.registeredPrefixes)) {
                try {
                    const parsedUnit = UnitParser.parseUnit(`${prefixSymbol}${symbol}`);
                    logger.warn(`UnitConverter: unit ${unit.name}'s symbol ${symbol} is conflicting with unit ${parsedUnit.name} when using prefix ${prefixSymbol}. ${prefixSymbol}${symbol} is being parsed as ${parsedUnit.symbols[0]}. One of them isn't gonna work.`);
                } catch {
                    // `${prefixSymbol}${symbol}` isn't conflicting with any of the currently registered combinations
                }
            }
            UnitParser.registeredUnits[symbol] = unit;
        });
    }

    static registerPrefix(prefix: Prefix): void {
        if (prefix.symbol in UnitParser.registeredPrefixes) {
            logger.warn(`UnitConverter: Prefix symbol ${prefix.symbol} already in use. Couldn't register prefix ${prefix.name}.`);
            return;
        }
        logger.info(`UnitConverter: Registering prefix ${prefix.name} under symbol ${prefix.symbol}.`);
        // Check the prefix works with each registered unit
        for (const unitSymbol of Object.keys(UnitParser.registeredUnits)) {
            try {
                const parsedUnit = UnitParser.parseUnit(`${prefix.symbol}${unitSymbol}`);
                logger.warn(`UnitConverter: Prefix ${prefix.name}'s symbol ${prefix.symbol} is creating a conflict between units ${UnitParser.registeredUnits[unitSymbol].name} and ${parsedUnit.name}. ${prefix.symbol}${unitSymbol} is being parsed as ${parsedUnit.symbols[0]}. One of them isn't gonna work.`);
            } catch {
                // `${prefix.symbol}${unitSymbol}` isn't conflicting with any of the currently registered combinations
            }
        }
        UnitParser.registeredPrefixes[prefix.symbol] = prefix;
    }

    static parseUnit(candidate: string): Unit {
        candidate = candidate.trim();
        let unitSymbol: string = "";
        let prefixSymbol: string = "";
        for (const symbol of Object.keys(UnitParser.registeredUnits)) {
            if (candidate.endsWith(symbol)) {
                if (symbol.length === candidate.length) {
                    unitSymbol = symbol;
                    prefixSymbol = "";
                    break;
                } else if (Object.keys(UnitParser.registeredPrefixes).includes((prefixSymbol = candidate.substring(0, candidate.length - symbol.length)))) {
                    unitSymbol = symbol;
                    break;
                }
            }
        }
        if (unitSymbol) {
            const foundUnit: Unit = UnitParser.registeredUnits[unitSymbol];
            const unit: Unit = new Unit(
                unitSymbol,
                foundUnit.name,
                foundUnit.dimensions,
                foundUnit.coeff,
                foundUnit.offset
            );
            if (prefixSymbol === '') {
                return unit;
            }
            const prefix: Prefix = UnitParser.registeredPrefixes[prefixSymbol];
            return new Unit(
                    `${prefix.symbol}${unit.symbols[0]}`,
                    `${prefix.name}${unit.name}`,
                    unit.dimensions,
                    unit.coeff * prefix.factor,
                    unit.offset
                );
        }
        throw new UnitNotFoundError(candidate);
    }

    static parseMathTreeUnits(tree: MathTree): MathTree<Unit> {
        switch (typeof tree) {
            case 'number':
                return tree;
            case 'string':
                return UnitParser.parseUnit(tree);
            case 'object':
                switch (tree.type) {
                    case 'empty':
                        return tree;
                    case 'add':
                        return {
                            type: 'add',
                            terms: tree.terms.map((term: MathTree): MathTree<Unit> => UnitParser.parseMathTreeUnits(term))
                        };
                    case 'oppose':
                        return {type: 'oppose', element: UnitParser.parseMathTreeUnits(tree.element)};
                    case 'div':
                        return {
                            type: 'div',
                            numerator: UnitParser.parseMathTreeUnits(tree.numerator),
                            denominator: UnitParser.parseMathTreeUnits(tree.denominator)
                        };
                    case 'mult':
                        return {
                            type: 'mult',
                            factors: tree.factors.map((factor: MathTree): MathTree<Unit> => UnitParser.parseMathTreeUnits(factor))
                        };
                    case 'pow':
                        return {
                            type: 'pow',
                            base: UnitParser.parseMathTreeUnits(tree.base),
                            exponent: UnitParser.parseMathTreeUnits(tree.exponent)
                        };
                    /* istanbul ignore next */
                    default:
                        throw new UnexpectedError(`Unrecognized tree element ${JSON.stringify(tree)}. This shouldn't happen. `);
                }
            /* istanbul ignore next */
            default:
                throw new UnexpectedError(`Unexpected object ${tree} received instead of a MathTree object. This shouldn't happen. `);
        }
    }
}