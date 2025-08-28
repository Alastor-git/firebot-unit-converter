import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { OutputDataType, VariableCategory } from "@shared/variable-constants";
import { ParseMath } from "@/math-parser";
import { logger } from "@/shared/firebot-modules";
import { UnitConverterError, ValueError } from "@/errors";
import { AbstractUnit } from "@/Unit/abstract-unit";
import { Quantity } from "@/quantity";

export const unitMathVariable: ReplaceVariable = {
    definition: {
        handle: "unitMath",
        usage: "unitMath[expression, decimals?]",
        description: "Reduces a mathematical expression that containins units to its simplest form. Rounds to 3 decimals by default. ",
        examples: [
            {
                usage: "unitMath[5kg / (3L + 20dL)]",
                description: `Returns 1 kg*L^-1`
            },
            {
                usage: "unitMath[2mm + 2m]",
                description: `Returns 2.002 m. `
            },
            {
                usage: "unitMath[2mm + 2m, 2]",
                description: `Returns 2 m, which is 2.002 m rounded to 2 decimals. `
            },
            {
                usage: "unitMath[100K/3, 1]",
                description: `Returns 33.3 K, rounding the value to 1 decimal. `
            }
        ],
        categories: [VariableCategory.COMMON, VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: function (trigger: Effects.Trigger, subject: string, decimals: number = 3): string {
        try {
            const parsedDecimals = Math.trunc(Number(decimals));
            if (isNaN(parsedDecimals)) {
                throw new ValueError(`Invalid value "${decimals}" for the decimals argument`);
            }
            const result: number | AbstractUnit | Quantity | null = ParseMath.match(subject).parseUnits().collapse();
            if (result === null) {
                return '';
            } else if (typeof result === 'number') {
                return (Math.round(result * 10 ** parsedDecimals) / 10 ** parsedDecimals).toString();
            }
            return result.toString(parsedDecimals);
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
