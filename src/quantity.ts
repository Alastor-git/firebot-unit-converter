import { UnitMismatchError, ValueError } from "./errors";
import { Unit } from "./unit";

export class Quantity {
    unit: Unit;
    value: number;

    constructor(value: number, unit: Unit) {
        this.value = value;
        this.unit = unit;
    }

    static zero(unit: Unit = Unit.ONE) {
        return new Quantity(0, unit);
    }

    static ONE = new Quantity(1, Unit.ONE);

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

    add(quantity: Quantity): Quantity {
        if (!this.unit.isSameDimension(quantity.unit)) {
            throw new UnitMismatchError(`${this.unit} doesn't match ${quantity.unit}`);
        }
        // If both units have the same dimensions but aren't equal, perform conversion into the current unit
        // The added quantity is a delta, so we want to drop all offsets.
        if (!this.unit.isEqual(quantity.unit)) {
            quantity = quantity.deltaQuantity().convert(this.unit.deltaUnit());
        }
        return new Quantity(this.value + quantity.value, this.unit);
    }

    subtract(quantity: Quantity): Quantity {
        if (!this.unit.isSameDimension(quantity.unit)) {
            throw new UnitMismatchError(`${this.unit} doesn't match ${quantity.unit}`);
        }
        // If both units have the same dimensions but aren't equal, perform conversion into the current unit
        // The subtracted quantity is a delta, so we want to drop all offsets.
        if (!this.unit.isEqual(quantity.unit)) {
            quantity = quantity.deltaQuantity().convert(this.unit.deltaUnit());
        }
        return new Quantity(this.value - quantity.value, this.unit);
    }

    multiply(quantity: Quantity | number): Quantity {
        if (quantity instanceof Quantity) {
            // Unit multiplication assumes that both units are deltas, so we don't need to do it here
            return new Quantity(this.value * quantity.value, this.unit.multiply(quantity.unit));
        }
        return new Quantity(this.value * quantity, this.unit);
    }

    divide(quantity: Quantity | number): Quantity {
        if (Quantity.isNull(quantity)) {
            throw new ValueError(`Division by 0`);
        }
        if (quantity instanceof Quantity) {
            // Unit division assumes that both units are deltas, so we don't need to do it here
            return new Quantity(this.value / quantity.value, this.unit.divide(quantity.unit));
        }
        return new Quantity(this.value / quantity, this.unit);
    }

    power(power: number): Quantity {
        if ((power <= 0 && this.value === 0) || (this.value < 0 && !Number.isInteger(power))) {
            throw new ValueError(`The result of this operation is undefined for value=${this.value} and power=${power}`);
        }
        // Unit power raising assumes that units are deltas, so we don't need to do it here
        return new Quantity(this.value !== 0 ? this.value ** power : 0, this.unit.power(power));
    }

    convert(newUnit: Unit): Quantity {
        if (!this.unit.isSameDimension(newUnit)) {
            // FIXME: units display as [Object object]
            throw new UnitMismatchError(`${this.unit} doesn't match ${newUnit}`);
        }
        return new Quantity((this.value * this.unit.coeff + this.unit.offset - newUnit.offset) / newUnit.coeff, newUnit);
    }

    deltaQuantity(): Quantity {
        return new Quantity(this.value, this.unit.deltaUnit());
    }

    toString(): string {
        return `${this.value} ${this.unit.symbols[0]}`;
    }
}