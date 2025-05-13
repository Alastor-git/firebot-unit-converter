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