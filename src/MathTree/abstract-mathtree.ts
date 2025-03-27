import { Quantity } from "@/quantity";
import { AbstractUnit } from "@/Unit/abstract-unit";

export abstract class MathTree {
    abstract parseUnits(): MathTree;
    abstract collapse(): AbstractUnit | Quantity | number | null;

    toString() {
        return JSON.stringify(this);
    }
}