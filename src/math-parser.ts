import regexEscape from "regex-escape";
import { DelimiterError, DepthLimitExceededError, InvalidOperation, UnexpectedError, ValueError } from "./errors";
import { Unit } from "./unit";
import { Quantity } from "./quantity";

export class ParseMath {
    static groupDelimiters: Record<string, string> = {'(': ')', '[': ']', '{': '}'};

    static matchGroup(toBeParsed: string, depthLevel: number = 0, openingDelim: string = ''): {groupMath: MathTree, remainder: string} {
        const depthLimit: number = 20;
        const openingDelims = Object.keys(ParseMath.groupDelimiters).join("");
        const closingDelims = Object.values(ParseMath.groupDelimiters).join("");
        const closingDelim = ParseMath.groupDelimiters[openingDelim] ?? '';

        const atoms: Array<MathTree> = [];
        let remainder: string = '';
        while (toBeParsed) {
            const firstDelimIndex = toBeParsed.search(`[${regexEscape(closingDelim)}${regexEscape(openingDelims)}]`);

            if (firstDelimIndex === -1 && closingDelim === '') {
                // Didn't find a delimiter and wasn't looking for one
                atoms.push(toBeParsed);
                toBeParsed = '';
            } else if (firstDelimIndex === -1) {
                // Was looking for a delimiter but didn't find one
                throw new DelimiterError(`Sequence ended while looking for a ${closingDelim} delimiter.`);
            } else if (toBeParsed[firstDelimIndex] === closingDelim) {
                // Found a closing delimiter
                const preDelim: string = toBeParsed.substring(0, firstDelimIndex);
                let index: number;
                if ((index = preDelim.search(`[${regexEscape(closingDelims)}]`)) >= 0) {
                    // Found an illegal closing delimiter
                    throw new DelimiterError(`Unexpected closing delimiter ${preDelim[index]} encountered.`);
                }

                // Anything before the delimiter is an atom
                if (preDelim) {
                    atoms.push(preDelim);
                }
                const postDelim: string = toBeParsed.substring(firstDelimIndex + 1);
                // We finished parsing the current group. Anything left is a remainder.
                toBeParsed = '';
                remainder = postDelim;
            } else {
                // Found an opening delimiter
                // Check if we haven't exceeded the depth limit
                if (depthLimit - 1 < depthLevel) {
                    throw new DepthLimitExceededError();
                }

                const preDelim: string = toBeParsed.substring(0, firstDelimIndex);
                let index: number;
                if ((index = preDelim.search(`[${regexEscape(closingDelims)}]`)) >= 0) {
                    // Found an illegal closing delimiter
                    throw new DelimiterError(`Unexpected closing delimiter ${preDelim[index]} encountered.`);
                }

                // Anything before the delimiter is an atom
                if (preDelim) {
                    atoms.push(preDelim);
                }
                const postDelim: string = toBeParsed.substring(firstDelimIndex + 1);
                // Parse the enclosed group
                const {groupMath, remainder} = ParseMath.matchGroup(postDelim, depthLevel + 1, toBeParsed[firstDelimIndex]);
                atoms.push(groupMath);
                toBeParsed = remainder;
            }
        }
        // Atomize the atoms into a list of math symbols or subtrees
        let quarks: Array<MathTree> = [];
        for (const atom of atoms) {
            if (typeof atom === "string") {
                // Check atoms don't have delimiters left
                let index: number;
                if ((index = atom.search(`[${regexEscape(`${openingDelims}${closingDelims}`)}]`)) !== -1) {
                    throw new DelimiterError(`Unexpected delimiter ${atom[index]} encountered.`);
                }
                quarks = quarks.concat(ParseMath.atomize(atom));
            } else {
                quarks.push(atom);
            }
        }
        // Transform the list of Atoms into a MathTree
        const groupMath: MathTree = ParseMath.makeTree(quarks);
        // Check we don't end up with an empty math tree
        if (typeof groupMath === 'object' && groupMath.type === 'empty') {
            throw new InvalidOperation(`Empty groups are forbidden. `);
        }
        return {groupMath, remainder};
    }

    static atomize(toBeParsed: string): Array<string | number> {
        return toBeParsed.split(/((?<=^|[*/+-\s.^])\d*\.?\d+(?:[Ee][+-]?\d+)?)/)
                         .flatMap<string | number>((value, index) => (Math.floor(index / 2) === index / 2
                                                                      ? value.split(/\s*([*/+-\s.^])\s*/)
                                                                      : Number(value)))
                         .filter(symbol => (symbol !== ""));
    }


    static makeTree(atoms: Array<MathTree>): MathTree {
        const operations: string[] = ['+', '-', '*', '/', '^'];

        // Order of operations :
        // Trim space tokens at start or end of chain
        while (atoms[0] === ' ') {
            atoms.shift();
        }
        while (atoms.at(-1) === ' ') {
            atoms.pop();
        }
        // - \s and . are alias for *
        atoms = atoms.map(atom => (atom === ' ' || atom === '.' ? '*' : atom));
        let processedAtoms: Array<MathTree> = [];
        // - Check for start/end of chain ==> do as part of operations processing ?
        // Sanitize sequences of operators
        while (atoms.length > 0) {
            // Can't be undefined, as we checked the length
            const atom: MathTree = atoms.shift() as MathTree;
            const nextAtom: MathTree | undefined = atoms[0];
            let lastAtom: MathTree | undefined = processedAtoms.at(-1);

            // Atom can't be an empty MathTree
            if (typeof atom === 'object' && atom.type === 'empty') {
                throw new InvalidOperation(`Empty groups are forbidden. `);
            }

            // Sanitize first atom
            if (processedAtoms.length === 0) {
                if (atom === '+') {
                    // + as first atom gets gobbled
                    continue;
                } else if (typeof atom === 'string' && ['*', '/', '^'].includes(atom)) {
                    throw new InvalidOperation(`${atom} is invalid as the first operation. `);
                }
            }

            // Sanitize last atom
            if (nextAtom === undefined) {
                if (typeof atom === 'string' && ['+', '-', '*', '/', '^'].includes(atom)) {
                    throw new InvalidOperation(`${atom} is invalid as the last operation. `);
                }
            }

            // Check we haven't skipped a +
            /* istanbul ignore next */
            if (atom === '+' && lastAtom === '+') {
                throw new UnexpectedError(`${lastAtom}${atom} should have been removed. `);
                // Cancel the last + if we still have one
                processedAtoms.pop();
                lastAtom = processedAtoms.at(-1);
            }

            // Sanitize atom sequences
            if (atom === '+' && nextAtom === '+') {
                // + + ==> +
                continue;
            } else if ((typeof atom !== 'string' || !operations.includes(atom)) && nextAtom === '-') {
                // MathTree - ==> MathTree + -
                atoms.unshift('+');
                processedAtoms.push(atom);
            } else if (atom === '+' && typeof nextAtom === 'string' && ['*', '/', '^'].includes(nextAtom)) {
                // + *, + /, + ^ ==> error
                throw new InvalidOperation(`${atom}${nextAtom} is an invalid sequence of operations. `);
            } else if (atom === '-' && nextAtom === '+') {
                // - + ==> -
                atoms[0] = '-';
            } else if (atom === '-' && nextAtom === '-') {
                // - - ==> +
                atoms[0] = '+';
                // Walk back one
                const walkback: MathTree | undefined = processedAtoms.pop();
                if (walkback !== undefined) {
                    atoms.unshift(walkback);
                }
            } else if (atom === '-' && typeof nextAtom === 'string' && ['*', '/', '^'].includes(nextAtom)) {
                // - *, - /, - ^ ==> error
                throw new InvalidOperation(`${atom}${nextAtom} is an invalid sequence of operations. `);
            } else if (atom === '*' && nextAtom === '+') {
                // * + ==> *
                atoms[0] = '*';
            } else if (atom === '*' && typeof nextAtom === 'string' && ['*', '/', '^'].includes(nextAtom)) {
                // * *, * /, * ^ ==> error
                throw new InvalidOperation(`${atom}${nextAtom} is an invalid sequence of operations. `);
            } else if (atom === '/' && nextAtom === '+') {
                // / + ==> /
                atoms[0] = '/';
            } else if (atom === '/' && typeof nextAtom === 'string' && ['*', '/', '^'].includes(nextAtom)) {
                // / *, / /, / ^ ==> error
                throw new InvalidOperation(`${atom}${nextAtom} is an invalid sequence of operations. `);
            } else if (atom === '^' && nextAtom === '+') {
                // ^ + ==> ^
                atoms[0] = '^';
            } else if (atom === '^' && typeof nextAtom === 'string' && ['*', '/', '^'].includes(nextAtom)) {
                // ^ *, ^ /, ^ ^ ==> error
                throw new InvalidOperation(`${atom}${nextAtom} is an invalid sequence of operations. `);
            } else if (
                nextAtom !== undefined &&
                (typeof atom !== 'string' || !operations.includes(atom)) &&
                (typeof nextAtom !== 'string' || !operations.includes(nextAtom))
            ) {
                // MathTree MathTree ==> MathTree * MathTree
                // TODO: If I ever want to implement functions, this needs to change.
                // Function = [Symbol MathTree] at this point, so here we destroy it.
                atoms.unshift('*');
                processedAtoms.push(atom);
            } else {
                // + -, * -, / -, ^ -, Operator MathTree, MathTree Operator ==> valid
                processedAtoms.push(atom);
            }
        }
        atoms = processedAtoms;
        processedAtoms = [];
        // At this point, we only have valid sequences of [MathTree Operator MathTree] or [Operator Operator]

        // Power
        while (atoms.length > 0) {
            // Can't be undefined, as we checked the length
            const atom: MathTree = atoms.shift() as MathTree;
            if (atom === '^') {
                // atoms = [..., ^ ] or [ ^, ...] hould haved thrown an error already
                let nextAtom: MathTree = atoms.shift() as MathTree;
                // Handle sequence a ^ - b
                if (nextAtom === '-') {
                    nextAtom = {type: 'oppose', element: atoms.shift() as MathTree};
                }
                const lastAtom: MathTree = processedAtoms.pop() as MathTree;
                processedAtoms.push({type: 'pow', base: lastAtom, exponent: nextAtom});
            } else {
                processedAtoms.push(atom);
            }
        }
        atoms = processedAtoms;
        processedAtoms = [];

        // Divide
        while (atoms.length > 0) {
            // Can't be undefined, as we checked the length
            const atom: MathTree = atoms.shift() as MathTree;
            if (atom === '/') {
                // atoms = [..., / ] or [ /, ...] hould haved thrown an error already
                let nextAtom: MathTree = atoms.shift() as MathTree;
                // Handle sequence a / - b
                if (nextAtom === '-') {
                    nextAtom = {type: 'oppose', element: atoms.shift() as MathTree};
                }
                const lastAtom: MathTree = processedAtoms.pop() as MathTree;
                processedAtoms.push({type: 'div', numerator: lastAtom, denominator: nextAtom});
            } else {
                processedAtoms.push(atom);
            }
        }
        atoms = processedAtoms;
        processedAtoms = [];

        // Multiply
        while (atoms.length > 0) {
            // Can't be undefined, as we checked the length
            const atom: MathTree = atoms.shift() as MathTree;
            if (atom === '*') {
                // atoms = [..., * ] or [ *, ...] hould haved thrown an error already
                let nextAtom: MathTree = atoms.shift() as MathTree;
                // Handle sequence a * - b
                if (nextAtom === '-') {
                    nextAtom = {type: 'oppose', element: atoms.shift() as MathTree};
                }
                const lastAtom: MathTree = processedAtoms.pop() as MathTree;
                if (
                    typeof lastAtom === 'object' && lastAtom.type === 'mult' &&
                    typeof nextAtom === 'object' && nextAtom.type === 'mult'
                ) {
                    processedAtoms.push({type: 'mult', factors: [...lastAtom.factors, ...nextAtom.factors]});
                } else if (typeof lastAtom === 'object' && lastAtom.type === 'mult') {
                    processedAtoms.push({type: 'mult', factors: [...lastAtom.factors, nextAtom]});
                } else if (typeof nextAtom === 'object' && nextAtom.type === 'mult') {
                    processedAtoms.push({type: 'mult', factors: [lastAtom, ...nextAtom.factors]});
                } else {
                    processedAtoms.push({type: 'mult', factors: [lastAtom, nextAtom]});
                }
            } else {
                processedAtoms.push(atom);
            }
        }
        atoms = processedAtoms;
        processedAtoms = [];

        // Minus => Oppose
        while (atoms.length > 0) {
            // Can't be undefined, as we checked the length
            const atom: MathTree = atoms.shift() as MathTree;
            if (atom === '-') {
                // atoms = [..., - ] should haved thrown an error already
                const nextAtom: MathTree = atoms.shift() as MathTree;
                processedAtoms.push({type: "oppose", element: nextAtom});
            } else {
                processedAtoms.push(atom);
            }
        }
        atoms = processedAtoms;
        processedAtoms = [];

        // Add
        while (atoms.length > 0) {
            // Can't be undefined, as we checked the length
            const atom: MathTree = atoms.shift() as MathTree;
            if (atom === '+') {
                // atoms = [ +, ...] already dealt with [..., + ] should haved thrown an error already
                const nextAtom: MathTree = atoms.shift() as MathTree;
                const lastAtom: MathTree = processedAtoms.pop() as MathTree;
                if (
                    typeof lastAtom === 'object' && lastAtom.type === 'add' &&
                    typeof nextAtom === 'object' && nextAtom.type === 'add'
                ) {
                    processedAtoms.push({type: 'add', terms: [...lastAtom.terms, ...nextAtom.terms]});
                } else if (typeof lastAtom === 'object' && lastAtom.type === 'add') {
                    processedAtoms.push({type: 'add', terms: [...lastAtom.terms, nextAtom]});
                } else if (typeof nextAtom === 'object' && nextAtom.type === 'add') {
                    processedAtoms.push({type: 'add', terms: [lastAtom, ...nextAtom.terms]});
                } else {
                    processedAtoms.push({type: 'add', terms: [lastAtom, nextAtom]});
                }
            } else {
                processedAtoms.push(atom);
            }
        }
        atoms = processedAtoms;
        processedAtoms = [];

        // Check that we fully collapsed the tree
        switch (atoms.length) {
            case 0:
                return {type: 'empty'};
            case 1:
                return atoms[0];
            /* istanbul ignore next */
            default:
                throw new UnexpectedError(`Some unknown error happened while parsing operations. Final state : ${JSON.stringify(atoms)}`);
        }
    }

    static collapseMathTree(mathTree: MathTree<Unit>): Unit | Quantity | number | null {
        if (typeof mathTree === 'number' || mathTree instanceof Unit) {
            return mathTree;
        } else if (mathTree.type === 'mult') {
            return mathTree.factors.reduce((total, current) => ParseMath.collapseMult(total, current), null);
        } else if (mathTree.type === 'add') {
            return mathTree.terms.reduce((total, current) => ParseMath.collapseAdd(total, current), null);
        } else if (mathTree.type === 'oppose') {
            return ParseMath.collapseOppose(mathTree.element);
        } else if (mathTree.type === 'div') {
            return ParseMath.collapseDivide(mathTree.numerator, mathTree.denominator);
        } else if (mathTree.type === 'pow') {
            return ParseMath.collapsePower(mathTree.base, mathTree.exponent);
        }
        // mathTree.type === 'empty'
        return null;
    }

    static collapseMult(totalValue: Unit | Quantity | number | null, newFactor: MathTree<Unit>): Unit | Quantity | number {
        const newFactorValue = ParseMath.collapseMathTree(newFactor);
        if (newFactorValue === null) {
            throw new ValueError(`Cannot multiply an empty group.`);
        } else if (totalValue === null) {
            return newFactorValue;
        } else if (totalValue instanceof Quantity) {
            return totalValue.multiply(newFactorValue);
        } else if (newFactorValue instanceof Quantity) {
            return newFactorValue.multiply(totalValue);
        } else if (totalValue instanceof Unit) {
            return totalValue.multiply(newFactorValue);
        } else if (newFactorValue instanceof Unit) {
            return newFactorValue.multiply(totalValue);
        } else { // typeof totalValue === 'number' && typeof newFactorValue === 'number'
            return totalValue * newFactorValue;
        }
    }

    static collapseAdd(totalValue: Unit | Quantity | number | null, newTerm: MathTree<Unit>): Quantity | number {
        const newTermValue = ParseMath.collapseMathTree(newTerm);
        if (newTermValue === null) {
            throw new ValueError(`Cannot multiply an empty group.`);
        } else if (totalValue instanceof Unit || newTermValue instanceof Unit) {
            throw new InvalidOperation(`Addition cannot be performed on a pure unit.`);
        } else if (totalValue === null) {
            return newTermValue;
        } else if (totalValue instanceof Quantity) {
            return totalValue.add(newTermValue);
        } else if (newTermValue instanceof Quantity) {
            return newTermValue.add(totalValue);
        } else { // typeof totalValue === 'number' && typeof newTermValue === 'number'
            return totalValue + newTermValue;
        }
    }

    static collapseOppose(element: MathTree<Unit>): Quantity | number {
        const elementValue = ParseMath.collapseMathTree(element);
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

    static collapseDivide(numerator: MathTree<Unit>, denominator: MathTree<Unit>): Quantity | Unit | number {
        const numeratorValue = ParseMath.collapseMathTree(numerator);
        const denominatorValue = ParseMath.collapseMathTree(denominator);
        if (numeratorValue === null || denominatorValue === null) {
            throw new ValueError(`Cannot perform division on empty groups`);
        } else if (typeof numeratorValue === 'number' && typeof denominatorValue === 'number') {
            return numeratorValue / denominatorValue;
        } else if (numeratorValue instanceof Quantity) {
            return numeratorValue.divide(denominatorValue);
        } else if (denominatorValue instanceof Quantity) {
            return Quantity.ONE().divide(denominatorValue).multiply(numeratorValue);
        } else if (numeratorValue instanceof Unit) {
            return numeratorValue.divide(denominatorValue);
        } else { // denominatorValue instanceof Unit
            return Unit.ONE.divide(denominatorValue).multiply(numeratorValue);
        }
    }

    static collapsePower(base: MathTree<Unit>, exponent: MathTree<Unit>): Quantity | Unit | number {
        const baseValue = ParseMath.collapseMathTree(base);
        let exponentValue = ParseMath.collapseMathTree(exponent);
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