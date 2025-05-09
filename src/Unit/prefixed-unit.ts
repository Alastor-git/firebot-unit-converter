import { Prefix } from "@/Unit/prefix";
import { Unit } from "./unit";
import { PrefixError, UnexpectedError, ValueError } from "@/errors";
import { AbstractUnit } from "./abstract-unit";
import { Quantity } from "@/quantity";
import { CompoundUnit } from "./compound-unit";
import { AbstractBasedUnit } from "./abstract-based-unit";

export class PrefixedUnit extends AbstractBasedUnit {
    _prefix: Prefix | null;
    baseUnit: Unit;

    constructor(prefix: Prefix, unit: Unit, unitSymbol?: string) {
        super();
        this.baseUnit = unit;
        this.base = this.baseUnit.base;
        this.dimensions = unit.dimensions;
        this.offset = unit.offset;

        if (unitSymbol) {
            this.preferredUnitSymbol = unitSymbol;
        }
        this.prefix = prefix;
    }

    copy(): PrefixedUnit {
        return new PrefixedUnit(this.prefix.copy(), this.baseUnit.copy(), this._preferredUnitSymbol ? this._preferredUnitSymbol : undefined);
    }

    set preferredUnitSymbol(unitSymbol: string) {
        if (!this.baseUnit.symbols.includes(unitSymbol)) {
            throw new ValueError(`Unit symbol ${unitSymbol} didn't match any existing symbol in the unit's list ${JSON.stringify(this.symbols)}`);
        }

        this._preferredUnitSymbol = unitSymbol ? unitSymbol : null;
    }

    get preferredUnitSymbol(): string {
        if (!this._preferredUnitSymbol) {
            return this.baseUnit.preferredUnitSymbol;
        }
        return this._preferredUnitSymbol;
    }

    set prefix(prefix: Prefix) {
        if (prefix.base !== this.base) {
            throw new PrefixError(`Prefix ${prefix.symbol} (base ${prefix.base})does't have the same base as unit ${this.baseUnit.preferredUnitSymbol} (base ${this.base})`);
        }

        this._prefix = prefix;
        const symbols: string[] = this._preferredUnitSymbol ? [`${prefix.symbol}${this._preferredUnitSymbol}`] : this.baseUnit.symbols.map(unitSymbol => `${prefix.symbol}${unitSymbol}`);

        this.symbols = symbols;
        this.name = `${prefix.name}${this.baseUnit.name}`;
        this.coeff = this.baseUnit.coeff * prefix.factor;
    }

    get prefix(): Prefix {
        if (!this._prefix) {
            throw new ValueError(`Unit prefix has not been defined.`);
        }
        return this._prefix;
    }

    get preferredSymbol() {
        return `${this.prefix.symbol}${this.preferredUnitSymbol}`;
    }

    deltaUnit(): PrefixedUnit {
        return new PrefixedUnit(this.prefix, this.baseUnit.deltaUnit(), this._preferredUnitSymbol ?? undefined);
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
}