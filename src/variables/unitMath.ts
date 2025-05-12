import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { OutputDataType, VariableCategory } from "@shared/variable-constants";
import { ParseMath } from "@/math-parser";
import { logger } from "@/shared/firebot-modules";

export const unitMathVariable: ReplaceVariable = {
    definition: {
        handle: "unitMath",
        usage: "unitMath[expression]",
        description: "Reduces a mathematical expression that containins units to its simplest form.",
        examples: [
            {
                usage: "unitMath[2mm + 2m]",
                description: `Returns 2.002 m`
            },
            {
                usage: "unitMath[5kg / (3L + 20dL)]",
                description: `Returns 1 kg/L`
            }
        ],
        categories: [VariableCategory.COMMON, VariableCategory.NUMBERS],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: function (trigger: Effects.Trigger, subject: string): string {
        try {
            return ParseMath.match(subject).parseUnits().collapse()?.toString() ?? '';
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
