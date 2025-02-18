type MathTree<Symbol = string> =
    | Symbol
    | number
    | {
        type: 'empty'
    }
    | {
        type: 'add';
        terms: Array<MathTree<Symbol>>;
    }
    | {
        type: 'oppose';
        element: MathTree<Symbol>;
    }
    | {
        type: 'mult';
        factors: Array<MathTree<Symbol>>;
    }
    | {
        type: 'div';
        numerator: MathTree<Symbol>;
        denominator: MathTree<Symbol>;
    }
    | {
        type: 'pow';
        base: MathTree<Symbol>;
        exponent: MathTree<Symbol>;
    }