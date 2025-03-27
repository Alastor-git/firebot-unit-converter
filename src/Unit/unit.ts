import { Prefix } from "./prefix";
import { Quantity } from "../quantity";
import { PrefixedUnit } from "./prefixed-unit";
import { AbstractUnit, UnitDimensions } from "./abstract-unit";

export class Unit extends AbstractUnit {
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
        super();
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
        this.preferredUnitSymbol = this.symbols[0];
        this.name = name;
    }

    copy(): Unit {
        const copy = new Unit(this.symbols, this.name, { ...this.dimensions }, this.coeff, this.offset);
        copy.preferredUnitSymbol = this.preferredUnitSymbol;
        return copy;
    }

    static ONE: Unit = new Unit('', '', {}, 1, 0);

    isNeutralElement(): boolean {
        return this.isEqual(Unit.ONE);
    }

    deltaUnit(): Unit {
        if (this.isLinear()) {
            return this;
        }
        // Delta units are identical to the unit, but without an offset
        return new Unit(this.symbols, this.name, this.dimensions, this.coeff);
    }

    multiply(other: AbstractUnit): Unit;
    multiply(other: number): Quantity;
    multiply(other: AbstractUnit | number): Unit | Quantity;
    multiply(other: AbstractUnit | number): Unit | Quantity {
        if (typeof other === 'number') {
            return new Quantity(other, this);
        }
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

    divide(other: number): Quantity;
    divide(other: AbstractUnit): Unit;
    divide(other: AbstractUnit | number): Unit | Quantity;
    divide(other: AbstractUnit | number): Unit | Quantity {
        if (typeof other === 'number') {
            return new Quantity(1 / other, this);
        }
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

    applyPrefix(prefix: Prefix, unitSymbol?: string): PrefixedUnit {
        return new PrefixedUnit(prefix, this, unitSymbol);
    }
    // TODO: toString
    // TODO: Keep a record of the UnitTree in a similar fashion to MathTree ?
    // TODO: Keep a record of each symbol with its power as it's purely multiplicative ?
    // TODO: Keep track of prefixes ? UnitWithPrefix class ?
}