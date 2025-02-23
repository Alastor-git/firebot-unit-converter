import { Unit } from "@/unit";
import { MathTree } from "./abstract-mathtree";
import { Quantity } from "@/quantity";
import { ValueError } from "@/errors";

export class Multiply extends MathTree {
    factors: MathTree[];

    constructor(...factors: MathTree[]) {
        super();
        this.factors = factors;
    }

    parseUnits(): Multiply {
        return new Multiply(...this.factors.map((term: MathTree): MathTree => term.parseUnits()));
    }

    collapse(): Unit | Quantity | number | null {
        return this.factors.reduce((total, current) => Multiply.collapsePair(total, current), null);
    }

    static collapsePair(totalValue: Unit | Quantity | number | null, newFactor: MathTree): Unit | Quantity | number {
        const newFactorValue = newFactor.collapse();
        if (newFactorValue === null) {
            throw new ValueError(`Cannot multiply an empty group.`);
        } else if (totalValue === null) {
            return newFactorValue;
        } else if (totalValue instanceof Quantity) {
            return totalValue.multiply(newFactorValue);
        } else if (newFactorValue instanceof Quantity) {
            return newFactorValue.multiply(totalValue);
        } else if (totalValue instanceof Unit) {
            return totalValue.multiply(newFactorValue);
        } else if (newFactorValue instanceof Unit) {
            return newFactorValue.multiply(totalValue);
        } else { // typeof totalValue === 'number' && typeof newFactorValue === 'number'
            return totalValue * newFactorValue;
        }
    }
}