import { DelimiterError, DepthLimitExceededError, InvalidOperation, UnexpectedError } from "./errors";
import { ParseMath } from "./math-parser";

test('dummy', () => {
    expect(true).toBe(true);
});
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
