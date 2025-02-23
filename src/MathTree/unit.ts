import { MathTree } from "./abstract-mathtree";
import { Unit } from "@/unit";

export class UnitSymbol extends MathTree {
    value: Unit;

    constructor(value: Unit) {
        super();
        this.value = value;
    }

    parseUnits(): UnitSymbol {
        return this;
    }

    collapse(): Unit {
        return this.value;
    }
}