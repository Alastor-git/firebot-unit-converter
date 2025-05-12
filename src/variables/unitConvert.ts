import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { OutputDataType, VariableCategory } from "@shared/variable-constants";
import { ParseMath } from "@/math-parser";
import { logger } from "@/shared/firebot-modules";
import { AbstractUnit } from "@/Unit/abstract-unit";
import { ValueError } from "@/errors";
import { Quantity } from "@/quantity";
import { Unit } from "@/Unit/unit";

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
                description: `Returns 1000 kg/m^3`
            }
        ],
        categories: [VariableCategory.COMMON, VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: function (trigger: Effects.Trigger, subject: string, target: string): string {
        try {
            const parsedSubject = ParseMath.match(subject).parseUnits().collapse();
            const parsedTarget = ParseMath.match(target).parseUnits().collapse();

            if (!(parsedTarget instanceof AbstractUnit)) {
                throw new ValueError('The target must be a valid unit.');
            }
            if (parsedSubject === null) {
                throw new ValueError('Invalid expression to convert.');
            }

            let filteredSubject: Quantity;
            if (typeof parsedSubject === 'number') {
                filteredSubject = new Quantity(parsedSubject, Unit.ONE);
            } else if (parsedSubject instanceof Quantity) {
                filteredSubject = parsedSubject;
            } else {
                filteredSubject = new Quantity(1, parsedSubject);
            }

            // FIXME: When convertinf from C to F or equivalent, read it as °C and °F
            const result: Quantity = filteredSubject.convert(parsedTarget);

            if (parsedSubject instanceof AbstractUnit) {
                return result.unit.toString();
            }
            return result.toString();
        } catch (err) {
            if (err instanceof Error) {
                logger.debug(err.message);
                return err.message;
            }
            logger.debug(err);
            return '';
        }
    }
};
