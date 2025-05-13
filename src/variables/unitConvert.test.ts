import "@/mocks/firebot-modules";
import { logger } from "@/shared/firebot-modules";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { unitConvertVariable } from "./unitConvert";
import { UnitParser } from "@/unit-parser";
import { PREFIXES, UNITS } from "@/shared/data";

test('convert C and F to °C and °F when relevant', () => {
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