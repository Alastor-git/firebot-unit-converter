import { InvalidOperation, ValueError } from "@/errors";
import { MathTree } from "./abstract-mathtree";
import { Unit } from "@/unit";
import { Quantity } from "@/quantity";

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
            } else if (elementValue instanceof Unit) {
                throw new InvalidOperation(`Opposition cannot be performed on pure units.`);
            } else if (typeof elementValue === 'number') {
                return -elementValue;
            } else { // elementValue instanceof Quantity
                return elementValue.oppose();
            }
        }
}