import { InvalidOperation, ValueError } from "@/errors";
import { MathTree } from "./abstract-mathtree";
import { Quantity } from "@/quantity";
import { AbstractUnit } from "@/Unit/abstract-unit";

export class Oppose extends MathTree {
    element: MathTree;

    constructor(element: MathTree) {
        super();
        this.element = element;
    }

    parseUnits(): Oppose {
        return new Oppose(this.element.parseUnits());
    }

    collapse(): Quantity | number {
            const elementValue = this.element.collapse();
            if (elementValue === null) {
                throw new ValueError(`Cannot oppose an empty group.`);
            } else if (elementValue instanceof AbstractUnit) {
                throw new InvalidOperation(`Opposition cannot be performed on pure units.`);
            } else if (typeof elementValue === 'number') {
                return -elementValue;
            } else { // elementValue instanceof Quantity
                return elementValue.oppose();
            }
        }
}