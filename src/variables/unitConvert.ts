import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { OutputDataType, VariableCategory } from "@shared/variable-constants";
import { ParseMath } from "@/math-parser";
import { logger } from "@/shared/firebot-modules";
import { AbstractUnit } from "@/Unit/abstract-unit";
import { UnitConverterError, ValueError } from "@/errors";
import { Quantity } from "@/quantity";
import { Unit } from "@/Unit/unit";
import { UnitParser } from "@/unit-parser";
import { PrefixedUnit } from "@/Unit/prefixed-unit";

export const unitConvertVariable: ReplaceVariable = {
    definition: {
        handle: "unitConvert",
        usage: "unitConvert[expression, newUnit]",
        description: "Reduces a mathematical expression that containins units and converts it to a different equivalent unit. ",
        examples: [
            {
                usage: "unitConvert[2mm + 2m, mm]",
                description: `Returns 2002 mm`
            },
            {
                usage: "unitConvert[5kg / (3L + 20dL), kg/m^3]",
                description: `Returns 1000 kg*m^-3`
            }
        ],
        categories: [VariableCategory.COMMON, VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: function (trigger: Effects.Trigger, subject: string, target: string): string {
        try {
            const parsedSubject = ParseMath.match(subject).parseUnits().collapse();
            let parsedTarget = ParseMath.match(target).parseUnits().collapse();

            if (!(parsedTarget instanceof AbstractUnit)) {
                throw new ValueError('The target must be a valid unit. ');
            }
            if (parsedSubject === null) {
                throw new ValueError('Invalid expression to convert. ');
            }

            let filteredSubject: Quantity;
            if (typeof parsedSubject === 'number') {
                filteredSubject = new Quantity(parsedSubject, Unit.ONE);
            } else if (parsedSubject instanceof Quantity) {
                filteredSubject = parsedSubject;
            } else {
                filteredSubject = new Quantity(1, parsedSubject);
            }

            // We convert C to °C and F to °F if :
            // - Both are either C or F
            // - Once is C or F and the other one is a temperature unit
            if (
                   (['C', 'F'].includes(filteredSubject.unit.preferredUnitSymbol) || filteredSubject.unit.isSameDimension(UnitParser.registeredUnits['K']))
                && (['C', 'F'].includes(parsedTarget.preferredUnitSymbol) || parsedTarget.isSameDimension(UnitParser.registeredUnits['K']))
                ) {
                    let newSubjectUnit: Unit | null = null;
                    if (filteredSubject.unit.preferredUnitSymbol === 'C') {
                        newSubjectUnit = UnitParser.registeredUnits['°C'];
                    } else if (filteredSubject.unit.preferredUnitSymbol === 'F') {
                        newSubjectUnit = UnitParser.registeredUnits['°F'];
                    }
                    let newTargetUnit: Unit | null = null;
                    if (parsedTarget.preferredUnitSymbol === 'C') {
                        newTargetUnit = UnitParser.registeredUnits['°C'];
                    } else if (parsedTarget.preferredUnitSymbol === 'F') {
                        newTargetUnit = UnitParser.registeredUnits['°F'];
                    }

                    if (newSubjectUnit !== null && filteredSubject.unit instanceof Unit) {
                        filteredSubject.unit = newSubjectUnit;
                    } else if (newSubjectUnit !== null && filteredSubject.unit instanceof PrefixedUnit) {
                        filteredSubject.unit = new PrefixedUnit(filteredSubject.unit.prefix, newSubjectUnit);
                    }
                    if (newTargetUnit !== null && parsedTarget instanceof Unit) {
                        parsedTarget = newTargetUnit;
                    } else if (newTargetUnit !== null && parsedTarget instanceof PrefixedUnit) {
                        parsedTarget = new PrefixedUnit(parsedTarget.prefix, newTargetUnit);
                    }
                }
            const result: Quantity = filteredSubject.convert(parsedTarget);
            return `${result.toString()}`;
        } catch (err) {
            if (err instanceof UnitConverterError) {
                logger.debug(err.message);
                return err.originalMessage;
            } else if (err instanceof Error) {
                logger.debug(err.message);
                return err.message;
            }
            logger.debug(err);
            return '';
        }
    }
};
