import { Prefix } from "./prefix";
import { Quantity } from "../quantity";
import { PrefixedUnit } from "./prefixed-unit";
import { AbstractUnit, UnitDimensions } from "./abstract-unit";
import { CompoundUnit } from "./compound-unit";
import { AbstractBasedUnit } from "./abstract-based-unit";

export class Unit extends AbstractBasedUnit {
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
                base: number = 10,
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
        this.base = base;
    }

    copy(): Unit {
        const copy = new Unit(this.symbols, this.name, { ...this.dimensions }, this.base, this.coeff, this.offset);
        copy.preferredUnitSymbol = this.preferredUnitSymbol;
        return copy;
    }

    static ONE: Unit = new Unit('', '', {}, 1, 1, 0);

    isNeutralElement(): boolean {
        return this.isEqual(Unit.ONE);
    }

    deltaUnit(): Unit {
        if (this.isLinear()) {
            return this;
        }
        // Delta units are identical to the unit, but without an offset
        return new Unit(this.symbols, this.name, this.dimensions, this.base, this.coeff);
    }

    multiply(other: number): Quantity;
    multiply(other: AbstractUnit): CompoundUnit;
    multiply(other: AbstractUnit | number): CompoundUnit | Quantity;
    multiply(other: AbstractUnit | number): CompoundUnit | Quantity {
        if (typeof other === 'number') {
            return new Quantity(other, this);
        }
        return new CompoundUnit(this, 1).multiply(other);
    }

    divide(other: number): Quantity;
    divide(other: AbstractUnit): CompoundUnit;
    divide(other: AbstractUnit | number): CompoundUnit | Quantity;
    divide(other: AbstractUnit | number): CompoundUnit | Quantity {
        if (typeof other === 'number') {
            return new Quantity(1 / other, this);
        }
        return new CompoundUnit(this, 1).divide(other);
    }

    power(power: number): CompoundUnit {
        return new CompoundUnit(this, power);
    }

    applyPrefix(prefix: Prefix, unitSymbol?: string): PrefixedUnit {
        return new PrefixedUnit(prefix, this, unitSymbol);
    }
}