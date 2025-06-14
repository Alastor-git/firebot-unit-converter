import { UnitMismatchError, ValueError } from "./errors";
import { AbstractUnit } from "./Unit/abstract-unit";
import { Unit } from "./Unit/unit";

export class Quantity {
    unit: AbstractUnit;
    value: number;

    constructor(value: number, unit: AbstractUnit) {
        this.value = value;
        this.unit = unit;
    }

    static zero(unit: AbstractUnit = Unit.ONE) {
        return new Quantity(0, unit);
    }

    // One must be dynamically initialized because Quantity and One refer to each other, so on load, one of them isn't declared yet
    static _ONE: Quantity;
    static get ONE() {
        Quantity._ONE ??= new Quantity(1, Unit.ONE);
        return Quantity._ONE;
    }

    static isNull(quantity: Quantity | number) {
        if (typeof quantity === "number") {
            return quantity === 0;
        }
        return quantity.value === 0;
    }

    isEqual(quantity: Quantity): boolean {
        return this.value === quantity.value && this.unit.isEqual(quantity.unit);
    }

    isDeltaEqual(quantity: Quantity): boolean {
        return this.value === quantity.value && this.unit.isDeltaEqual(quantity.unit);
    }

    isEquivalent(quantity: Quantity): boolean {
        if (!this.unit.isSameDimension(quantity.unit)) {
            return false;
        }
        return this.isEqual(quantity.convert(this.unit));
    }

    add(quantity: Quantity | number): Quantity {
        if (typeof quantity === 'number') {
            if (!this.unit.isDimensionless()) {
                throw new UnitMismatchError(`${this.unit} isn't dimensionless. `);
            } else {
                return new Quantity(this.convert(Unit.ONE).value + quantity, Unit.ONE);
            }
        } else if (!this.unit.isSameDimension(quantity.unit)) {
            throw new UnitMismatchError(`${this.unit} doesn't match ${quantity.unit}. `);
        }
        // If both units have the same dimensions but aren't equal, perform conversion into the current unit
        // The added quantity is a delta, so we want to drop all offsets.
        if (!this.unit.isEqual(quantity.unit)) {
            quantity = quantity.deltaQuantity().convert(this.unit.deltaUnit());
        }
        return new Quantity(this.value + quantity.value, this.unit);
    }

    oppose(): Quantity {
        return new Quantity(-this.value, this.unit);
    }

    multiply(quantity: Quantity | AbstractUnit | number): Quantity {
        if (quantity instanceof Quantity) {
            // Unit multiplication assumes that both units are deltas, so we don't need to do it here
            return new Quantity(this.value * quantity.value, this.unit.multiply(quantity.unit));
        } else if (quantity instanceof AbstractUnit) {
            return new Quantity(this.value, this.unit.multiply(quantity));
        }
        return new Quantity(this.value * quantity, this.unit);
    }

    divide(quantity: Quantity | AbstractUnit | number): Quantity {
        if (quantity instanceof AbstractUnit) {
            return new Quantity(this.value, this.unit.divide(quantity));
        }
        if (Quantity.isNull(quantity)) {
            throw new ValueError(`Division by 0. `);
        }
        if (quantity instanceof Quantity) {
            // Unit division assumes that both units are deltas, so we don't need to do it here
            return new Quantity(this.value / quantity.value, this.unit.divide(quantity.unit));
        }
        return new Quantity(this.value / quantity, this.unit);
    }

    power(power: number): Quantity {
        if ((power <= 0 && this.value === 0) || (this.value < 0 && !Number.isInteger(power))) {
            throw new ValueError(`The result of power operation is undefined for value=${this.value} and power=${power}. `);
        }
        // Unit power raising assumes that units are deltas, so we don't need to do it here
        return new Quantity(this.value !== 0 ? this.value ** power : 0, this.unit.power(power));
    }

    convert(newUnit: AbstractUnit): Quantity {
        if (!this.unit.isSameDimension(newUnit)) {
            // FIXME: units display as [Object object]
            throw new UnitMismatchError(`${this.unit} doesn't match ${newUnit}. `);
        }
        return new Quantity((this.value * this.unit.coeff + this.unit.offset - newUnit.offset) / newUnit.coeff, newUnit);
    }

    deltaQuantity(): Quantity {
        return new Quantity(this.value, this.unit.deltaUnit());
    }

    toString(decimals: number = 3): string {
        decimals = Math.trunc(decimals);
        return `${Math.round(10 ** decimals * this.value) / 10 ** decimals} ${this.unit.preferredSymbol}`;
    }
}