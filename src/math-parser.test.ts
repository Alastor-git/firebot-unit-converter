import "@/mocks/firebot-modules";
import { UnitParser } from "./unit-parser";
import { ParseMath } from "./math-parser";
import { DelimiterError, DepthLimitExceededError, InvalidOperation } from "./errors";
import { MathTree, Empty, StringSymbol, Numeric, Add, Oppose, Multiply, Divide, Power } from './MathTree';
import { Unit } from "./Unit/unit";
import { Prefix } from "./Unit/prefix";
import { Quantity } from "./quantity";
import { logger } from "./shared/firebot-modules";

/* */
test('makeTree empty', () => {
    expect(ParseMath.makeTree([])).toMatchObject(new Empty());
});
/* */
test('makeTree single token', () => {
    expect(ParseMath.makeTree([new StringSymbol('a')])).toMatchObject(new StringSymbol('a'));
    expect(ParseMath.makeTree([new Numeric(1)])).toMatchObject(new Numeric(1));
    expect(ParseMath.makeTree([new Numeric(1.2)])).toMatchObject(new Numeric(1.2));
    expect(ParseMath.makeTree([new Numeric(1.2e-5)])).toMatchObject(new Numeric(1.2e-5));
});
/* */
test('makeTree single group', () => {
    let subGroup: MathTree;
    subGroup = new Empty();
    expect(() => ParseMath.makeTree([subGroup])).toThrow(InvalidOperation);
    subGroup = new Add(new StringSymbol('a'), new StringSymbol('b'));
    expect(ParseMath.makeTree([subGroup])).toMatchObject(subGroup);
    subGroup = new Oppose(new StringSymbol('a'));
    expect(ParseMath.makeTree([subGroup])).toMatchObject(subGroup);
    subGroup = new Multiply(new StringSymbol('a'), new StringSymbol('b'));
    expect(ParseMath.makeTree([subGroup])).toMatchObject(subGroup);
    subGroup = new Divide(new StringSymbol('a'), new StringSymbol('b'));
    expect(ParseMath.makeTree([subGroup])).toMatchObject(subGroup);
    subGroup = new Power(new StringSymbol('a'), new StringSymbol('b'));
    expect(ParseMath.makeTree([subGroup])).toMatchObject(subGroup);
});
/* */
test('makeTree spaces at start/end', () => {
    const emptyString = new StringSymbol(' ');
    const aString = new StringSymbol('a');
    expect(ParseMath.makeTree([emptyString, aString])).toMatchObject(aString);
    expect(ParseMath.makeTree([emptyString, emptyString, aString])).toMatchObject(aString);
    expect(ParseMath.makeTree([aString, emptyString])).toMatchObject(aString);
    expect(ParseMath.makeTree([aString, emptyString, emptyString])).toMatchObject(aString);
    expect(ParseMath.makeTree([emptyString, aString, emptyString])).toMatchObject(aString);
    expect(ParseMath.makeTree([emptyString, emptyString, aString, emptyString, emptyString])).toMatchObject(aString);
});
/* */
test('makeTree add', () => {
    const plusString = new StringSymbol('+');
    const aString = new StringSymbol('a');
    const bString = new StringSymbol('b');
    const cString = new StringSymbol('c');
    const dString = new StringSymbol('d');
    let input: MathTree[] = [aString, plusString, bString];
    let expected: MathTree = new Add(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [new Add(aString, bString), plusString, cString];
    expected = new Add(aString, bString, cString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // Do it twice to check we haven't mutated input objects
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, plusString, new Add(bString, cString)];
    expected = new Add(aString, bString, cString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // Do it twice to check we haven't mutated input objects
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [new Add(aString, bString), plusString, new Add(cString, dString)];
    expected = new Add(aString, bString, cString, dString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // Do it twice to check we haven't mutated input objects
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree multiply', () => {
    const spaceString = new StringSymbol(' ');
    const dotString = new StringSymbol('.');
    const starString = new StringSymbol('*');
    const aString = new StringSymbol('a');
    const bString = new StringSymbol('b');
    const cString = new StringSymbol('c');
    const dString = new StringSymbol('d');
    let input: MathTree[] = [aString, starString, bString];
    let expected: MathTree = new Multiply(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [new Multiply(aString, bString), starString, cString];
    expected = new Multiply(aString, bString, cString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // Do it twice to check we haven't mutated input objects
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, starString, new Multiply(bString, cString)];
    expected = new Multiply(aString, bString, cString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // Do it twice to check we haven't mutated input objects
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [new Multiply(aString, bString), starString, new Multiply(cString, dString)];
    expected = new Multiply(aString, bString, cString, dString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // Do it twice to check we haven't mutated input objects
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, bString];
    expected = new Multiply(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, spaceString, bString];
    expected = new Multiply(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, dotString, bString];
    expected = new Multiply(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree divide', () => {
    const slashString = new StringSymbol('/');
    const aString = new StringSymbol('a');
    const bString = new StringSymbol('b');
    const input: MathTree[] = [aString, slashString, bString];
    const expected: MathTree = new Divide(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree power', () => {
    const caretString = new StringSymbol('^');
    const aString = new StringSymbol('a');
    const bString = new StringSymbol('b');
    const input: MathTree[] = [aString, caretString, bString];
    const expected: MathTree = new Power(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree oppose', () => {
    const minusString = new StringSymbol('-');
    const aString = new StringSymbol('a');
    const input: MathTree[] = [minusString, aString];
    const expected: MathTree = new Oppose(aString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree sequences of operators', () => {
    const plusString = new StringSymbol('+');
    const minusString = new StringSymbol('-');
    const starString = new StringSymbol('*');
    const spaceString = new StringSymbol(' ');
    const slashString = new StringSymbol('/');
    const caretString = new StringSymbol('^');
    const aString = new StringSymbol('a');
    const bString = new StringSymbol('b');
    let input: MathTree[];
    let expected: MathTree;
    input = [aString, plusString, minusString, bString];
    expected = new Add(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, starString, minusString, bString];
    expected = new Multiply(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, spaceString, minusString, bString];
    expected = new Multiply(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, slashString, minusString, bString];
    expected = new Divide(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, caretString, minusString, bString];
    expected = new Power(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    input = [aString, caretString, starString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, caretString, spaceString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, caretString, slashString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, caretString, caretString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);

    input = [aString, caretString, plusString, bString];
    expected = new Power(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    input = [aString, slashString, starString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, slashString, spaceString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, slashString, slashString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, slashString, caretString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);

    input = [aString, slashString, plusString, bString];
    expected = new Divide(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    input = [aString, starString, starString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, starString, spaceString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, starString, slashString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, starString, caretString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);

    input = [aString, spaceString, starString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, spaceString, spaceString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, spaceString, slashString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, spaceString, caretString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);

    input = [aString, starString, plusString, bString];
    expected = new Multiply(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, spaceString, plusString, bString];
    expected = new Multiply(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    input = [aString, minusString, starString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, minusString, spaceString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, minusString, slashString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, minusString, caretString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);

    input = [aString, minusString, minusString, bString];
    expected = new Add(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    input = [aString, minusString, plusString, bString];
    expected = new Add(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    input = [aString, plusString, starString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, plusString, spaceString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, plusString, slashString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, plusString, caretString, bString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);

    input = [aString, plusString, plusString, bString];
    expected = new Add(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree legal sequences of 3 operators', () => {
    const plusString = new StringSymbol('+');
    const minusString = new StringSymbol('-');
    const starString = new StringSymbol('*');
    const slashString = new StringSymbol('/');
    const caretString = new StringSymbol('^');
    const aString = new StringSymbol('a');
    const bString = new StringSymbol('b');
    let input: MathTree[];
    let expected: MathTree;
    input = [aString, plusString, plusString, plusString, bString];
    expected = new Add(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, plusString, plusString, minusString, bString];
    expected = new Add(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, plusString, minusString, plusString, bString];
    expected = new Add(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, plusString, minusString, minusString, bString];
    expected = new Add(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, minusString, plusString, plusString, bString];
    expected = new Add(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, minusString, plusString, minusString, bString];
    expected = new Add(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, minusString, minusString, plusString, bString];
    expected = new Add(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, minusString, minusString, minusString, bString];
    expected = new Add(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);


    input = [aString, caretString, plusString, plusString, bString];
    expected = new Power(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, caretString, plusString, minusString, bString];
    expected = new Power(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, caretString, minusString, plusString, bString];
    expected = new Power(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, caretString, minusString, minusString, bString];
    expected = new Power(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);


    input = [aString, slashString, plusString, plusString, bString];
    expected = new Divide(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, slashString, plusString, minusString, bString];
    expected = new Divide(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, slashString, minusString, plusString, bString];
    expected = new Divide(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, slashString, minusString, minusString, bString];
    expected = new Divide(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);


    input = [aString, starString, plusString, plusString, bString];
    expected = new Multiply(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, starString, plusString, minusString, bString];
    expected = new Multiply(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, starString, minusString, plusString, bString];
    expected = new Multiply(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    input = [aString, starString, minusString, minusString, bString];
    expected = new Multiply(aString, bString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree some legal sequences of 4 operators', () => {
    const plusString = new StringSymbol('+');
    const minusString = new StringSymbol('-');
    const aString = new StringSymbol('a');
    const bString = new StringSymbol('b');
    const input: MathTree[] = [aString, minusString, minusString, plusString, minusString, bString];
    const expected: MathTree = new Add(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree operation as first atom', () => {
    const plusString = new StringSymbol('+');
    const minusString = new StringSymbol('-');
    const starString = new StringSymbol('*');
    const istarString = new StringSymbol('i*');
    const slashString = new StringSymbol('/');
    const caretString = new StringSymbol('^');
    const aString = new StringSymbol('a');
    let input: MathTree[];
    let expected: MathTree;
    input = [starString, aString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [istarString, aString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [slashString, aString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [caretString, aString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [plusString, aString];
    expected = aString;
    expect(ParseMath.makeTree(input)).toBe(expected);
    input = [minusString, aString];
    expected = new Oppose(aString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('makeTree operation as last atom', () => {
    const plusString = new StringSymbol('+');
    const minusString = new StringSymbol('-');
    const starString = new StringSymbol('*');
    const istarString = new StringSymbol('i*');
    const slashString = new StringSymbol('/');
    const caretString = new StringSymbol('^');
    const aString = new StringSymbol('a');
    let input: MathTree[];
    input = [aString, plusString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, minusString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, starString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, istarString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, slashString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
    input = [aString, caretString];
    expect(() => ParseMath.makeTree(input)).toThrow(InvalidOperation);
});
/* */
test('makeTree order of operations', () => {
    const plusString = new StringSymbol('+');
    const minusString = new StringSymbol('-');
    const starString = new StringSymbol('*');
    const istarString = new StringSymbol('i*');
    const slashString = new StringSymbol('/');
    const caretString = new StringSymbol('^');
    const aString = new StringSymbol('a');
    const bString = new StringSymbol('b');
    const cString = new StringSymbol('c');
    const dString = new StringSymbol('d');
    let input: MathTree[];
    let expected: MathTree;
    // ^  => Power
    // i* => Implicit Multiply
    // /  => Divide
    // *  => Multiply
    // -  => Oppose
    // +  => Add

    // - takes precedence over +
    // a + b - c + d = a + b + (-c) + d
    input = [aString, plusString, bString, minusString, cString, plusString, dString];
    expected = new Add(aString, bString, new Oppose(cString), dString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // * takes precedence over +
    // a + b * c + d = a + (b * c) + d
    input = [aString, plusString, bString, starString, cString, plusString, dString];
    expected = new Add(aString, new Multiply(bString, cString), dString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // / takes precedence over +
    // a + b / c + d = a + (b / c) + d
    input = [aString, plusString, bString, slashString, cString, plusString, dString];
    expected = new Add(aString, new Divide(bString, cString), dString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // i* takes precedence over +
    // a + b i* c + d = a + (b i* c) + d
    input = [aString, plusString, bString, istarString, cString, plusString, dString];
    expected = new Add(aString, new Multiply(bString, cString), dString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // ^ takes precedence over +
    // a + b ^ c + d = a + (b ^ c) + d
    input = [aString, plusString, bString, caretString, cString, plusString, dString];
    expected = new Add(aString, new Power(bString, cString), dString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    // * takes precedence over -
    // - a * b * - c = - (a * b * (-c))
    input = [minusString, aString, starString, bString, starString, minusString, cString];
    expected = new Oppose(new Multiply(aString, bString, new Oppose(cString)));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // / takes precedence over -
    // - a / b / - c = - ((a / b) / (-c))
    input = [minusString, aString, slashString, bString, slashString, minusString, cString];
    expected =
    new Oppose(
        new Divide(
            new Divide(aString, bString),
            new Oppose(cString)
        )
    );
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // i* takes precedence over -
    // - a i* b i* - c = - (a i* b i* (-c))
    input = [minusString, aString, istarString, bString, istarString, minusString, cString];
    expected = new Oppose(new Multiply(aString, bString, new Oppose(cString)));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // ^ takes precedence over -
    // - a ^ b = - (a ^ b) ==> Ex -1^2 vs (-1)^2
    input = [minusString, aString, caretString, bString];
    expected =
    new Oppose(new Power(aString, bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // a ^ - b = (a ^ (-b))
    input = [aString, caretString, minusString, bString];
    expected = new Power(aString, new Oppose(bString));
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    // / takes precedence over *
    // a * b / c * d = a * (b / c) * d
    input = [aString, starString, bString, slashString, cString, starString, dString];
    expected = new Multiply(aString, new Divide(bString, cString), dString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // i* takes precedence over * but they're actually equivalent
    // a * b i* c * d = a * (b i* c) * d
    input = [aString, starString, bString, istarString, cString, starString, dString];
    expected = new Multiply(aString, bString, cString, dString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // ^ takes precedence over *
    // a * b ^ c * d = a * (b ^ c) * d
    input = [aString, starString, bString, caretString, cString, starString, dString];
    expected = new Multiply(aString, new Power(bString, cString), dString);
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    // i* takes precedence over /
    // a / b i* c / d = (a / (b i* c)) / d
    input = [aString, slashString, bString, istarString, cString, slashString, dString];
    expected =
    new Divide(
        new Divide(
            aString,
            new Multiply(bString, cString)
        ),
        dString
    );
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
    // ^ takes precedence over /
    // a / b ^ c / d = (a / (b ^ c)) / d
    input = [aString, slashString, bString, caretString, cString, slashString, dString];
    expected =
    new Divide(
        new Divide(
            aString,
            new Power(bString, cString)
        ),
        dString
    );
    expect(ParseMath.makeTree(input)).toMatchObject(expected);

    // ^ takes precedence over i*
    // a i* b ^ c i* d = (a i* (b ^ c) i* d)
    input = [aString, istarString, bString, caretString, cString, istarString, dString];
    expected =
    new Multiply(
        aString,
        new Power(bString, cString),
        dString
    );
    expect(ParseMath.makeTree(input)).toMatchObject(expected);
});
/* */
test('atomize', () => {
    const atoms: string[] = [
        'a1', ' ', '1', ' ', '1.225', '.', '.256', '+', '1e5', '*', '1.5E-06', '/', '.98e+3', '-', 'b', '^'
    ];
    const totalAtoms = atoms.concat(
        ['2', 'x', '.'],
        atoms.map((atom: string) => `  ${atom}`),
        atoms.map((atom: string) => `${atom}  `),
        atoms.map((atom: string) => `  ${atom}  `)
    );
    const resultAtoms = atoms.concat(['2', 'x', '.'], atoms, atoms, atoms).map(
        (atom: string) => (atom === ' ' || Number.isNaN(Number(atom)) ? new StringSymbol(atom) : new Numeric(Number(atom)))
    );
    expect(ParseMath.atomize(totalAtoms.join(''))).toMatchObject(resultAtoms);
});
/* */
test('matchGroup - Empty tree', () => {
    expect(() => ParseMath.matchGroup('')).toThrow(InvalidOperation);
    expect(() => ParseMath.matchGroup(' ')).toThrow(InvalidOperation);
});
/* */
test('matchGroup - One level group', () => {
    const aString: StringSymbol = new StringSymbol('a');
    const bString: StringSymbol = new StringSymbol('b');
    let input: string;
    let expected: {groupMath: MathTree, remainder: string};
    input = 'a';
    expected = {
        groupMath: aString,
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = '-a';
    expected = {
        groupMath: new Oppose(aString),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a + b';
    expected = {
        groupMath: new Add(aString, bString),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a - b';
    expected = {
        groupMath: new Add(aString, new Oppose(bString)),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a * b';
    expected = {
        groupMath: new Multiply(aString, bString),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a / b';
    expected = {
        groupMath: new Divide(aString, bString),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a ^ b';
    expected = {
        groupMath: new Power(aString, bString),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
});
/* */
test('matchGroup - Non closed group', () => {
    expect(() => ParseMath.matchGroup('a', 1, '(')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('a', 1, '[')).toThrow(DelimiterError);
    expect(() => ParseMath.matchGroup('a', 1, '{')).toThrow(DelimiterError);
});
/* */
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
/* */
test('matchGroup - opened a group', () => {
    const aString: StringSymbol = new StringSymbol('a');
    const bString: StringSymbol = new StringSymbol('b');
    const cString: StringSymbol = new StringSymbol('c');
    const dString: StringSymbol = new StringSymbol('d');
    let input: string;
    let expected: {groupMath: MathTree, remainder: string};
    input = '(a)';
    expected = {
        groupMath: aString,
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = '(a)b';
    expected = {
        groupMath: new Multiply(aString, bString),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a(b)c';
    expected = {
        groupMath: new Multiply(aString, bString, cString),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a(b)c(d)';
    expected = {
        groupMath: new Multiply(aString, bString, cString, dString),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);

    input = '[a]';
    expected = {
        groupMath: aString,
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = '[a]b';
    expected = {
        groupMath: new Multiply(aString, bString),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a[b]c';
    expected = {
        groupMath: new Multiply(aString, bString, cString),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a[b]c[d]';
    expected = {
        groupMath: new Multiply(aString, bString, cString, dString),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);

    input = '{a}';
    expected = {
        groupMath: aString,
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = '{a}b';
    expected = {
        groupMath: new Multiply(aString, bString),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a{b}c';
    expected = {
        groupMath: new Multiply(aString, bString, cString),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
    input = 'a{b}c{d}';
    expected = {
        groupMath: new Multiply(aString, bString, cString, dString),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
});
/* */
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
/* */
test('matchGroup - Nesting', () => {
    const aString: StringSymbol = new StringSymbol('a');
    const bString: StringSymbol = new StringSymbol('b');
    const cString: StringSymbol = new StringSymbol('c');
    const dString: StringSymbol = new StringSymbol('d');
    const eString: StringSymbol = new StringSymbol('e');
    let input: string;
    let expected: {groupMath: MathTree, remainder: string};
    input = 'a(b(c)d)e';
    expected = {
        groupMath: new Multiply(aString, bString, cString, dString, eString),
        remainder: ''
    };
    expect(ParseMath.matchGroup(input)).toMatchObject(expected);
});
/* */
test('matchGroup - Nesting', () => {
    let input: string;
    input = 'a0(a1(a2(a3(a4(a5(a6(a7(a8(a9(a10(a11(a12(a13(a14(a15(a16(a17(a18(a19(a20))))))))))))))))))))';
    expect(() => ParseMath.matchGroup(input)).not.toThrow(DepthLimitExceededError);
    input = 'a0(a1(a2(a3(a4(a5(a6(a7(a8(a9(a10(a11(a12(a13(a14(a15(a16(a17(a18(a19(a20(a21)))))))))))))))))))))';
    expect(() => ParseMath.matchGroup(input)).toThrow(DepthLimitExceededError);
});
/* */
test('implicit multiplication', () => {
    // 10m/(5e3mm) should be parsed the same as 10m/5e3mm
    expect(ParseMath.match('10m/(5e3mm)')).toMatchObject(ParseMath.match('10m/5e3mm'));
});
/* */
test('match', () => {
    const unit_g: Unit = new Unit('g', 'gramme', {M: 1}, 1, 0); // eslint-disable-line camelcase
    const unit_m: Unit = new Unit('m', 'meter', { L: 1 }); // eslint-disable-line camelcase
    const unit_in: Unit = new Unit(['in', "''"], 'inch', { L: 1 }, 2.54e-2); // eslint-disable-line camelcase

    const prefix_k: Prefix = new Prefix('k', 'kilo', 10, 3); // eslint-disable-line camelcase
    const prefix_c: Prefix = new Prefix('c', 'centi', 10, -2); // eslint-disable-line camelcase
    const prefix_m: Prefix = new Prefix('m', 'mili', 10, -3); // eslint-disable-line camelcase

    UnitParser.registerUnit(unit_g);
    UnitParser.registerUnit(unit_m);
    UnitParser.registerUnit(unit_in);
    UnitParser.registerPrefix(prefix_m);
    UnitParser.registerPrefix(prefix_c);
    UnitParser.registerPrefix(prefix_k);

    expect(ParseMath.match('2 + 3 * 5e3 / (6 + 8)^(2+1) - 5').collapse()).toBe(2 + 3 * 5e3 / (6 + 8) ** (2 + 1) - 5);
    const expected = new Quantity(
        (2e3 + 3 * 5 * 2.54e-2 - 5e-2) / (6 + 8e-3) ** (2 + 1) / 1e3,
        unit_m.applyPrefix(prefix_k).divide(unit_g.power(3)) // eslint-disable-line camelcase
    );
    expect(ParseMath.match(`(2km + 3 * 5'' - 5cm) / (6g + 8mg)^(10m/(5e3mm)+1)`).parseUnits().collapse()).toMatchObject(expected);
    expect(ParseMath.match(`(2km + 3 * 5'' - 5cm) / (6g + 8mg)^(10m/5e3mm+1)`).parseUnits().collapse()).toMatchObject(expected);
});
/* */