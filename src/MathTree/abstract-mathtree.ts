import { Quantity } from "@/quantity";
import { Unit } from "@/unit";

export abstract class MathTree {
    abstract parseUnits(): MathTree;
    abstract collapse(): Unit | Quantity | number | null;

    toString() {
        return JSON.stringify(this);
    }
}