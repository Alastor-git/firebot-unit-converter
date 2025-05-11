import { ValueError } from "@/errors";
import { Quantity } from "@/quantity";


export type UnitDimensions = {
    L: number; //     Length
    M: number; //     Mass
    T: number; //     Time
    I: number; //     Electric current
    THETA: number; // Thermodynamic temperature
    N: number; //     Amount of substance
    J: number; //     Light intensity
    A: number; //     Angle
    D: number; //     Data
};

export abstract class AbstractUnit {
    symbols: string[];
    name: string;
    _preferredUnitSymbol: string | null = null;

    coeff: number;
    offset: number;

    // Dimensional quantities
    // -----------------------
    dimensions: UnitDimensions;

    set preferredUnitSymbol(unitSymbol: string) {
        if (!this.symbols.includes(unitSymbol)) {
            throw new ValueError(`Unit symbol ${unitSymbol} didn't match any existing symbol in the unit's list ${JSON.stringify(this.symbols)}`);
        }

        this._preferredUnitSymbol = unitSymbol;
    }

    get preferredUnitSymbol(): string {
        if (this._preferredUnitSymbol === null) {
            throw new ValueError(`Unit preferred symbol has not been defined.`);
        }
        return this._preferredUnitSymbol;
    }

    get preferredSymbol(): string {
        return this.preferredUnitSymbol;
    }

    isSameDimension(otherUnit: AbstractUnit): boolean {
        return (this.dimensions.L === otherUnit.dimensions.L &&
                this.dimensions.M === otherUnit.dimensions.M &&
                this.dimensions.T === otherUnit.dimensions.T &&
                this.dimensions.I === otherUnit.dimensions.I &&
                this.dimensions.THETA === otherUnit.dimensions.THETA &&
                this.dimensions.N === otherUnit.dimensions.N &&
                this.dimensions.J === otherUnit.dimensions.J);
    }

    isDeltaEqual(otherUnit: AbstractUnit) {
        return (this.isSameDimension(otherUnit) &&
                this.coeff === otherUnit.coeff);
    }

    isEqual(otherUnit: AbstractUnit) {
        return (this.isSameDimension(otherUnit) &&
                this.coeff === otherUnit.coeff &&
                this.offset === otherUnit.offset);
    }

    isAffine(): boolean {
        return this.offset !== 0;
    }

    isLinear(): boolean {
        return this.offset === 0;
    }

    isDimensionless(): boolean {
        return this.dimensions.I === 0 &&
               this.dimensions.J === 0 &&
               this.dimensions.L === 0 &&
               this.dimensions.M === 0 &&
               this.dimensions.N === 0 &&
               this.dimensions.T === 0 &&
               this.dimensions.THETA === 0;
    }

    abstract copy(): AbstractUnit;

    abstract deltaUnit(): AbstractUnit;

    abstract multiply(other: AbstractUnit): AbstractUnit;
    abstract multiply(other: number): Quantity;
    abstract multiply(other: AbstractUnit | number): AbstractUnit | Quantity;

    abstract divide(other: AbstractUnit): AbstractUnit;
    abstract divide(other: number): Quantity;
    abstract divide(other: AbstractUnit | number): AbstractUnit | Quantity;

    abstract power(exponent: number): AbstractUnit;

    toString() {
        try {
            return this.preferredSymbol;
        } catch {
            return JSON.stringify(this);
        }
    }
}