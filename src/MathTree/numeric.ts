import { MathTree } from "./abstract-mathtree";

export class Numeric extends MathTree {
    value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    parseUnits(): Numeric {
        return this;
    }

    collapse(): number {
        return this.value;
    }
}