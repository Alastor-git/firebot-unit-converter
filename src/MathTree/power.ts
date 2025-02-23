import { InvalidOperation, ValueError } from "@/errors";
import { MathTree } from "./abstract-mathtree";
import { Unit } from "@/unit";
import { Quantity } from "@/quantity";

export class Power extends MathTree {
    base: MathTree;
    exponent: MathTree;

    constructor(base: MathTree, exponent: MathTree) {
        super();
        this.base = base;
        this.exponent = exponent;
    }

    parseUnits(): Power {
        return new Power(this.base.parseUnits(), this.exponent.parseUnits());
    }

    collapse(): Quantity | Unit | number {
            const baseValue = this.base.collapse();
            let exponentValue = this.exponent.collapse();
            if (baseValue === null || exponentValue === null) {
                throw new ValueError(`Cannot elevate to a power with empty groups`);
            } else if (exponentValue instanceof Unit) {
                throw new InvalidOperation(`The exponent of a power must be dimensionless.`);
            }
            if (exponentValue instanceof Quantity) {
                if (exponentValue.unit.isDimensionless()) {
                    exponentValue = exponentValue.convert(Unit.ONE).value;
                } else {
                    throw new InvalidOperation(`The exponent of a power must be dimensionless.`);
                }
            }
            if (typeof baseValue === 'number') {
                return baseValue ** exponentValue;
            }
            // baseValue instanceof Unit || baseValue instanceof Quantity
            return baseValue.power(exponentValue);
        }
}