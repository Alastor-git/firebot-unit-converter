import { Prefix } from "@/Unit/prefix";
import { Unit } from "@/Unit/unit";

// ----------
//  Units
// ----------
export const UNITS = [
    // --------------
    // Basic SI units
    // --------------
    new Unit('m', 'meter', { L: 1 }),
    new Unit('g', 'gram', { M: 1 }, 10, 1e-3),
    new Unit('s', 'second', { T: 1 }),
    new Unit('A', 'ampere', { I: 1 }),
    new Unit('K', 'kelvin', { THETA: 1 }),
    new Unit('mol', 'mole', { N: 1 }),
    new Unit('cd', 'candela', { J: 1 }),
    // ----------------
    // Derived SI units
    // ----------------
    new Unit('Hz', 'hertz', { T: -1 }),
    new Unit('N', 'newton', { M: 1, L: 1, T: -2 }),
    new Unit('Pa', 'pascal', { M: 1, L: -1, T: -2 }),
    new Unit('J', 'joule', { M: 1, L: 2, T: -2 }),
    new Unit('W', 'watt', { M: 1, L: 2, T: -3 }),
    new Unit('C', 'coulomb', { T: 1, I: 1 }),
    new Unit('V', 'volt', { M: 1, L: 2, T: -3, I: -1 }),
    new Unit('Ω', 'ohm', { M: 1, L: 2, T: -3, I: -2 }),
    new Unit('S', 'siemens', { M: -1, L: -2, T: 3, I: 2 }),
    new Unit('F', 'farad', { M: -1, L: -2, T: 4, I: 2 }),
    new Unit('T', 'tesla', { M: 1, T: -2, I: -1 }),
    new Unit('Wb', 'weber', { M: 1, L: 2, T: -2, I: -1 }),
    new Unit('H', 'henry', { M: 1, L: 2, T: -2, I: -2 }),
    new Unit(['°C', '˚C'], 'celsius', { THETA: 1 }, 10, 1, 273.15),
    new Unit('rad', 'radian', { A: 1 }),
    new Unit('sr', 'steradian', { A: 2 }),
    new Unit('lm', 'lumen', { J: 1 }),
    new Unit('lx', 'lux', { L: -2, J: 1 }),
    new Unit('Bq', 'becquerel', { T: -1 }),
    new Unit('Gy', 'gray', { L: 2, T: -2 }),
    new Unit('Sv', 'sievert', { L: 2, T: -2 }),
    new Unit('kat', 'katal', { T: -1, N: 1 }),
    new Unit('L', 'Liter', { L: 3 }, 10, 1e-3),
    // -----------------
    // Imperial system
    // -----------------
    new Unit(['°F', '˚F'], 'fahrenheit', { THETA: 1 }, 10, 5 / 9, 273.15 - 32 * 5 / 9),

    new Unit('th', 'thou', { L: 1 }, 10, 2.54e-5),
    new Unit(['in', "''"], 'inch', { L: 1 }, 10, 2.54e-2),
    new Unit('hh', 'hand', { L: 1 }, 10, 0.1016),
    new Unit(['ft', "'"], 'foot', { L: 1 }, 10, 0.3048),
    new Unit('yd', 'yard', { L: 1 }, 10, 0.9144),
    new Unit('li', 'link', { L: 1 }, 10, 0.2011684),
    new Unit('rd', 'rod', { L: 1 }, 10, 5.029210),
    new Unit('ch', 'chain', { L: 1 }, 10, 20.1168),
    new Unit('fur', 'furlong', { L: 1 }, 10, 201.168),
    new Unit('mi', 'mile', { L: 1 }, 10, 1609.344),
    new Unit('lea', 'league', { L: 1 }, 10, 4828.032),
    new Unit('ftm', 'fathom', { L: 1 }, 10, 1.8288),
    new Unit('cb', 'cable', { L: 1 }, 10, 219.456),
    new Unit('nmi', 'nautic mile', { L: 1 }, 10, 1852),

    new Unit('lb', 'pound', { M: 1 }, 10, 0.45359237),
    new Unit('oz', 'ounce', { M: 1 }, 10, 0.00002835),
    // -------------------
    // Miscellaneous units
    // -------------------
    new Unit('bar', 'bar', { M: 1, L: -1, T: -2 }, 10, 1e5),

    new Unit('min', 'minute', { T: 1 }, 10, 60),
    new Unit('h', 'hour', { T: 1 }, 10, 3600),

    new Unit('b', 'bit', { D: 1 }, 2),
    new Unit('B', 'byte', { D: 1 }, 2, 8)
];

export const PREFIXES = [
    // -----------------
    // Decimal Prefixes
    // -----------------
    new Prefix('Q', 'quetta', 10, 30),
    new Prefix('R', 'ronna', 10, 27),
    new Prefix('Y', 'yotta', 10, 24),
    new Prefix('Z', 'zetta', 10, 21),
    new Prefix('E', 'exa', 10, 18),
    new Prefix('P', 'peta', 10, 15),
    new Prefix('T', 'tera', 10, 12),
    new Prefix('G', 'giga', 10, 9),
    new Prefix('M', 'mega', 10, 6),
    new Prefix('k', 'kilo', 10, 3),
    new Prefix('h', 'hecto', 10, 2),
    new Prefix('da', 'deca', 10, 1),
    new Prefix('d', 'deci', 10, -1),
    new Prefix('c', 'centi', 10, -2),
    new Prefix('m', 'mili', 10, -3),
    new Prefix('µ', 'micro', 10, -6),
    new Prefix('n', 'nano', 10, -9),
    new Prefix('p', 'pico', 10, -12),
    new Prefix('f', 'femto', 10, -15),
    new Prefix('a', 'atto', 10, -18),
    new Prefix('z', 'zepto', 10, -21),
    new Prefix('y', 'yocto', 10, -24),
    new Prefix('r', 'ronto', 10, -27),
    new Prefix('q', 'quecto', 10, -30),
    // ----------------
    // Binary Prefixes
    // ----------------
    new Prefix('Qi', 'quebi', 2, 100),
    new Prefix('Ri', 'robi', 2, 90),
    new Prefix('Yi', 'yobi', 2, 80),
    new Prefix('Zi', 'zebi', 2, 70),
    new Prefix('Ei', 'exbi', 2, 60),
    new Prefix('Pi', 'pebi', 2, 50),
    new Prefix('Ti', 'tebi', 2, 40),
    new Prefix('Gi', 'gibi', 2, 30),
    new Prefix('Mi', 'mebi', 2, 20),
    new Prefix('Ki', 'kibi', 2, 10)
];