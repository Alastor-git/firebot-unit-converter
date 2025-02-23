import { ValueError } from "@/errors";
import { MathTree } from "./abstract-mathtree";

export class Empty extends MathTree {
    constructor() {
        super();
    }

    parseUnits(): Empty {
        return this;
    }

    collapse(): null {
        throw new ValueError(`Empty group cannot be turned into a value.`);
    }
}