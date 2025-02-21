import { DelimiterError, DepthLimitExceededError, InvalidOperation, UnexpectedError, UnitMismatchError, ValueError } from "./errors";
import { ParseMath } from "./math-parser";
import { Quantity } from "./quantity";
import { Unit } from "./unit";

/* */
test('makeTree empty', () => {
    expect(ParseMath.makeTree([])).toMatchObject({type: 'empty'});
});
/* */
test('makeTree single token', () => {
    expect(ParseMath.makeTree(['a'])).toBe('a');
    expect(ParseMath.makeTree([1])).toBe(1);
    expect(ParseMath.makeTree([1.2])).toBe(1.2);
    expect(ParseMath.makeTree([1.2e-5])).toBe(1.2e-5);
});
/* */
test('makeTree single group', () => {
    let subGroup: MathTree;
    subGroup = {
        type: 'empty'
    };
    expect(() => ParseMath.makeTree([subGroup])).toThrow(InvalidOperation);
    subGroup = {
        type: 'add',
        terms: ['a', 'b']
    };
    expect(ParseMath.makeTree([subGroup])).toMatchObject(subGroup);
    subGroup = {
        type: 'oppose',
        element: 'a'
    };
    expect(ParseMath.makeTree([subGroup])).toMatchObject(subGroup);
    subGroup = {
        type: 'mult',
        factors: ['a', 'b']
    };
    expect(ParseMath.makeTree([subGroup])).toMatchObject(subGroup);
    subGroup = {
        type: 'div',
        numerator: 'a',
        denominator: 'b'
    };
    expect(ParseMath.makeTree([subGroup])).toMatchObject(subGroup);
    subGroup = {
        type: 'pow',
        base: 'a',
        exponent: 'b'
    };
    expect(ParseMath.makeTree([subGroup])).toMatchObject(subGroup);
});
/* */
test('makeTree spaces at start/end', () => {
    expect(ParseMath.makeTree([' ', 'a'])).toBe('a');
    expect(ParseMath.makeTree([' ', ' ', 'a'])).toBe('a');
    expect(ParseMath.makeTree(['a', ' '])).toBe('a');
    expect(ParseMath.makeTree(['a', ' ', ' '])).toBe('a');
    expect(ParseMath.makeTree([' ', 'a', ' '])).toBe('a');
    expect(ParseMath.makeTree([' ', ' ', 'a', ' ', ' '])).toBe('a');
});
/* */
test('makeTree add', () => {
    let input: MathTree[] = ['a', '+', 'b'];
    let expected: MathTree = {
        type: 'add',
        terms: ['a', 'b']
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [
        {
            type: 'add',
            terms: ['a', 'b']
        },
        '+',
        'c'
    ];
    expected = {
        type: 'add',
        terms: ['a', 'b', 'c']
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // Do it twice to check we haven't mutated input objects
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [
        'a',
        '+',
        {
            type: 'add',
            terms: ['b', 'c']
        }
    ];
    expected = {
        type: 'add',
        terms: ['a', 'b', 'c']
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // Do it twice to check we haven't mutated input objects
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [
        {
            type: 'add',
            terms: ['a', 'b']
        },
        '+',
        {
            type: 'add',
            terms: ['c', 'd']
        }
    ];
    expected = {
        type: 'add',
        terms: ['a', 'b', 'c', 'd']
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // Do it twice to check we haven't mutated input objects
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree multiply', () => {
    let input: MathTree[] = ['a', '*', 'b'];
    let expected: MathTree = {
        type: 'mult',
        factors: ['a', 'b']
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [
        {
            type: 'mult',
            factors: ['a', 'b']
        },
        '*',
        'c'
    ];
    expected = {
        type: 'mult',
        factors: ['a', 'b', 'c']
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // Do it twice to check we haven't mutated input objects
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [
        'a',
        '*',
        {
            type: 'mult',
            factors: ['b', 'c']
        }
    ];
    expected = {
        type: 'mult',
        factors: ['a', 'b', 'c']
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // Do it twice to check we haven't mutated input objects
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [
        {
            type: 'mult',
            factors: ['a', 'b']
        },
        '*',
        {
            type: 'mult',
            factors: ['c', 'd']
        }
    ];
    expected = {
        type: 'mult',
        factors: ['a', 'b', 'c', 'd']
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // Do it twice to check we haven't mutated input objects
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', 'b'];
    expected = {
        type: 'mult',
        factors: ['a', 'b']
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', ' ', 'b'];
    expected = {
        type: 'mult',
        factors: ['a', 'b']
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '.', 'b'];
    expected = {
        type: 'mult',
        factors: ['a', 'b']
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree divide', () => {
    const input: MathTree[] = ['a', '/', 'b'];
    const expected: MathTree = {
        type: 'div',
        numerator: 'a',
        denominator: 'b'
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree power', () => {
    const input: MathTree[] = ['a', '^', 'b'];
    const expected: MathTree = {
        type: 'pow',
        base: 'a',
        exponent: 'b'
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
test('makeTree oppose', () => {
    const input: MathTree[] = ['-', 'a'];
    const expected: MathTree = {
        type: 'oppose',
        element: 'a'
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree sequences of operators', () => {
    let input: MathTree[];
    let expected: MathTree;
    input = ['a', '+', '-', 'b'];
    expected = {
        type: 'add',
        terms: [
            'a',
            {
                type: 'oppose',
                element: 'b'
            }
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '*', '-', 'b'];
    expected = {
        type: 'mult',
        factors: [
            'a',
            {
                type: 'oppose',
                element: 'b'
            }
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '/', '-', 'b'];
    expected = {
        type: 'div',
        numerator: 'a',
        denominator: {
            type: 'oppose',
            element: 'b'
        }
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '^', '-', 'b'];
    expected = {
        type: 'pow',
        base: 'a',
        exponent: {
            type: 'oppose',
            element: 'b'
        }
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    input = ['a', '^', '*', 'b'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['a', '^', '/', 'b'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['a', '^', '^', 'b'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);

    input = ['a', '^', '+', 'b'];
    expected = {
        type: 'pow',
        base: 'a',
        exponent: 'b'
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    input = ['a', '/', '*', 'b'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['a', '/', '/', 'b'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['a', '/', '^', 'b'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);

    input = ['a', '/', '+', 'b'];
    expected = {
        type: 'div',
        numerator: 'a',
        denominator: 'b'
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    input = ['a', '*', '*', 'b'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['a', '*', '/', 'b'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['a', '*', '^', 'b'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);

    input = ['a', '*', '+', 'b'];
    expected = {
        type: 'mult',
        factors: [
            'a',
            'b'
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    input = ['a', '-', '*', 'b'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['a', '-', '/', 'b'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['a', '-', '^', 'b'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);

    input = ['a', '-', '-', 'b'];
    expected = {
        type: 'add',
        terms: ['a', 'b']
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    input = ['a', '-', '+', 'b'];
    expected = {
        type: 'add',
        terms: [
            'a',
            {
                type: 'oppose',
                element: 'b'
            }
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    input = ['a', '+', '*', 'b'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['a', '+', '/', 'b'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['a', '+', '^', 'b'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);

    input = ['a', '+', '+', 'b'];
    expected = {
        type: 'add',
        terms: ['a', 'b']
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree legal sequences of 3 operators', () => {
    let input: MathTree[];
    let expected: MathTree;
    input = ['a', '+', '+', '+', 'b'];
    expected = {
        type: 'add',
        terms: [
            'a',
            'b'
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '+', '+', '-', 'b'];
    expected = {
        type: 'add',
        terms: [
            'a',
            {type: 'oppose', element: 'b'}
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '+', '-', '+', 'b'];
    expected = {
        type: 'add',
        terms: [
            'a',
            {type: 'oppose', element: 'b'}
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '+', '-', '-', 'b'];
    expected = {
        type: 'add',
        terms: [
            'a',
            'b'
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '-', '+', '+', 'b'];
    expected = {
        type: 'add',
        terms: [
            'a',
            {type: 'oppose', element: 'b'}
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '-', '+', '-', 'b'];
    expected = {
        type: 'add',
        terms: [
            'a',
            'b'
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '-', '-', '+', 'b'];
    expected = {
        type: 'add',
        terms: [
            'a',
            'b'
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '-', '-', '-', 'b'];
    expected = {
        type: 'add',
        terms: [
            'a',
            {type: 'oppose', element: 'b'}
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);


    input = ['a', '^', '+', '+', 'b'];
    expected = {
        type: 'pow',
        base: 'a',
        exponent: 'b'
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '^', '+', '-', 'b'];
    expected = {
        type: 'pow',
        base: 'a',
        exponent: {type: 'oppose', element: 'b'}
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '^', '-', '+', 'b'];
    expected = {
        type: 'pow',
        base: 'a',
        exponent: {type: 'oppose', element: 'b'}
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '^', '-', '-', 'b'];
    expected = {
        type: 'pow',
        base: 'a',
        exponent: 'b'
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);


    input = ['a', '/', '+', '+', 'b'];
    expected = {
        type: 'div',
        numerator: 'a',
        denominator: 'b'
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '/', '+', '-', 'b'];
    expected = {
        type: 'div',
        numerator: 'a',
        denominator: {type: 'oppose', element: 'b'}
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '/', '-', '+', 'b'];
    expected = {
        type: 'div',
        numerator: 'a',
        denominator: {type: 'oppose', element: 'b'}
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '/', '-', '-', 'b'];
    expected = {
        type: 'div',
        numerator: 'a',
        denominator: 'b'
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);


    input = ['a', '*', '+', '+', 'b'];
    expected = {
        type: 'mult',
        factors: [
            'a',
            'b'
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '*', '+', '-', 'b'];
    expected = {
        type: 'mult',
        factors: [
            'a',
            {type: 'oppose', element: 'b'}
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '*', '-', '+', 'b'];
    expected = {
        type: 'mult',
        factors: [
            'a',
            {type: 'oppose', element: 'b'}
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = ['a', '*', '-', '-', 'b'];
    expected = {
        type: 'mult',
        factors: [
            'a',
            'b'
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree some legal sequences of 4 operators', () => {
    const input: MathTree[] = ['a', '-', '-', '+', '-', 'b'];
    const expected: MathTree = {
        type: 'add',
        terms: [
            'a',
            {
                type: 'oppose',
                element: 'b'
            }
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree operation as first atom', () => {
    let input: MathTree[];
    let expected: MathTree;
    input = ['*', 'a'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['/', 'a'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['^', 'a'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['+', 'a'];
    expected = 'a';
    expect(ParseMath.makeTree(input)).toBe(expected);
    input = ['-', 'a'];
    expected = {
        type: 'oppose',
        element: 'a'
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree operation as last atom', () => {
    let input: MathTree[];
    input = ['a', '+'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['a', '-'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['a', '*'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['a', '/'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = ['a', '^'];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
});
/* */
test('makeTree order of operations', () => {
    let input: MathTree[];
    let expected: MathTree;
    // ^ => Power
    // / => Divide
    // * => Multiply
    // - => Oppose
    // + => Add

    // - takes precedence over +
    // a + b - c + d = a + b + (-c) + d
    input = ['a', '+', 'b', '-', 'c', '+', 'd'];
    expected = {
        type: 'add',
        terms: [
            'a',
            'b',
            {type: 'oppose', element: 'c'},
            'd'
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // * takes precedence over +
    // a + b * c + d = a + (b * c) + d
    input = ['a', '+', 'b', '*', 'c', '+', 'd'];
    expected = {
        type: 'add',
        terms: [
            'a',
            {type: 'mult', factors: ['b', 'c']},
            'd'
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // / takes precedence over +
    // a + b / c + d = a + (b / c) + d
    input = ['a', '+', 'b', '/', 'c', '+', 'd'];
    expected = {
        type: 'add',
        terms: [
            'a',
            {type: 'div', numerator: 'b', denominator: 'c'},
            'd'
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // ^ takes precedence over +
    // a + b ^ c + d = a + (b ^ c) + d
    input = ['a', '+', 'b', '^', 'c', '+', 'd'];
    expected = {
        type: 'add',
        terms: [
            'a',
            {type: 'pow', base: 'b', exponent: 'c'},
            'd'
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    // * takes precedence over -
    // - a * b * - c = - (a * b * (-c))
    input = ['-', 'a', '*', 'b', '*', '-', 'c'];
    expected = {
        type: 'oppose',
        element: {
            type: 'mult',
            factors: [
                'a',
                'b',
                {type: 'oppose', element: 'c'}
            ]
        }
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // / takes precedence over -
    // - a / b / - c = - ((a / b) / (-c))
    input = ['-', 'a', '/', 'b', '/', '-', 'c'];
    expected = {
        type: 'oppose',
        element: {
            type: 'div',
            numerator: {
                type: 'div',
                numerator: 'a',
                denominator: 'b'
            },
            denominator: {type: 'oppose', element: 'c'}
        }
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // ^ takes precedence over -
    // - a ^ b = - (a ^ b) ==> Ex -1^2 vs (-1)^2
    input = ['-', 'a', '^', 'b'];
    expected = {
        type: 'oppose',
        element: {
            type: 'pow',
            base: 'a',
            exponent: 'b'
        }
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // a ^ - b = (a ^ (-b))
    input = ['a', '^', '-', 'b'];
    expected = {
            type: 'pow',
            base: 'a',
            exponent: {type: 'oppose', element: 'b'}
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    // / takes precedence over *
    // a * b / c * d = a * (b / c) * d
    input = ['a', '*', 'b', '/', 'c', '*', 'd'];
    expected = {
        type: 'mult',
        factors: [
            'a',
            {type: 'div', numerator: 'b', denominator: 'c'},
            'd'
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // ^ takes precedence over *
    // a * b ^ c * d = a * (b ^ c) * d
    input = ['a', '*', 'b', '^', 'c', '*', 'd'];
    expected = {
        type: 'mult',
        factors: [
            'a',
            {type: 'pow', base: 'b', exponent: 'c'},
            'd'
        ]
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    // ^ takes precedence over /
    // a / b ^ c / d = (a / (b ^ c)) / d
    input = ['a', '/', 'b', '^', 'c', '/', 'd'];
    expected = {
        type: 'div',
        numerator: {
            type: 'div',
            numerator: 'a',
            denominator: {type: 'pow', base: 'b', exponent: 'c'}
        },
        denominator: 'd'
    };
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});

test('atomize', () => {
    const atoms: string[] = [
        'a1', ' ', '1', ' ', '1.225', '.', '.256', '+', '1e5', '*', '1.5E-06', '/', '.98e+3', '-', 'b', '^'
    ];
    let totalAtoms = atoms.concat(
        ['2', 'x', '.'],
        atoms.map((atom: string) => `  ${atom}`),
        atoms.map((atom: string) => `${atom}  `),
        atoms.map((atom: string) => `  ${atom}  `)
    );
    let resultAtoms = atoms.concat(['2', 'x', '.'], atoms, atoms, atoms).map(
        (atom: string) => (atom === ' ' || Number.isNaN(Number(atom)) ? atom : Number(atom))
    );
    expect(ParseMath.atomize(totalAtoms.join(''))).toMatchObject(resultAtoms);
});

test('matchGroup - Empty tree', () => {
    expect(() => ParseMath.matchGroup('')).toThrow(InvalidOperation);
    expect(() => ParseMath.matchGroup(' ')).toThrow(InvalidOperation);
});

test('matchGroup - One level group', () => {
    let input: string;
    let expected: {groupMath: MathTree, remainder: string};
    input = 'a';
    expected = {
        groupMath: 'a',
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = '-a';
    expected = {
        groupMath: {type: 'oppose', element: 'a'},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a + b';
    expected = {
        groupMath: {type: 'add', terms: ['a', 'b']},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a - b';
    expected = {
        groupMath: {type: 'add', terms: ['a', {type: 'oppose', element: 'b'}]},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a * b';
    expected = {
        groupMath: {type: 'mult', factors: ['a', 'b']},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a / b';
    expected = {
        groupMath: {type: 'div', numerator: 'a', denominator: 'b'},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a ^ b';
    expected = {
        groupMath: {type: 'pow', base: 'a', exponent: 'b'},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
});

test('matchGroup - Non closed group', () => {
    expect(() => ParseMath.matchGroup('a', 1, '(')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('a', 1, '[')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('a', 1, '{')).toThrow(DelimiterError);
});

test('matchGroup - Non opened group', () => {
    expect(() => ParseMath.matchGroup('(a')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('a)')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('[a')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('a]')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('{a')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('a}')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('(a))')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('(a])')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('(a})')).toThrow(DelimiterError);
});

test('matchGroup - opened a group', () => {
    let input: string;
    let expected: {groupMath: MathTree, remainder: string};
    input = '(a)';
    expected = {
        groupMath: 'a',
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = '(a)b';
    expected = {
        groupMath: {type: 'mult', factors: ['a', 'b']},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a(b)c';
    expected = {
        groupMath: {type: 'mult', factors: ['a', 'b', 'c']},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a(b)c(d)';
    expected = {
        groupMath: {type: 'mult', factors: ['a', 'b', 'c', 'd']},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);

    input = '[a]';
    expected = {
        groupMath: 'a',
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = '[a]b';
    expected = {
        groupMath: {type: 'mult', factors: ['a', 'b']},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a[b]c';
    expected = {
        groupMath: {type: 'mult', factors: ['a', 'b', 'c']},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a[b]c[d]';
    expected = {
        groupMath: {type: 'mult', factors: ['a', 'b', 'c', 'd']},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);

    input = '{a}';
    expected = {
        groupMath: 'a',
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = '{a}b';
    expected = {
        groupMath: {type: 'mult', factors: ['a', 'b']},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a{b}c';
    expected = {
        groupMath: {type: 'mult', factors: ['a', 'b', 'c']},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a{b}c{d}';
    expected = {
        groupMath: {type: 'mult', factors: ['a', 'b', 'c', 'd']},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
});

test('matchGroup - Mismatched delimiters', () => {
    expect(() => ParseMath.matchGroup('(a]')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('(a])')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('a]b(c)')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('(a}')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('(a})')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('a}b(c)')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('{a]')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('{a]}')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('a)b{c}')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('{a)')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('{a)}')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('a]b{c}')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('[a)')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('[a)]')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('a)b[c]')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('[a}')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('[a}]')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('a}b[c]')).toThrow(DelimiterError);
});

test('matchGroup - Nesting', () => {
    let input: string;
    let expected: {groupMath: MathTree, remainder: string};
    input = 'a(b(c)d)e';
    expected = {
        groupMath: {type: 'mult', factors: ['a', 'b', 'c', 'd', 'e']},
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
});

test('matchGroup - Nesting', () => {
    let input: string;
    input = 'a0(a1(a2(a3(a4(a5(a6(a7(a8(a9(a10(a11(a12(a13(a14(a15(a16(a17(a18(a19(a20))))))))))))))))))))';
    expect(() => ParseMath.matchGroup(input)).not.toThrow(DepthLimitExceededError);
    input = 'a0(a1(a2(a3(a4(a5(a6(a7(a8(a9(a10(a11(a12(a13(a14(a15(a16(a17(a18(a19(a20(a21)))))))))))))))))))))';
    expect(() => ParseMath.matchGroup(input)).toThrow(DepthLimitExceededError);
});

test('collapseMult', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const unitB: Unit = unitA.multiply(unitA);
    const quantityA: Quantity = new Quantity(5, unitA);
    const quantityB: Quantity = new Quantity(-5, unitA);
    const quantityC: Quantity = new Quantity(5, unitB);

    expect(() => ParseMath.collapseMult(null, {type: 'empty'})).toThrow(ValueError);
    expect(() => ParseMath.collapseMult(unitA, {type: 'empty'})).toThrow(ValueError);
    expect(() => ParseMath.collapseMult(quantityA, {type: 'empty'})).toThrow(ValueError);
    expect(() => ParseMath.collapseMult(5, {type: 'empty'})).toThrow(ValueError);

    expect(ParseMath.collapseMult(null, 5)).toBe(5);
    expect(ParseMath.collapseMult(null, unitA)).toMatchObject(unitA);
    expect(ParseMath.collapseMult(null, {type: 'mult', factors: [5, unitA]})).toMatchObject(quantityA);

    expect(ParseMath.collapseMult(5, 5)).toBe(25);
    expect(ParseMath.collapseMult(5, unitA)).toMatchObject(quantityA);
    expect(ParseMath.collapseMult(-1, {type: 'mult', factors: [5, unitA]})).toMatchObject(quantityB);

    expect(ParseMath.collapseMult(unitA, 5)).toMatchObject(quantityA);
    expect(ParseMath.collapseMult(unitA, unitA)).toMatchObject(unitB);
    expect(ParseMath.collapseMult(unitA, {type: 'mult', factors: [5, unitA]})).toMatchObject(quantityC);

    expect(ParseMath.collapseMult(quantityA, -1)).toMatchObject(quantityB);
    expect(ParseMath.collapseMult(quantityA, unitA)).toMatchObject(quantityC);
    expect(ParseMath.collapseMult(quantityB, {type: 'mult', factors: [-1, unitA]})).toMatchObject(quantityC);
});

test('collapseAdd', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const quantityA: Quantity = new Quantity(5, unitA);
    const quantityB: Quantity = new Quantity(10, unitA);
    const quantityC: Quantity = new Quantity(-5, unitA);
    const quantityD: Quantity = new Quantity(5, Unit.ONE);
    const quantityE: Quantity = new Quantity(10, Unit.ONE);

    expect(() => ParseMath.collapseAdd(null, {type: 'empty'})).toThrow(ValueError);
    expect(() => ParseMath.collapseAdd(unitA, {type: 'empty'})).toThrow(ValueError);
    expect(() => ParseMath.collapseAdd(quantityA, {type: 'empty'})).toThrow(ValueError);
    expect(() => ParseMath.collapseAdd(5, {type: 'empty'})).toThrow(ValueError);

    expect(() => ParseMath.collapseAdd(null, unitA)).toThrow(InvalidOperation);
    expect(() => ParseMath.collapseAdd(unitA, unitA)).toThrow(InvalidOperation);
    expect(() => ParseMath.collapseAdd(quantityA, unitA)).toThrow(InvalidOperation);
    expect(() => ParseMath.collapseAdd(5, unitA)).toThrow(InvalidOperation);

    expect(ParseMath.collapseAdd(null, {type: 'mult', factors: [5, unitA]})).toMatchObject(quantityA);
    expect(() => ParseMath.collapseAdd(unitA, {type: 'mult', factors: [5, unitA]})).toThrow(InvalidOperation);
    expect(ParseMath.collapseAdd(quantityA, {type: 'mult', factors: [5, unitA]})).toMatchObject(quantityB);
    expect(ParseMath.collapseAdd(quantityC, {type: 'mult', factors: [5, unitA]})).toMatchObject(Quantity.zero(unitA));
    expect(() => ParseMath.collapseAdd(5, {type: 'mult', factors: [5, unitA]})).toThrow(UnitMismatchError);

    expect(ParseMath.collapseAdd(null, 5)).toBe(5);
    expect(() => ParseMath.collapseAdd(unitA, 5)).toThrow(InvalidOperation);
    expect(() => ParseMath.collapseAdd(quantityA, 5)).toThrow(UnitMismatchError);
    expect(ParseMath.collapseAdd(quantityD, 5)).toMatchObject(quantityE);
    expect(ParseMath.collapseAdd(5, 5)).toBe(10);
});

test('collapseOppose', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const quantityA: Quantity = new Quantity(5, unitA);
    const quantityB: Quantity = new Quantity(-5, unitA);

    expect(ParseMath.collapseOppose(5)).toBe(-5);
    expect(ParseMath.collapseOppose({type: 'mult', factors: [5, unitA]})).toMatchObject(quantityB);
    expect(ParseMath.collapseOppose({type: 'mult', factors: [-5, unitA]})).toMatchObject(quantityA);

    expect(() => ParseMath.collapseOppose({type: 'empty'})).toThrow(ValueError);
    expect(() => ParseMath.collapseOppose(unitA)).toThrow(InvalidOperation);
});

test('collapseDivide', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const unitB: Unit = new Unit('A', 'unit A', {M: 1}, 3);
    const unitAB: Unit = unitA.divide(unitB);
    const unitAinv: Unit = Unit.ONE.divide(unitA);

    const quantity5AInv: Quantity = new Quantity(5, unitAinv);
    const quantity1AInv: Quantity = new Quantity(1, unitAinv);
    const quantity1A: Quantity = new Quantity(1, unitA);
    const quantity02A: Quantity = new Quantity(1 / 5, unitA);

    expect(() => ParseMath.collapseDivide({type: 'empty'}, {type: 'empty'})).toThrow(ValueError);
    expect(() => ParseMath.collapseDivide({type: 'empty'}, 5)).toThrow(ValueError);
    expect(() => ParseMath.collapseDivide({type: 'empty'}, unitA)).toThrow(ValueError);
    expect(() => ParseMath.collapseDivide({type: 'empty'}, {type: 'mult', factors: [5, unitA]})).toThrow(ValueError);

    expect(() => ParseMath.collapseDivide(5, {type: 'empty'})).toThrow(ValueError);
    expect(ParseMath.collapseDivide(5, 5)).toBe(1);
    expect(ParseMath.collapseDivide(5, unitA)).toMatchObject(quantity5AInv);
    expect(ParseMath.collapseDivide(5, {type: 'mult', factors: [5, unitA]})).toMatchObject(quantity1AInv);

    expect(() => ParseMath.collapseDivide(unitA, {type: 'empty'})).toThrow(ValueError);
    expect(ParseMath.collapseDivide(unitA, 5)).toMatchObject(quantity02A);
    expect(ParseMath.collapseDivide(unitA, unitA)).toMatchObject(new Unit('(A)/(A)', '(unit A)/(unit A)'));
    expect(ParseMath.collapseDivide(unitA, unitB)).toMatchObject(unitAB);
    expect(ParseMath.collapseDivide(unitA, {type: 'mult', factors: [5, unitA]})).toMatchObject(new Quantity(1 / 5, new Unit('()/(A)*A', '()/(unit A)*unit A')));

    expect(() => ParseMath.collapseDivide({type: 'mult', factors: [5, unitA]}, {type: 'empty'})).toThrow(ValueError);
    expect(ParseMath.collapseDivide({type: 'mult', factors: [5, unitA]}, 5)).toMatchObject(quantity1A);
    expect(ParseMath.collapseDivide({type: 'mult', factors: [5, unitA]}, unitA)).toMatchObject(new Quantity(5, new Unit('(A)/(A)', '(unit A)/(unit A)')));
    expect(ParseMath.collapseDivide({type: 'mult', factors: [5, unitA]}, {type: 'mult', factors: [5, unitA]})).toMatchObject(new Quantity(1, new Unit('(A)/(A)', '(unit A)/(unit A)')));
});

test('collapsePower', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const unitC: Unit = new Unit('C', 'unit C', {L: 1}, 1);

    expect(() => ParseMath.collapsePower({type: 'empty'}, {type: 'empty'})).toThrow(ValueError);
    expect(() => ParseMath.collapsePower({type: 'empty'}, 5)).toThrow(ValueError);
    expect(() => ParseMath.collapsePower({type: 'empty'}, unitA)).toThrow(ValueError);
    expect(() => ParseMath.collapsePower({type: 'empty'}, {type: 'mult', factors: [5, unitA]})).toThrow(ValueError);

    expect(() => ParseMath.collapsePower(5, {type: 'empty'})).toThrow(ValueError);
    expect(ParseMath.collapsePower(5, 5)).toBe(5 ** 5);
    expect(() => ParseMath.collapsePower(5, unitA)).toThrow(InvalidOperation);
    expect(() => ParseMath.collapsePower(5, {type: 'mult', factors: [5, unitA]})).toThrow(InvalidOperation);
    expect(ParseMath.collapsePower(5, {type: 'div', numerator: {type: 'mult', factors: [5, unitA]}, denominator: unitC})).toBe(5 ** 10);

    expect(() => ParseMath.collapsePower(unitA, {type: 'empty'})).toThrow(ValueError);
    expect(ParseMath.collapsePower(unitA, 5)).toMatchObject(unitA.power(5));
    expect(() => ParseMath.collapsePower(unitA, unitA)).toThrow(InvalidOperation);
    expect(() => ParseMath.collapsePower(unitA, {type: 'mult', factors: [5, unitA]})).toThrow(InvalidOperation);
    expect(ParseMath.collapsePower(unitA, {type: 'div', numerator: {type: 'mult', factors: [5, unitA]}, denominator: unitC})).toMatchObject(unitA.power(10));

    expect(() => ParseMath.collapsePower({type: 'mult', factors: [5, unitA]}, {type: 'empty'})).toThrow(ValueError);
    expect(ParseMath.collapsePower({type: 'mult', factors: [5, unitA]}, 5)).toMatchObject(new Quantity(5, unitA).power(5));
    expect(() => ParseMath.collapsePower({type: 'mult', factors: [5, unitA]}, unitA)).toThrow(InvalidOperation);
    expect(() => ParseMath.collapsePower({type: 'mult', factors: [5, unitA]}, {type: 'mult', factors: [5, unitA]})).toThrow(InvalidOperation);
    expect(ParseMath.collapsePower({type: 'mult', factors: [5, unitA]}, {type: 'div', numerator: {type: 'mult', factors: [5, unitA]}, denominator: unitC})).toMatchObject(new Quantity(5, unitA).power(10));
});

test('collapseMathTree', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const unitB: Unit = unitA.multiply(unitA);
    const unitC: Unit = new Unit('C', 'unit C', {M: 1}, 2, 1);
    const unitAC: Unit = unitA.divide(unitC);

    const quantityA: Quantity = new Quantity(5, unitA);
    const quantityB: Quantity = new Quantity(-5, unitA);

    // Base types
    expect(ParseMath.collapseMathTree(5)).toBe(5);
    expect(ParseMath.collapseMathTree(unitA)).toMatchObject(unitA);
    expect(ParseMath.collapseMathTree({type: 'empty'})).toBe(null);

    // Oppose
    expect(() => ParseMath.collapseMathTree({type: 'oppose', element: {type: 'empty'}})).toThrow(ValueError);
    expect(() => ParseMath.collapseMathTree({type: 'oppose', element: unitA})).toThrow(InvalidOperation);
    expect(ParseMath.collapseMathTree({type: 'oppose', element: 5})).toBe(-5);
    expect(ParseMath.collapseMathTree({type: 'oppose', element: {type: 'mult', factors: [-5, unitA]}})).toMatchObject(quantityA);
    expect(ParseMath.collapseMathTree({type: 'oppose', element: {type: 'mult', factors: [5, unitA]}})).toMatchObject(quantityB);

    // Multiply
    expect(ParseMath.collapseMathTree({type: 'mult', factors: []})).toBe(null);
    expect(ParseMath.collapseMathTree({type: 'mult', factors: [5]})).toBe(5);
    expect(ParseMath.collapseMathTree({type: 'mult', factors: [5, 5, -1]})).toBe(-25);
    expect(ParseMath.collapseMathTree({type: 'mult', factors: [5, unitA]})).toMatchObject(quantityA);
    expect(ParseMath.collapseMathTree({type: 'mult', factors: [5, -1, unitA]})).toMatchObject(quantityB);
    expect(ParseMath.collapseMathTree({type: 'mult', factors: [unitA, unitA]})).toMatchObject(unitB);

    // Add
    expect(ParseMath.collapseMathTree({type: 'add', terms: []})).toBe(null);
    expect(ParseMath.collapseMathTree({type: 'add', terms: [5]})).toBe(5);
    expect(ParseMath.collapseMathTree({type: 'add', terms: [5, 5, -10]})).toBe(0);
    expect(() => ParseMath.collapseMathTree({type: 'add', terms: [5, 5, unitA]})).toThrow(InvalidOperation);
    expect(() => ParseMath.collapseMathTree({type: 'add', terms: [unitA, unitA]})).toThrow(InvalidOperation);
    expect(ParseMath.collapseMathTree({type: 'add', terms: [5, 5, {type: 'mult', factors: [-10, Unit.ONE]}]})).toMatchObject(Quantity.zero());
    expect(() => ParseMath.collapseMathTree({type: 'add', terms: [5, 5, {type: 'mult', factors: [-10, unitA]}]})).toThrow(UnitMismatchError);
    expect(ParseMath.collapseMathTree({type: 'add', terms: [
        {type: 'mult', factors: [5, unitA]},
        {type: 'mult', factors: [5, unitA]},
        {type: 'mult', factors: [-10, unitA]}
    ]})).toMatchObject(Quantity.zero(unitA));

    // Divide
    expect(() => ParseMath.collapseMathTree({
        type: 'div',
        numerator: {type: 'empty'},
        denominator: {type: 'empty'}
    })).toThrow(ValueError);
    expect(ParseMath.collapseMathTree({
        type: 'div',
        numerator: 5,
        denominator: {type: 'mult', factors: [5, 2]}
    })).toBe(1 / 2);
    expect(ParseMath.collapseMathTree({
        type: 'div',
        numerator: {type: 'mult', factors: [5, unitA]},
        denominator: -1
    })).toMatchObject(quantityB);
    expect(ParseMath.collapseMathTree({
        type: 'div',
        numerator: {type: 'mult', factors: [5, unitA]},
        denominator: {type: 'mult', factors: [1, unitC]}
    })).toMatchObject(new Quantity(5, unitAC));
    expect(ParseMath.collapseMathTree({
        type: 'div',
        numerator: unitA,
        denominator: unitC
    })).toMatchObject(unitAC);

    // Power
    expect(() => ParseMath.collapseMathTree({type: 'pow', base: {type: 'empty'}, exponent: {type: 'empty'}})).toThrow(ValueError);
    expect(() => ParseMath.collapseMathTree({type: 'pow', base: unitA, exponent: unitA})).toThrow(InvalidOperation);
    expect(ParseMath.collapseMathTree({type: 'pow', base: 5, exponent: 5})).toBe(5 ** 5);
    expect(ParseMath.collapseMathTree({type: 'pow', base: unitA, exponent: 5})).toMatchObject(unitA.power(5));
    expect(ParseMath.collapseMathTree({type: 'pow', base: {type: 'mult', factors: [5, unitA]}, exponent: 5})).toMatchObject(quantityA.power(5));
});