import { Unit } from "@/unit";

// ----------
//  Units
// ----------
export const UNITS = [
    // --------------
    // Basic SI units
    // --------------
    new Unit('m', 'meter', { L: 1 }),
    new Unit('g', 'gram', { M: 1 }, 1e-3),
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
    new Unit('°C', 'celsius', { THETA: 1 }, 1, 273.15),
    new Unit('rad', 'radian'),
    new Unit('sr', 'steradian'),
    new Unit('lm', 'lumen', { J: 1 }),
    new Unit('lx', 'lux', { L: -2, J: 1 }),
    new Unit('Bq', 'becquerel', { T: -1 }),
    new Unit('Gy', 'gray', { L: 2, T: -2 }),
    new Unit('Sv', 'sievert', { L: 2, T: -2 }),
    new Unit('kat', 'katal', { T: -1, N: 1 }),
    // -----------------
    // Imperial system
    // -----------------
    new Unit('°F', 'fahrenheit', { THETA: 1 }, 5 / 9, 273.15 - 32 * 5 / 9),
    new Unit('th', 'thou', { L: 1 }, 2.54e-5),
    new Unit(['in', "''"], 'inch', { L: 1 }, 2.54e-2),
    new Unit('hh', 'hand', { L: 1 }, 0.1016),
    new Unit(['ft', "'"], 'foot', { L: 1 }, 0.3048),
    new Unit('yd', 'yard', { L: 1 }, 0.9144),
    new Unit('ch', 'chain', { L: 1 }, 20.1168),
    new Unit('fur', 'furlong', { L: 1 }, 201.168),
    new Unit('mi', 'mile', { L: 1 }, 1609.344),
    new Unit('lea', 'league', { L: 1 }, 4828.032),
    new Unit('ftm', 'fathom', { L: 1 }, 1.8288),
    new Unit('nmi', 'nautic mile', { L: 1 }, 1852),
    new Unit('lb', 'pound', { M: 1 }, 0.45359237),
    // -------------------
    // Miscellaneous units
    // -------------------
    new Unit('bar', 'bar', { M: 1, L: -1, T: -2 }, 1e5),
    new Unit('min', 'minute', { T: 1 }, 60),
    new Unit('h', 'hour', { T: 1 }, 3600)
];