import "@/mocks/firebot-modules";
import { logger } from "@/shared/firebot-modules";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { unitConvertVariable } from "./unitConvert";
import { UnitParser } from "@/unit-parser";
import { PREFIXES, UNITS } from "@/shared/data";

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


test('convert C and F to °C and °F when relevant', () => {
    // Simple units
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 C', 'F')).toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 °C', '°F'));
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 C', 'K')).toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 °C', 'K'));
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 F', 'C')).toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 °F', '°C'));
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 F', 'K')).toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 °F', 'K'));
    // Prefixed units
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 cC', 'mF')).toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 c°C', 'm°F'));
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 kC', 'µK')).toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 k°C', 'µK'));
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 kF', 'dC')).toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 k°F', 'd°C'));
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 µF', 'kK')).toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 µ°F', 'kK'));
    // Compound units
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 C*kg/g', 'F*g')).not.toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 °C*kg/g', '°F*g'));
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 C', 'K*kg/g')).toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 °C', 'K*kg/g'));
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 C*kg/g', 'K')).not.toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 °C*kg/g', 'K'));
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 F', 'K*kg/g')).toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 °F', 'K*kg/g'));
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 F*kg/g', 'K')).not.toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 °F*kg/g', 'K'));
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 K', 'C*kg/g')).not.toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 K', '°C*kg/g'));
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 K*kg/g', 'C')).toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 K*kg/g', '°C'));
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 K', 'F*kg/g')).not.toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 K', '°F*kg/g'));
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 K*kg/g', 'F')).toBe(unitConvertVariable.evaluator({} as Effects.Trigger, '10 K*kg/g', '°F'));
});

test('Invalid inputs', () => {
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 K', '10 °F')).toBe("The target must be a valid unit. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 K', '10')).toBe("The target must be a valid unit. ");

    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10 K', '')).toBe("Empty groups are forbidden. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '', '°F')).toBe("Empty groups are forbidden. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '25°C+6K/4()', '°C')).toBe("Empty groups are forbidden. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '25°C+6K/4', '°C()')).toBe("Empty groups are forbidden. ");

    expect(unitConvertVariable.evaluator({} as Effects.Trigger, 'Nothing', '°F')).toBe("Unit not found in \"Nothing\". ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '°C', 'Nothing')).toBe("Unit not found in \"Nothing\". ");

    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '10', '°F')).toBe(" doesn't match °F. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '5 °C', 'rad')).toBe("°C doesn't match rad. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '°C', 'rad')).toBe("°C doesn't match rad. ");

    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '25°C+6K/(4', '°C')).toBe("Sequence ended while looking for a ) delimiter. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '25°C', '(°C*K/°F')).toBe("Sequence ended while looking for a ) delimiter. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '25°C+6K/4)', '°C')).toBe("Unexpected delimiter ) encountered. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '25°C+6K/4', '°C)')).toBe("Unexpected delimiter ) encountered. ");

    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '*25°C+6K/4', '°C')).toBe("* is invalid as the first token. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '25°C+6K/4', '*°C')).toBe("* is invalid as the first token. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '25°C+6K/4*', '°C')).toBe("* is invalid as the last token. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '25°C+6K/4', '°C*')).toBe("* is invalid as the last token. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '25°C+*6K/4', '°C')).toBe("+* is an invalid sequence of operations. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '25°C*6K/4', '°C*/°F')).toBe("*/ is an invalid sequence of operations. ");

    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '25°C+6K/0', '°C')).toBe("Division by 0. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '(-25°C)^0.6', '°C')).toBe("The result of power operation is undefined for value=-25 and power=0.6. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '25°C^(6rad)', '°C')).toBe("The exponent of a power must be dimensionless. ");
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '25°C', '°C+K')).toBe("Addition cannot be performed on a pure unit. ");
});

test('Rounding', () => {
    // No arg
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '15.0004 °C', 'K')).toBe('288.15 K');
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '15.0006 °C', 'K')).toBe('288.151 K');
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '100 K/3', 'K')).toBe('33.333 K');

    // Numeric arg
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '100 K/3', 'K', -2)).toBe('0 K');
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '100 K/3', 'K', -1)).toBe('30 K');
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '100 K/3', 'K', 0)).toBe('33 K');
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '100 K/3', 'K', 1)).toBe('33.3 K');
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '100 K/3', 'K', 2)).toBe('33.33 K');
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '100 K/3', 'K', 3)).toBe('33.333 K');
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '100 K/3', 'K', 3.3)).toBe('33.333 K');
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '100 K/3', 'K', 3.6)).toBe('33.333 K');
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '100 K/3', 'K', -1.5)).toBe('30 K');

    // Text Arg
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '100 K/3', 'K', '3.3')).toBe('33.333 K');
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '100 K/3', 'K', '-1.5')).toBe('30 K');

    // Invalid Arg
    expect(unitConvertVariable.evaluator({} as Effects.Trigger, '100 K/3', '°C', 'John')).toBe('Invalid value "John" for the decimals argument');
});