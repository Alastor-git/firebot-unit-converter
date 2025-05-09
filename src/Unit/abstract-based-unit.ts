import { AbstractUnit } from "./abstract-unit";

export abstract class AbstractBasedUnit extends AbstractUnit {
    _base: number;

    set base(value: number) {
        this._base = value;
    }

    get base() {
        return this._base;
    }
}