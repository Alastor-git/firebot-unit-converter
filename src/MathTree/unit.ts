import { AbstractUnit } from "@/Unit/abstract-unit";
import { MathTree } from "./abstract-mathtree";

export class UnitSymbol extends MathTree {
    value: AbstractUnit;

    constructor(value: AbstractUnit) {
        super();
        this.value = value;
    }

    parseUnits(): UnitSymbol {
        return this;
    }

    collapse(): AbstractUnit {
        return this.value;
    }
}