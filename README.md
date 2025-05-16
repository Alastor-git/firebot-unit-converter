# Unit Converter

A [Firebot](https://firebot.app) custom script that defines utilities to manupulate units and convert between units.

## Summary

This script creates 2 replace variables for firebot dedicated to dealing with math involving units. 
- `$unitMath[5kg / (3L + 20dL)]` would recognize the units and prefixes, do the math, and return `1 kg*L^-1`.
- `$unitConvert[5kg / (3L + 20dL), kg/m^3]` would recognize the units and prefixes in both the original and target unit, do the math and conversion, returning `1000 kg*m^-3`.

The unit converter recognizes all SI and associated units, a number of imperial units, and a few binary units and prefixes.  
When converting between thermal units, it recognizes abreviated notations `C` instead of `°C` and `F` instead of `°F` in a number of cases. 

It can perform all basic calculations involving additions, soustractions, products, ratio and power. 

## Installation

To install the script: 
- Download the [latest release of `firebot-convert-unit.js`](). 
- In Firebot, access `File/Open Data Folder` to open your stream profile. 
- Paste `firebot-convert-unit.js` in the `scripts` folder. 
- In Firebot's `Settings/Scripts`
    - Set `Custom Scripts` to `Enabled`
    - Open `Manage Startup Scripts`, select `Add New Script` and select `firebot-convert-unit.js`

The replace variables should now be available in the `Numbers` section. 

## Units

The unit converter recognizes: 
- SI Units: `m`, `g`, `s`, `A`, `K`, `mol`, `cd`
- SI Derived Units: `Hz`, `N`, `Pa`, `J`, `W`, `C`, `V`, `Ω`, `S`, `F`, `T`, `Wb`, `H`, `°C`, `rad`, `sr`, `lm`, `lx`, `Bq`, `Gy`, `Sv`, `kat`, `L`
- SI Prefixes: `Q`, `R`, `Y`, `E`, `P`, `T`, `G`, `M`, `k`, `h`, `da`, `d`, `c`, `m`, `µ`, `n`, `p`, `f`, `a`, `z`, `y`, `r`, `q` 
- Imperial Units: `°F`, `th`, `in`, `hh`, `ft`, `yd`, `in`, `rd`, `ch`, `fur`, `mi`, `lea`, `ftm`, `cb`, `nmi`, `lb`, `oz`
    - SI Prefixes can't be used on Imperial units except for `°F`. 
- Miscalenious Units : `bar`, `h`, `min`
    - SI Prefixes can't be used on `h` or `min`
- Binary Units: `b`, `B`
    - SI prefixes can only be used on decimal units, use binary prefixes on binary units. 
- Binary Prefixes: `Qi`, `Ri`, `Yi`, `Ei`, `Pi`, `Ti`, `Gi`, `Mi`, `Ki`

`C` can replace `°C` and `F` replace `°F` for conversions in several cases : 
- If Both sides of the conversion are `C` or `F`
- If one side of the conversion is `C` or `F` and the other side is consitant with a thermal unit. 
- Note that `C` or `F` will never be understood as a thermal unit when part of a mathematical expression. 

## Math

Mathematical expressions are parsed using the following rules: 
- Delimited blocks are processed first. The following delimiters are understood: `()`, `{}`, `[]`
- Then the power elevation operator `^`
- Then the division operator `/`
- Then the product operators `*`, `.` and ` `
- Then the subtraction operatior `-`
- Then the addition operator `+`

A notable exception to the above rules is the implicit multiplication between a number and a unit, which is processed before division. 
So `5kg/3mm` will be understood the same as `5kg/(3mm)`. 

Numbers follow the same syntax as javascript numbers. The following type of numbers are recognized: `1`, `1.5`, `1.2e3`, `5E8`, `4e-5`. 

## Error messages 

The following error messages can be obtained as a result of erroneous inputs: 
- `The target must be a valid unit. `: This error is specific to `unitConvert`. It is obtained when the second argument is not a pure unit (e.g. `10 kg` is not a valid thing to convert into). 
- `°C doesn't match rad. `: This error is specific to `unitconvert`. It is obtained whenthe origin and target expressions do not have consistant units. 
- `Empty groups are forbidden. `: This error is obtained when attempting to process an empty chain as a mathematical expression. 
- `Unit not found in "NotAUnit". `: `NotAUnit` is not a valid unit. 
- `Sequence ended while looking for a ) delimiter. `: A delimiter was opened and never closed. 
- `Unexpected delimiter ) encountered. `: A delimiter was closed that had never been opened. 
- `Depth limit exceeded while parsing. `: A series of nested parenthesized blocks deeper than 20 levels has been passed.
- `* is invalid as the first token. `: The first character in the mathematical expression is an invalid operator. 
- `* is invalid as the last token. `: The last character of the mathematical expression is an invalid operator. 
- `+* is an invalid sequence of operations. `: An invalid sequence of operators was encountered. 
- `Division by 0. `: The denominator of a division ended up being 0. 
- `The result of power operation is undefined for value=-25 and power=0.6. `: The results of some fractional powers are ill defined or complex numbers, which are not supported by this script. 
- `The exponent of a power must be dimensionless. `: The exponent part of a power was not dimensionless (e.g. `5^(3mm)` is undefined).
- `Addition cannot be performed on a pure unit. `: Units can't be added together (e.g. `cm + mm` is undefined). 

