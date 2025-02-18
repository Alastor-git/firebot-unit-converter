import { ValueError } from "./errors";
import { Prefix } from "./prefix";

export type UnitDimensions = {
    L: number; //     Length
    M: number; //     Mass
    T: number; //     Time
    I: number; //     Electric current
    THETA: number; // Thermodynamic temperature
    N: number; //     Amount of substance
    J: number; //     Light intensity
    // TODO: unit of angle even though it's not a physical unit ?
};

export class Unit {
    symbols: string[];
    name: string;


    coeff: number;
    offset: number;

    // Dimensional quantities
    // -----------------------
    dimensions: UnitDimensions;

    constructor(symbol: string | string[],
                name: string,
                dimensions: Partial<UnitDimensions> = {},
                coeff: number = 1,
                offset: number = 0) {
        this.dimensions = {
            L: dimensions.L ?? 0,
            M: dimensions.M ?? 0,
            T: dimensions.T ?? 0,
            I: dimensions.I ?? 0,
            THETA: dimensions.THETA ?? 0,
            N: dimensions.N ?? 0,
            J: dimensions.J ?? 0
        };

        this.coeff = coeff;
        this.offset = offset;

        this.symbols = Array.isArray(symbol) ? symbol : [symbol];
        this.name = name;
    }

    isSameDimension(otherUnit: Unit): boolean {
        return (this.dimensions.L === otherUnit.dimensions.L &&
                this.dimensions.M === otherUnit.dimensions.M &&
                this.dimensions.T === otherUnit.dimensions.T &&
                this.dimensions.I === otherUnit.dimensions.I &&
                this.dimensions.THETA === otherUnit.dimensions.THETA &&
                this.dimensions.N === otherUnit.dimensions.N &&
                this.dimensions.J === otherUnit.dimensions.J);
    }

    isDeltaEqual(otherUnit: Unit) {
        return (this.isSameDimension(otherUnit) &&
                this.coeff === otherUnit.coeff);
    }

    isEqual(otherUnit: Unit) {
        return (this.isSameDimension(otherUnit) &&
                this.coeff === otherUnit.coeff &&
                this.offset === otherUnit.offset);
    }

    static ONE: Unit = new Unit('', '', {}, 1, 0);

    isDimensionless(): boolean {
        return this.isSameDimension(Unit.ONE);
    }

    isNeutralElement(): boolean {
        return this.isEqual(Unit.ONE);
    }

    isAffine(): boolean {
        return this.offset !== 0;
    }

    isLinear(): boolean {
        return this.offset === 0;
    }

    deltaUnit(): Unit {
        if (this.isLinear()) {
            return this;
        }
        // Delta units are identical to the unit, but without an offset
        return new Unit(this.symbols, this.name, this.dimensions, this.coeff);
    }

    multiply(other: Unit): Unit {
        return new Unit(
            this.symbols.map(symA => other.symbols.map(symB => `${symA}*${symB}`)).flat(),
            `${this.name}*${other.name}`,
            {
                L: this.dimensions.L + other.dimensions.L,
                M: this.dimensions.M + other.dimensions.M,
                T: this.dimensions.T + other.dimensions.T,
                I: this.dimensions.I + other.dimensions.I,
                THETA: this.dimensions.THETA + other.dimensions.THETA,
                N: this.dimensions.N + other.dimensions.N,
                J: this.dimensions.J + other.dimensions.J
            },
            this.coeff * other.coeff
            // No offset when multiplying units. We assume these are only delta quantities.
            );
    }

    divide(other: Unit): Unit {
        return new Unit(
            this.symbols.map(symA => other.symbols.map(symB => `(${symA})/(${symB})`)).flat(),
            `(${this.name})/(${other.name})`,
            {
                L: this.dimensions.L - other.dimensions.L,
                M: this.dimensions.M - other.dimensions.M,
                T: this.dimensions.T - other.dimensions.T,
                I: this.dimensions.I - other.dimensions.I,
                THETA: this.dimensions.THETA - other.dimensions.THETA,
                N: this.dimensions.N - other.dimensions.N,
                J: this.dimensions.J - other.dimensions.J
            },
            this.coeff / other.coeff
            // No offset when dividing units. We assume these are only delta quantities.
            );
    }

    power(power: number): Unit {
        return new Unit(
            this.symbols.map(symA => `${symA}^(${power})`),
            `(${this.name})^(${power})`,
                {
                    L: this.dimensions.L * power,
                    M: this.dimensions.M * power,
                    T: this.dimensions.T * power,
                    I: this.dimensions.I * power,
                    THETA: this.dimensions.THETA * power,
                    N: this.dimensions.N * power,
                    J: this.dimensions.J * power
                },
            this.coeff ** power
            // No offset when taking powers of units. We assume these are only delta quantities.
            );
    }

    applyPrefix(prefix: Prefix, unitSymbol?: string): Unit {
        if (unitSymbol && !this.symbols.includes(unitSymbol)) {
            throw new ValueError(`Unit symbol ${unitSymbol} didn't match any existing symbol in the unit's list ${JSON.stringify(this.symbols)}`);
        }
        const symbols: string[] = unitSymbol ? [`${prefix.symbol}${unitSymbol}`] : this.symbols.map(unitSymbol => `${prefix.symbol}${unitSymbol}`);
        return new Unit(
            symbols,
            `${prefix.name}${this.name}`,
            this.dimensions,
            this.coeff * prefix.factor,
            this.offset
        );
    }
    // TODO: toString
    // TODO: Keep a record of the UnitTree in a similar fashion to MathTree ?
    // TODO: Keep a record of each symbol with its power as it's purely multiplicative ?
    // TODO: Keep track of prefixes ? UnitWithPrefix class ?
}