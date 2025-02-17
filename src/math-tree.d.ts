type MathTree =
    | string
    | number
    | {
        type: 'empty'
    }
    | {
        type: 'add';
        terms: Array<MathTree>;
    }
    | {
        type: 'oppose';
        element: MathTree;
    }
    | {
        type: 'mult';
        factors: Array<MathTree>;
    }
    | {
        type: 'div';
        numerator: MathTree;
        denominator: MathTree;
    }
    | {
        type: 'pow';
        base: MathTree;
        exponent: MathTree;
    }
    // TODO: Unit in the MathTree instead of string ? Parametrize ?