import regexEscape from "regex-escape";
import { DelimiterError, DepthLimitExceededError, InvalidOperation, UnexpectedError } from "./errors";
import { MathTree, Empty, StringSymbol, Numeric, Add, Oppose, Multiply, Divide, Power } from './MathTree';
import { logger } from "./shared/firebot-modules";

export class ParseMath {
    static groupDelimiters: Record<string, string> = {'(': ')', '[': ']', '{': '}'};

    static match(toBeParsed: string): MathTree {
        const {groupMath, remainder}: {groupMath: MathTree, remainder: string} = ParseMath.matchGroup(toBeParsed);
        /* istanbul ignore next */
        if (remainder !== '') {
            throw new UnexpectedError(`Input could not be fully parsed. '${remainder}' was left out`);
        }
        return groupMath;
    }

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
                atoms.push(new StringSymbol(toBeParsed));
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
                    atoms.push(new StringSymbol(preDelim));
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
                    atoms.push(new StringSymbol(preDelim));
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
            if (atom instanceof StringSymbol) {
                // Check atoms don't have delimiters left
                let index: number;
                if ((index = atom.value.search(`[${regexEscape(`${openingDelims}${closingDelims}`)}]`)) !== -1) {
                    throw new DelimiterError(`Unexpected delimiter ${atom.value[index]} encountered.`);
                }
                quarks = quarks.concat(ParseMath.atomize(atom.value));
            } else {
                quarks.push(atom);
            }
        }
        // Transform the list of Atoms into a MathTree
        const groupMath: MathTree = ParseMath.makeTree(quarks);
        // Check we don't end up with an empty math tree
        if (groupMath instanceof Empty) {
            throw new InvalidOperation(`Empty groups are forbidden. `);
        }
        return {groupMath, remainder};
    }

    static atomize(toBeParsed: string): Array<StringSymbol | Numeric> {
        return toBeParsed.split(/((?<=^|[*/+-\s.^])\d*\.?\d+(?:[Ee][+-]?\d+)?)/)
                         .flatMap<string | number>((value, index) => (Math.floor(index / 2) === index / 2
                                                                      ? value.split(/\s*([*/+-\s.^])\s*/)
                                                                      : Number(value)))
                         .filter(symbol => (symbol !== ""))
                         .map(quark => (typeof quark === 'string' ? new StringSymbol(quark) : new Numeric(quark)));
    }


    static makeTree(atoms: Array<MathTree>): MathTree {
        // 'i*' represents implicit multiplication
        const operations: string[] = ['+', '-', '*', '/', '^', 'i*'];

        // Order of operations :
        // Trim space tokens at start or end of chain
        while (atoms[0] instanceof StringSymbol && atoms[0].value === ' ') {
            atoms.shift();
        }
        let lastAtom: MathTree | undefined;
        while ((lastAtom = atoms.at(-1)) instanceof StringSymbol && lastAtom.value === ' ') {
            atoms.pop();
        }
        // - \s is an alias for implicit multiplication i* and and . an alias for explicit multiplication *
        atoms = atoms.map(atom => (atom instanceof StringSymbol && (atom.value === ' ') ? new StringSymbol('i*') : atom));
        atoms = atoms.map(atom => (atom instanceof StringSymbol && (atom.value === '.') ? new StringSymbol('*') : atom));
        let processedAtoms: Array<MathTree> = [];
        // - Check for start/end of chain ==> do as part of operations processing ?
        // Sanitize sequences of operators
        while (atoms.length > 0) {
            // Can't be undefined, as we checked the length
            let atom: MathTree = atoms.shift() as MathTree;
            const nextAtom: MathTree | undefined = atoms[0];
            let lastAtom: MathTree | undefined = processedAtoms.at(-1);

            // Atom can't be an empty MathTree
            if (atom instanceof Empty) {
                throw new InvalidOperation(`Empty groups are forbidden. `);
            }

            // Sanitize first atom
            if (processedAtoms.length === 0) {
                if (atom instanceof StringSymbol && atom.value === '+') {
                    // + as first atom gets gobbled
                    continue;
                } else if (atom instanceof StringSymbol && ['*', 'i*', '/', '^'].includes(atom.value)) {
                    throw new InvalidOperation(`${atom} is invalid as the first operation. `);
                }
            }

            // Sanitize last atom
            if (nextAtom === undefined) {
                if (atom instanceof StringSymbol && ['+', '-', '*', 'i*', '/', '^'].includes(atom.value)) {
                    throw new InvalidOperation(`${atom} is invalid as the last operation. `);
                }
            }

            // Check we haven't skipped a +
            /* istanbul ignore next */
            if (atom instanceof StringSymbol && lastAtom instanceof StringSymbol && atom.value === '+' && lastAtom.value === '+') {
                throw new UnexpectedError(`${lastAtom}${atom} should have been removed. `);
                // Cancel the last + if we still have one
                processedAtoms.pop();
                lastAtom = processedAtoms.at(-1);
            }

            // Keep i* StringSymbol (i.e. '2nm' or 'cm kL'). In all other cases, i* => *
            if (atom instanceof StringSymbol && atom.value === 'i*' && !(nextAtom instanceof StringSymbol)) {
                atom = new StringSymbol('*');
            }

            // Sanitize atom sequences
            if (atom instanceof StringSymbol && nextAtom instanceof StringSymbol && atom.value === '+' && nextAtom.value === '+') {
                // + + ==> +
                continue;
            } else if (
                (!(atom instanceof StringSymbol) || !operations.includes(atom.value)) &&
                nextAtom instanceof StringSymbol && nextAtom.value === '-'
            ) {
                // MathTree - ==> MathTree + -
                atoms.unshift(new StringSymbol('+'));
                processedAtoms.push(atom);
            } else if (
                atom instanceof StringSymbol && atom.value === '+' &&
                nextAtom instanceof StringSymbol && ['*', 'i*', '/', '^'].includes(nextAtom.value)
            ) {
                // + *, + i*, + /, + ^ ==> error
                throw new InvalidOperation(`${atom}${nextAtom} is an invalid sequence of operations. `);
            } else if (atom instanceof StringSymbol && atom.value === '-' && nextAtom instanceof StringSymbol && nextAtom.value === '+') {
                // - + ==> -
                atoms[0] = new StringSymbol('-');
            } else if (atom instanceof StringSymbol && atom.value === '-' && nextAtom instanceof StringSymbol && nextAtom.value === '-') {
                // - - ==> +
                atoms[0] = new StringSymbol('+');
                // Walk back one
                const walkback: MathTree | undefined = processedAtoms.pop();
                if (walkback !== undefined) {
                    atoms.unshift(walkback);
                }
            } else if (atom instanceof StringSymbol && atom.value === '-' && nextAtom instanceof StringSymbol && ['*', 'i*', '/', '^'].includes(nextAtom.value)) {
                // - *, - i*, - /, - ^ ==> error
                throw new InvalidOperation(`${atom}${nextAtom} is an invalid sequence of operations. `);
            } else if (atom instanceof StringSymbol && ['*', 'i*'].includes(atom.value) && nextAtom instanceof StringSymbol && nextAtom.value === '+') {
                // * +, i* + ==> *
                atoms[0] = new StringSymbol('*');
            } else if (atom instanceof StringSymbol && atom.value === '*' && nextAtom instanceof StringSymbol && ['*', 'i*', '/', '^'].includes(nextAtom.value)) {
                // * *, * i*, * /, * ^ ==> error
                throw new InvalidOperation(`${atom}${nextAtom} is an invalid sequence of operations. `);
            } else if (atom instanceof StringSymbol && atom.value === 'i*' && nextAtom instanceof StringSymbol && ['*', 'i*', '/', '^'].includes(nextAtom.value)) {
                // i* *, i* i*, i* /, i* ^ ==> error
                throw new InvalidOperation(`${atom}${nextAtom} is an invalid sequence of operations. `);
            } else if (atom instanceof StringSymbol && atom.value === '/' && nextAtom instanceof StringSymbol && nextAtom.value === '+') {
                // / + ==> /
                atoms[0] = new StringSymbol('/');
            } else if (atom instanceof StringSymbol && atom.value === '/' && nextAtom instanceof StringSymbol && ['*', 'i*', '/', '^'].includes(nextAtom.value)) {
                // / *, / i*, / /, / ^ ==> error
                throw new InvalidOperation(`${atom}${nextAtom} is an invalid sequence of operations. `);
            } else if (atom instanceof StringSymbol && atom.value === '^' && nextAtom instanceof StringSymbol && nextAtom.value === '+') {
                // ^ + ==> ^
                atoms[0] = new StringSymbol('^');
            } else if (atom instanceof StringSymbol && atom.value === '^' && nextAtom instanceof StringSymbol && ['*', 'i*', '/', '^'].includes(nextAtom.value)) {
                // ^ *, ^ i*, ^ /, ^ ^ ==> error
                throw new InvalidOperation(`${atom}${nextAtom} is an invalid sequence of operations. `);
            } else if (
                nextAtom !== undefined &&
                (!(atom instanceof StringSymbol) || !operations.includes(atom.value)) &&
                (!(nextAtom instanceof StringSymbol) || !operations.includes(nextAtom.value))
            ) {
                // MathTree MathTree ==> MathTree i* MathTree
                // TODO: If I ever want to implement functions, this needs to change.
                // Function = [Symbol MathTree] at this point, so here we destroy it.
                atoms.unshift(new StringSymbol('i*'));
                processedAtoms.push(atom);
            } else {
                // + -, * -, i* -, / -, ^ -, Operator MathTree, MathTree Operator ==> valid
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
            if (atom instanceof StringSymbol && atom.value === '^') {
                // atoms = [..., ^ ] or [ ^, ...] hould haved thrown an error already
                let nextAtom: MathTree = atoms.shift() as MathTree;
                // Handle sequence a ^ - b
                if (nextAtom instanceof StringSymbol && nextAtom.value === '-') {
                    nextAtom = new Oppose(atoms.shift() as MathTree);
                }
                const lastAtom: MathTree = processedAtoms.pop() as MathTree;
                processedAtoms.push(new Power(lastAtom, nextAtom));
            } else {
                processedAtoms.push(atom);
            }
        }
        atoms = processedAtoms;
        processedAtoms = [];

        // Implicit Multiply
        while (atoms.length > 0) {
            // Can't be undefined, as we checked the length
            const atom: MathTree = atoms.shift() as MathTree;
            if (atom instanceof StringSymbol && atom.value === 'i*') {
                // atoms = [..., i* ] or [ i*, ...] hould haved thrown an error already
                let nextAtom: MathTree = atoms.shift() as MathTree;
                // Handle sequence a i* - b (shouldn't happen)
                if (nextAtom instanceof StringSymbol && nextAtom.value === '-') {
                    nextAtom = new Oppose(atoms.shift() as MathTree);
                }
                const lastAtom: MathTree = processedAtoms.pop() as MathTree;
                if (lastAtom instanceof Multiply && nextAtom instanceof Multiply) {
                    processedAtoms.push(new Multiply(...lastAtom.factors, ...nextAtom.factors));
                } else if (lastAtom instanceof Multiply) {
                    processedAtoms.push(new Multiply(...lastAtom.factors, nextAtom));
                } else if (nextAtom instanceof Multiply) {
                    processedAtoms.push(new Multiply(lastAtom, ...nextAtom.factors));
                } else {
                    processedAtoms.push(new Multiply(lastAtom, nextAtom));
                }
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
            if (atom instanceof StringSymbol && atom.value === '/') {
                // atoms = [..., / ] or [ /, ...] hould haved thrown an error already
                let nextAtom: MathTree = atoms.shift() as MathTree;
                // Handle sequence a / - b
                if (nextAtom instanceof StringSymbol && nextAtom.value === '-') {
                    nextAtom = new Oppose(atoms.shift() as MathTree);
                }
                const lastAtom: MathTree = processedAtoms.pop() as MathTree;
                processedAtoms.push(new Divide(lastAtom, nextAtom));
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
            if (atom instanceof StringSymbol && atom.value === '*') {
                // atoms = [..., * ] or [ *, ...] hould haved thrown an error already
                let nextAtom: MathTree = atoms.shift() as MathTree;
                // Handle sequence a * - b
                if (nextAtom instanceof StringSymbol && nextAtom.value === '-') {
                    nextAtom = new Oppose(atoms.shift() as MathTree);
                }
                const lastAtom: MathTree = processedAtoms.pop() as MathTree;
                if (lastAtom instanceof Multiply && nextAtom instanceof Multiply) {
                    processedAtoms.push(new Multiply(...lastAtom.factors, ...nextAtom.factors));
                } else if (lastAtom instanceof Multiply) {
                    processedAtoms.push(new Multiply(...lastAtom.factors, nextAtom));
                } else if (nextAtom instanceof Multiply) {
                    processedAtoms.push(new Multiply(lastAtom, ...nextAtom.factors));
                } else {
                    processedAtoms.push(new Multiply(lastAtom, nextAtom));
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
            if (atom instanceof StringSymbol && atom.value === '-') {
                // atoms = [..., - ] should haved thrown an error already
                const nextAtom: MathTree = atoms.shift() as MathTree;
                processedAtoms.push(new Oppose(nextAtom));
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
            if (atom instanceof StringSymbol && atom.value === '+') {
                // atoms = [ +, ...] already dealt with [..., + ] should haved thrown an error already
                const nextAtom: MathTree = atoms.shift() as MathTree;
                const lastAtom: MathTree = processedAtoms.pop() as MathTree;
                if (lastAtom instanceof Add && nextAtom instanceof Add) {
                    processedAtoms.push(new Add(...lastAtom.terms, ...nextAtom.terms));
                } else if (lastAtom instanceof Add) {
                    processedAtoms.push(new Add(...lastAtom.terms, nextAtom));
                } else if (nextAtom instanceof Add) {
                    processedAtoms.push(new Add(lastAtom, ...nextAtom.terms));
                } else {
                    processedAtoms.push(new Add(lastAtom, nextAtom));
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
                return new Empty();
            case 1:
                return atoms[0];
            /* istanbul ignore next */
            default:
                throw new UnexpectedError(`Some unknown error happened while parsing operations. Final state : ${JSON.stringify(atoms)}`);
        }
    }
}