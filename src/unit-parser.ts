import { UnitNotFoundError } from "./errors";
import { Prefix } from "./prefix";
import { Quantity } from "./quantity";
import { Unit } from "./unit";
import {
    logger
} from "@shared/firebot-modules";

export class UnitParser {
    static registeredUnits: {[key: string]: Unit} = {};
    static registeredPrefixes: {[key: string]: Prefix} = {};

    // FIXME: private re: RegExp = new RegExp('(?P<unit>[a-zA-Z°Ωµ]+)\\^?(?P<pow>[-+]?\\d*\\.?\\d*)');

    static registerUnit(unit: Unit): void {
        unit.symbols.forEach((symbol) => {
            if (symbol in UnitParser.registeredUnits) {
                logger.warn(`UnitConverter: Unit symbol ${symbol} already in use. Couldn't register unit ${unit.name}.`);
                return;
            }
            logger.info(`UnitConverter: Registering unit ${unit.name} under symbol ${symbol}.`);
            // Check that unit isn't already parsed as something else
            try {
                const parsedQuantity = UnitParser.parseUnit(symbol);
                logger.warn(`UnitConverter: ${unit.name}'s symbol ${symbol} is conflicting with unit ${parsedQuantity.unit.name} and being parsed as ${parsedQuantity}. One of them isn't gonna work.`);
            } catch (err) {
                // symbol isn't conflicting with any of the currently registered combinations
            }
            // Check that the unit works with each registered prefix
            for (const prefixSymbol of Object.keys(UnitParser.registeredPrefixes)) {
                try {
                    const parsedQuantity = UnitParser.parseUnit(`${prefixSymbol}${symbol}`);
                    logger.warn(`UnitConverter: unit ${unit.name}'s symbol ${symbol} is conflicting with unit ${parsedQuantity.unit.name} when using prefix ${prefixSymbol}. ${prefixSymbol}${symbol} is being parsed as ${parsedQuantity}. One of them isn't gonna work.`);
                } catch (err) {
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
                const parsedQuantity = UnitParser.parseUnit(`${prefix.symbol}${unitSymbol}`);
                logger.warn(`UnitConverter: Prefix ${prefix.name}'s symbol ${prefix.symbol} is creating a conflict between units ${UnitParser.registeredUnits[unitSymbol].name} and ${parsedQuantity.unit.name}. ${prefix.symbol}${unitSymbol} is being parsed as ${parsedQuantity}. One of them isn't gonna work.`);
            } catch (err) {
                // `${prefix.symbol}${unitSymbol}` isn't conflicting with any of the currently registered combinations
            }
        }
        UnitParser.registeredPrefixes[prefix.symbol] = prefix;
    }

    static parseUnit(candidate: string): Quantity {
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
            return new Quantity(prefixSymbol === "" ? 1 : UnitParser.registeredPrefixes[prefixSymbol].factor, UnitParser.registeredUnits[unitSymbol]);
        }
        throw new UnitNotFoundError(candidate);
    }
}