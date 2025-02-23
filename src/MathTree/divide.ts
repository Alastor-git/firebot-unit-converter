import { ValueError } from "@/errors";
import { MathTree } from "./abstract-mathtree";
import { Unit } from "@/unit";
import { Quantity } from "@/quantity";

export class Divide extends MathTree {
    numerator: MathTree;
    denominator: MathTree;

    constructor(numerator: MathTree, denominator: MathTree) {
        super();
        this.numerator = numerator;
        this.denominator = denominator;
    }

    parseUnits(): Divide {
        return new Divide(this.numerator.parseUnits(), this.denominator.parseUnits());
    }

    collapse(): Quantity | Unit | number {
        const numeratorValue = this.numerator.collapse();
        const denominatorValue = this.denominator.collapse();
        if (numeratorValue === null || denominatorValue === null) {
            throw new ValueError(`Cannot perform division on empty groups`);
        } else if (typeof numeratorValue === 'number' && typeof denominatorValue === 'number') {
            return numeratorValue / denominatorValue;
        } else if (numeratorValue instanceof Quantity) {
            return numeratorValue.divide(denominatorValue);
        } else if (denominatorValue instanceof Quantity) {
            return Quantity.ONE.divide(denominatorValue).multiply(numeratorValue);
        } else if (numeratorValue instanceof Unit) {
            return numeratorValue.divide(denominatorValue);
        } else { // denominatorValue instanceof Unit
            return Unit.ONE.divide(denominatorValue).multiply(numeratorValue);
        }
    }
}