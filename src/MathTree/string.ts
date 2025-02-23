import { ValueError } from "@/errors";
import { MathTree } from "./abstract-mathtree";
import { UnitParser } from "@/unit-parser";
import { UnitSymbol } from "./unit";

export class StringSymbol extends MathTree {
    value: string;

    constructor(value: string) {
        super();
        this.value = value;
    }

    parseUnits(): UnitSymbol {
        return new UnitSymbol(UnitParser.parseUnit(this.value));
    }

    collapse(): null {
        throw new ValueError(`String literal ${this.value} is not able to be parsed to a value`);
    }
}