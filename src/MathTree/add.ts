import { MathTree } from "./abstract-mathtree";
import { Quantity } from "@/quantity";
import { InvalidOperation, ValueError } from "@/errors";
import { AbstractUnit } from "@/Unit/abstract-unit";

export class Add extends MathTree {
    terms: MathTree[];

    constructor(...terms: MathTree[]) {
        super();
        this.terms = terms;
    }

    parseUnits(): Add {
        return new Add(...this.terms.map((term: MathTree): MathTree => term.parseUnits()));
    }

    collapse(): AbstractUnit | Quantity | number | null {
        return this.terms.reduce((total, current) => Add.collapsePair(total, current), null);
    }

    static collapsePair(totalValue: AbstractUnit | Quantity | number | null, newTerm: MathTree): Quantity | number {
            const newTermValue = newTerm.collapse();
            if (newTermValue === null) {
                throw new ValueError(`Cannot add an empty group.`);
            } else if (totalValue instanceof AbstractUnit || newTermValue instanceof AbstractUnit) {
                throw new InvalidOperation(`Addition cannot be performed on a pure unit.`);
            } else if (totalValue === null) {
                return newTermValue;
            } else if (totalValue instanceof Quantity) {
                return totalValue.add(newTermValue);
            } else if (newTermValue instanceof Quantity) {
                return newTermValue.add(totalValue);
            } else { // typeof totalValue === 'number' && typeof newTermValue === 'number'
                return totalValue + newTermValue;
            }
        }
}