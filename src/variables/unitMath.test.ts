import "@/mocks/firebot-modules";
import { logger } from "@/shared/firebot-modules";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { UnitParser } from "@/unit-parser";
import { PREFIXES, UNITS } from "@/shared/data";
import { unitMathVariable } from "./unitMath";

// Register units
logger.info("Loading units");
UNITS.forEach((unit) => {
    UnitParser.registerUnit(unit);
});

// Register prefixes
logger.info("Loading prefixes");
PREFIXES.forEach((prefix) => {
    UnitParser.registerPrefix(prefix);
});

test('Invalid inputs', () => {
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '')).toBe("Empty groups are forbidden. ");
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '25°C+6K/4()')).toBe("Empty groups are forbidden. ");

    expect(unitMathVariable.evaluator({} as Effects.Trigger, 'Nothing')).toBe("Unit not found in \"Nothing\". ");

    expect(unitMathVariable.evaluator({} as Effects.Trigger, '25°C+6K/(4')).toBe("Sequence ended while looking for a ) delimiter. ");
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '25°C+6K/4)')).toBe("Unexpected delimiter ) encountered. ");

    expect(unitMathVariable.evaluator({} as Effects.Trigger, '*25°C+6K/4')).toBe("* is invalid as the first token. ");
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '25°C+6K/4*')).toBe("* is invalid as the last token. ");
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '25°C+*6K/4')).toBe("+* is an invalid sequence of operations. ");

    expect(unitMathVariable.evaluator({} as Effects.Trigger, '25°C+6K/0')).toBe("Division by 0. ");
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '(-25°C)^0.6')).toBe("The result of power operation is undefined for value=-25 and power=0.6. ");
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '25°C^(6rad)')).toBe("The exponent of a power must be dimensionless. ");
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '°C+K')).toBe("Addition cannot be performed on a pure unit. ");
});

test('Rounding', () => {
    // No arg
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '334.1554 K')).toBe('334.155 K');
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '334.1556 K')).toBe('334.156 K');
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '100 K/3')).toBe('33.333 K');

    // Numeric arg
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '100 K/3', -2)).toBe('0 K');
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '100 K/3', -1)).toBe('30 K');
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '100 K/3', 0)).toBe('33 K');
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '100 K/3', 1)).toBe('33.3 K');
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '100 K/3', 2)).toBe('33.33 K');
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '100 K/3', 3)).toBe('33.333 K');
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '100 K/3', 3.3)).toBe('33.333 K');
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '100 K/3', 3.6)).toBe('33.333 K');
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '100 K/3', -1.5)).toBe('30 K');

    // Text Arg
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '100 K/3', '3.3')).toBe('33.333 K');
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '100 K/3', '-1.5')).toBe('30 K');

    // Invalid Arg
    expect(unitMathVariable.evaluator({} as Effects.Trigger, '100 K/3', 'John')).toBe('Invalid value "John" for the decimals argument');
});