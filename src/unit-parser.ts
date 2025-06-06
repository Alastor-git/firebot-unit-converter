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
                logger.warn(`UnitConverter: Unit symbol ${symbol} already in use. Couldn't register unit ${unit.name}. `);
                return;
            }
            logger.info(`UnitConverter: Registering unit ${unit.name} under symbol ${symbol}. `);
            // Check that unit isn't already parsed as something else
            try {
                const parsedUnit = UnitParser.parseUnit(symbol);
                logger.warn(`UnitConverter: ${unit.name}'s symbol ${symbol} is conflicting with unit ${parsedUnit.name} and being parsed as ${parsedUnit.preferredSymbol}. One of them isn't gonna work. `);
            } catch {
                // symbol isn't conflicting with any of the currently registered combinations
            }
            // Check that the unit works with each registered prefix
            for (const prefixSymbol of Object.keys(UnitParser.registeredPrefixes)) {
                try {
                    if (unit.prefixable && UnitParser.registeredPrefixes[prefixSymbol].base === unit.base) {
                        const parsedUnit = UnitParser.parseUnit(`${prefixSymbol}${symbol}`);
                        logger.warn(`UnitConverter: unit ${unit.name}'s symbol ${symbol} is conflicting with unit ${parsedUnit.name} when using prefix ${prefixSymbol}. ${prefixSymbol}${symbol} is being parsed as ${parsedUnit.preferredSymbol}. One of them isn't gonna work. `);
                    }
                } catch {
                    // `${prefixSymbol}${symbol}` isn't conflicting with any of the currently registered combinations
                }
            }
            UnitParser.registeredUnits[symbol] = unit;
        });
    }

    static unregisterUnits(): void {
        UnitParser.registeredUnits = {};
    }

    static registerPrefix(prefix: Prefix): void {
        if (prefix.symbol in UnitParser.registeredPrefixes) {
            logger.warn(`UnitConverter: Prefix symbol ${prefix.symbol} already in use. Couldn't register prefix ${prefix.name}. `);
            return;
        }
        logger.info(`UnitConverter: Registering prefix ${prefix.name} under symbol ${prefix.symbol}. `);
        // Check the prefix works with each registered unit
        for (const unitSymbol of Object.keys(UnitParser.registeredUnits)) {
            try {
                if (prefix.base === UnitParser.registeredUnits[unitSymbol].base && UnitParser.registeredUnits[unitSymbol].prefixable) {
                    const parsedUnit = UnitParser.parseUnit(`${prefix.symbol}${unitSymbol}`);
                    logger.warn(`UnitConverter: Prefix ${prefix.name}'s symbol ${prefix.symbol} is creating a conflict between units ${UnitParser.registeredUnits[unitSymbol].name} and ${parsedUnit.name}. ${prefix.symbol}${unitSymbol} is being parsed as ${parsedUnit.preferredSymbol}. One of them isn't gonna work. `);
                }
            } catch {
                // `${prefix.symbol}${unitSymbol}` isn't conflicting with any of the currently registered combinations
            }
        }
        UnitParser.registeredPrefixes[prefix.symbol] = prefix;
    }

    static unregisterPrefixes(): void {
        UnitParser.registeredPrefixes = {};
    }

    static parseUnit(candidate: string): AbstractUnit {
        candidate = candidate.trim();
        let unitSymbol: string = '';
        let prefixSymbol: string = '';
        for (let prefixLength = candidate.length - 1; prefixLength >= 0; prefixLength--) {
            const symbol = candidate.substring(prefixLength);
            prefixSymbol = candidate.substring(0, prefixLength);
            if (symbol in UnitParser.registeredUnits && (prefixLength === 0 || (prefixSymbol in UnitParser.registeredPrefixes && UnitParser.registeredUnits[symbol].prefixable))) {
                unitSymbol = symbol;
                break;
            }
        }
        if (unitSymbol) {
            const foundUnit: Unit = UnitParser.registeredUnits[unitSymbol];
            if (prefixSymbol === '') {
                return new Unit(
                unitSymbol,
                foundUnit.name,
                foundUnit.dimensions,
                foundUnit.base,
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
                //logger.debug(`Looking for exponent ${exponent}, ${prefix.name} (${prefix.exponent}) is better than ${currentBestPrefix?.name} (${currentBestExponent})`);
                currentBestPrefix = prefix;
                currentBestExponent = prefix.exponent;
            } else {
                //logger.debug(`Looking for exponent ${exponent}, ${prefix.name} (${prefix.exponent}) is worse than ${currentBestPrefix?.name} (${currentBestExponent})`);
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
                //logger.debug(`Looking for exponent ${exponent}, ${prefix.name} (${prefix.exponent}) is better than ${currentBestPrefix?.name} (${currentBestExponent})`);
                currentBestPrefix = prefix;
                currentBestExponent = prefix.exponent;
            } else {
                //logger.debug(`Looking for exponent ${exponent}, ${prefix.name} (${prefix.exponent}) is worse than ${currentBestPrefix?.name} (${currentBestExponent})`);
            }
        }
        return currentBestPrefix ? currentBestPrefix : null;
    }
}