import { AbstractUnit } from "./abstract-unit";

export abstract class AbstractBasedUnit extends AbstractUnit {
    _base: number;

    set base(value: number) {
        this._base = value;
    }

    get base() {
        return this._base;
    }

    isDeltaEqual(otherUnit: AbstractUnit) {
        if (otherUnit instanceof AbstractBasedUnit) {
            return super.isDeltaEqual(otherUnit) && otherUnit.base === this.base;
        }
        return super.isDeltaEqual(otherUnit);
    }

    isEqual(otherUnit: AbstractUnit) {
        if (otherUnit instanceof AbstractBasedUnit) {
            return super.isEqual(otherUnit) && otherUnit.base === this.base;
        }
        return super.isEqual(otherUnit);
    }
}