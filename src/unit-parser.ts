import { UnitNotFoundError } from "./errors";
import { AbstractUnit } from "./Unit/abstract-unit";
import { Prefix } from "./Unit/prefix";
import { Unit } from "./Unit/unit";
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
                logger.warn(`UnitConverter: ${unit.name}'s symbol ${symbol} is conflicting with unit ${parsedUnit.name} and being parsed as ${parsedUnit.preferredSymbol}. One of them isn't gonna work.`);
            } catch {
                // symbol isn't conflicting with any of the currently registered combinations
            }
            // Check that the unit works with each registered prefix
            for (const prefixSymbol of Object.keys(UnitParser.registeredPrefixes)) {
                try {
                    const parsedUnit = UnitParser.parseUnit(`${prefixSymbol}${symbol}`);
                    logger.warn(`UnitConverter: unit ${unit.name}'s symbol ${symbol} is conflicting with unit ${parsedUnit.name} when using prefix ${prefixSymbol}. ${prefixSymbol}${symbol} is being parsed as ${parsedUnit.preferredSymbol}. One of them isn't gonna work.`);
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
                logger.warn(`UnitConverter: Prefix ${prefix.name}'s symbol ${prefix.symbol} is creating a conflict between units ${UnitParser.registeredUnits[unitSymbol].name} and ${parsedUnit.name}. ${prefix.symbol}${unitSymbol} is being parsed as ${parsedUnit.preferredSymbol}. One of them isn't gonna work.`);
            } catch {
                // `${prefix.symbol}${unitSymbol}` isn't conflicting with any of the currently registered combinations
            }
        }
        UnitParser.registeredPrefixes[prefix.symbol] = prefix;
    }

    static parseUnit(candidate: string): AbstractUnit {
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
            if (prefixSymbol === '') {
                return new Unit(
                unitSymbol,
                foundUnit.name,
                foundUnit.dimensions,
                foundUnit.coeff,
                foundUnit.offset
            );
            }
            const prefix: Prefix = UnitParser.registeredPrefixes[prefixSymbol];
            return foundUnit.applyPrefix(prefix, unitSymbol);
        }
        throw new UnitNotFoundError(candidate);
    }

    static findPrefixFromFactor(desiredFactor: number, base?: number): Prefix | null {
        for (const prefix of Object.values(UnitParser.registeredPrefixes)) {
            if (desiredFactor === prefix.factor && (!base || base === prefix.base)) {
                return prefix;
            }
        }
        return null;
    }

    static findPrefixFromExponent(exponent: number, base: number = 10): Prefix | null {
        for (const prefix of Object.values(UnitParser.registeredPrefixes)) {
            if (exponent === prefix.exponent && base === prefix.base) {
                return prefix;
            }
        }
        return null;
    }

    static findBestPrefixFromExponent(exponent: number, base: number = 10): Prefix | null {
        let currentBestPrefix: Prefix | undefined;
        let currentBestExponent: number = 0;
        for (const prefix of Object.values(UnitParser.registeredPrefixes)) {
            if (base === prefix.base && prefix.exponent / exponent > 0 && prefix.exponent / exponent <= 1 && currentBestExponent / prefix.exponent < 1) {
                logger.debug(`Looking for exponent ${exponent}, ${prefix.name} (${prefix.exponent}) is better than ${currentBestPrefix?.name} (${currentBestExponent})`);
                currentBestPrefix = prefix;
                currentBestExponent = prefix.exponent;
            } else {
                logger.debug(`Looking for exponent ${exponent}, ${prefix.name} (${prefix.exponent}) is worse than ${currentBestPrefix?.name} (${currentBestExponent})`);
            }
        }
        return currentBestPrefix ? currentBestPrefix : null;
    }

    static findNextPrefixFromExponent(exponent: number, base: number = 10): Prefix | null {
        let currentBestPrefix: Prefix | undefined;
        let currentBestExponent: number = 0;
        if (exponent === 0) {
            return null;
        }
        for (const prefix of Object.values(UnitParser.registeredPrefixes)) {
            if (base === prefix.base && prefix.exponent / exponent >= 1 && (currentBestExponent === 0 || currentBestExponent / prefix.exponent > 1)) {
                logger.debug(`Looking for exponent ${exponent}, ${prefix.name} (${prefix.exponent}) is better than ${currentBestPrefix?.name} (${currentBestExponent})`);
                currentBestPrefix = prefix;
                currentBestExponent = prefix.exponent;
            } else {
                logger.debug(`Looking for exponent ${exponent}, ${prefix.name} (${prefix.exponent}) is worse than ${currentBestPrefix?.name} (${currentBestExponent})`);
            }
        }
        return currentBestPrefix ? currentBestPrefix : null;
    }
}