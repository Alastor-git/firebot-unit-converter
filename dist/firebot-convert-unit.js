/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 260:
/***/ ((module) => {



/**
 * RegexEscape
 * Escapes a string for using it in a regular expression.
 *
 * @name RegexEscape
 * @function
 * @param {String} input The string that must be escaped.
 * @return {String} The escaped string.
 */
function RegexEscape(input) {
  return input.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

/**
 * proto
 * Adds the `RegexEscape` function to `RegExp` class.
 *
 * @name proto
 * @function
 * @return {Function} The `RegexEscape` function.
 */
RegexEscape.proto = function () {
  RegExp.escape = RegexEscape;
  return RegexEscape;
};

module.exports = RegexEscape;

/***/ }),

/***/ 248:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MathTree = void 0;
class MathTree {
    toString() {
        return JSON.stringify(this);
    }
}
exports.MathTree = MathTree;


/***/ }),

/***/ 184:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Add = void 0;
const abstract_mathtree_1 = __webpack_require__(248);
const quantity_1 = __webpack_require__(759);
const errors_1 = __webpack_require__(725);
const abstract_unit_1 = __webpack_require__(176);
class Add extends abstract_mathtree_1.MathTree {
    terms;
    constructor(...terms) {
        super();
        this.terms = terms;
    }
    parseUnits() {
        return new Add(...this.terms.map((term) => term.parseUnits()));
    }
    collapse() {
        return this.terms.reduce((total, current) => Add.collapsePair(total, current), null);
    }
    static collapsePair(totalValue, newTerm) {
        const newTermValue = newTerm.collapse();
        if (newTermValue === null) {
            throw new errors_1.ValueError(`Cannot add an empty group. `);
        }
        else if (totalValue instanceof abstract_unit_1.AbstractUnit || newTermValue instanceof abstract_unit_1.AbstractUnit) {
            throw new errors_1.InvalidOperationError(`Addition cannot be performed on a pure unit. `);
        }
        else if (totalValue === null) {
            return newTermValue;
        }
        else if (totalValue instanceof quantity_1.Quantity) {
            return totalValue.add(newTermValue);
        }
        else if (newTermValue instanceof quantity_1.Quantity) {
            return newTermValue.add(totalValue);
        }
        else { // typeof totalValue === 'number' && typeof newTermValue === 'number'
            return totalValue + newTermValue;
        }
    }
}
exports.Add = Add;


/***/ }),

/***/ 825:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Divide = void 0;
const errors_1 = __webpack_require__(725);
const abstract_mathtree_1 = __webpack_require__(248);
const unit_1 = __webpack_require__(281);
const quantity_1 = __webpack_require__(759);
const abstract_unit_1 = __webpack_require__(176);
class Divide extends abstract_mathtree_1.MathTree {
    numerator;
    denominator;
    constructor(numerator, denominator) {
        super();
        this.numerator = numerator;
        this.denominator = denominator;
    }
    parseUnits() {
        return new Divide(this.numerator.parseUnits(), this.denominator.parseUnits());
    }
    collapse() {
        const numeratorValue = this.numerator.collapse();
        const denominatorValue = this.denominator.collapse();
        if (numeratorValue === null || denominatorValue === null) {
            throw new errors_1.ValueError(`Cannot perform division on empty groups. `);
        }
        else if (typeof numeratorValue === 'number' && typeof denominatorValue === 'number') {
            return numeratorValue / denominatorValue;
        }
        else if (numeratorValue instanceof quantity_1.Quantity) {
            return numeratorValue.divide(denominatorValue);
        }
        else if (denominatorValue instanceof quantity_1.Quantity) {
            return quantity_1.Quantity.ONE.divide(denominatorValue).multiply(numeratorValue);
        }
        else if (numeratorValue instanceof abstract_unit_1.AbstractUnit) {
            return numeratorValue.divide(denominatorValue);
        }
        else { // denominatorValue instanceof Unit
            return unit_1.Unit.ONE.divide(denominatorValue).multiply(numeratorValue);
        }
    }
}
exports.Divide = Divide;


/***/ }),

/***/ 534:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Empty = void 0;
const errors_1 = __webpack_require__(725);
const abstract_mathtree_1 = __webpack_require__(248);
class Empty extends abstract_mathtree_1.MathTree {
    constructor() {
        super();
    }
    parseUnits() {
        return this;
    }
    collapse() {
        throw new errors_1.ValueError(`Empty group cannot be turned into a value. `);
    }
}
exports.Empty = Empty;


/***/ }),

/***/ 815:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Power = exports.Divide = exports.Multiply = exports.Oppose = exports.Add = exports.UnitSymbol = exports.StringSymbol = exports.Numeric = exports.Empty = exports.MathTree = void 0;
const abstract_mathtree_1 = __webpack_require__(248);
Object.defineProperty(exports, "MathTree", ({ enumerable: true, get: function () { return abstract_mathtree_1.MathTree; } }));
const empty_1 = __webpack_require__(534);
Object.defineProperty(exports, "Empty", ({ enumerable: true, get: function () { return empty_1.Empty; } }));
const numeric_1 = __webpack_require__(716);
Object.defineProperty(exports, "Numeric", ({ enumerable: true, get: function () { return numeric_1.Numeric; } }));
const string_1 = __webpack_require__(722);
Object.defineProperty(exports, "StringSymbol", ({ enumerable: true, get: function () { return string_1.StringSymbol; } }));
const unit_1 = __webpack_require__(869);
Object.defineProperty(exports, "UnitSymbol", ({ enumerable: true, get: function () { return unit_1.UnitSymbol; } }));
const add_1 = __webpack_require__(184);
Object.defineProperty(exports, "Add", ({ enumerable: true, get: function () { return add_1.Add; } }));
const oppose_1 = __webpack_require__(253);
Object.defineProperty(exports, "Oppose", ({ enumerable: true, get: function () { return oppose_1.Oppose; } }));
const multiply_1 = __webpack_require__(387);
Object.defineProperty(exports, "Multiply", ({ enumerable: true, get: function () { return multiply_1.Multiply; } }));
const divide_1 = __webpack_require__(825);
Object.defineProperty(exports, "Divide", ({ enumerable: true, get: function () { return divide_1.Divide; } }));
const power_1 = __webpack_require__(58);
Object.defineProperty(exports, "Power", ({ enumerable: true, get: function () { return power_1.Power; } }));
exports["default"] = {
    MathTree: abstract_mathtree_1.MathTree,
    Empty: empty_1.Empty,
    Numeric: numeric_1.Numeric,
    StringSymbol: string_1.StringSymbol,
    UnitSymbol: unit_1.UnitSymbol,
    Add: add_1.Add,
    Oppose: oppose_1.Oppose,
    Multiply: multiply_1.Multiply,
    Divide: divide_1.Divide,
    Power: power_1.Power
};


/***/ }),

/***/ 387:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Multiply = void 0;
const abstract_mathtree_1 = __webpack_require__(248);
const quantity_1 = __webpack_require__(759);
const errors_1 = __webpack_require__(725);
const abstract_unit_1 = __webpack_require__(176);
class Multiply extends abstract_mathtree_1.MathTree {
    factors;
    constructor(...factors) {
        super();
        this.factors = factors;
    }
    parseUnits() {
        return new Multiply(...this.factors.map((term) => term.parseUnits()));
    }
    collapse() {
        return this.factors.reduce((total, current) => Multiply.collapsePair(total, current), null);
    }
    static collapsePair(totalValue, newFactor) {
        const newFactorValue = newFactor.collapse();
        if (newFactorValue === null) {
            throw new errors_1.ValueError(`Cannot multiply an empty group. `);
        }
        else if (totalValue === null) {
            return newFactorValue;
        }
        else if (totalValue instanceof quantity_1.Quantity) {
            return totalValue.multiply(newFactorValue);
        }
        else if (newFactorValue instanceof quantity_1.Quantity) {
            return newFactorValue.multiply(totalValue);
        }
        else if (totalValue instanceof abstract_unit_1.AbstractUnit) {
            return totalValue.multiply(newFactorValue);
        }
        else if (newFactorValue instanceof abstract_unit_1.AbstractUnit) {
            return newFactorValue.multiply(totalValue);
        }
        else { // typeof totalValue === 'number' && typeof newFactorValue === 'number'
            return totalValue * newFactorValue;
        }
    }
}
exports.Multiply = Multiply;


/***/ }),

/***/ 716:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Numeric = void 0;
const abstract_mathtree_1 = __webpack_require__(248);
class Numeric extends abstract_mathtree_1.MathTree {
    value;
    constructor(value) {
        super();
        this.value = value;
    }
    parseUnits() {
        return this;
    }
    collapse() {
        return this.value;
    }
}
exports.Numeric = Numeric;


/***/ }),

/***/ 253:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Oppose = void 0;
const errors_1 = __webpack_require__(725);
const abstract_mathtree_1 = __webpack_require__(248);
const abstract_unit_1 = __webpack_require__(176);
class Oppose extends abstract_mathtree_1.MathTree {
    element;
    constructor(element) {
        super();
        this.element = element;
    }
    parseUnits() {
        return new Oppose(this.element.parseUnits());
    }
    collapse() {
        const elementValue = this.element.collapse();
        if (elementValue === null) {
            throw new errors_1.ValueError(`Cannot oppose an empty group. `);
        }
        else if (elementValue instanceof abstract_unit_1.AbstractUnit) {
            throw new errors_1.InvalidOperationError(`Opposition cannot be performed on pure units. `);
        }
        else if (typeof elementValue === 'number') {
            return -elementValue;
        }
        else { // elementValue instanceof Quantity
            return elementValue.oppose();
        }
    }
}
exports.Oppose = Oppose;


/***/ }),

/***/ 58:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Power = void 0;
const errors_1 = __webpack_require__(725);
const abstract_mathtree_1 = __webpack_require__(248);
const unit_1 = __webpack_require__(281);
const quantity_1 = __webpack_require__(759);
const abstract_unit_1 = __webpack_require__(176);
class Power extends abstract_mathtree_1.MathTree {
    base;
    exponent;
    constructor(base, exponent) {
        super();
        this.base = base;
        this.exponent = exponent;
    }
    parseUnits() {
        return new Power(this.base.parseUnits(), this.exponent.parseUnits());
    }
    collapse() {
        const baseValue = this.base.collapse();
        let exponentValue = this.exponent.collapse();
        if (baseValue === null || exponentValue === null) {
            throw new errors_1.ValueError(`Cannot elevate to a power with empty groups. `);
        }
        else if (exponentValue instanceof abstract_unit_1.AbstractUnit) {
            throw new errors_1.InvalidOperationError(`The exponent of a power must be dimensionless. `);
        }
        if (exponentValue instanceof quantity_1.Quantity) {
            if (exponentValue.unit.isDimensionless()) {
                exponentValue = exponentValue.convert(unit_1.Unit.ONE).value;
            }
            else {
                throw new errors_1.InvalidOperationError(`The exponent of a power must be dimensionless. `);
            }
        }
        if (typeof baseValue === 'number') {
            return baseValue ** exponentValue;
        }
        // baseValue instanceof Unit || baseValue instanceof Quantity
        return baseValue.power(exponentValue);
    }
}
exports.Power = Power;


/***/ }),

/***/ 722:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StringSymbol = void 0;
const errors_1 = __webpack_require__(725);
const abstract_mathtree_1 = __webpack_require__(248);
const unit_parser_1 = __webpack_require__(806);
const unit_1 = __webpack_require__(869);
class StringSymbol extends abstract_mathtree_1.MathTree {
    value;
    constructor(value) {
        super();
        this.value = value;
    }
    parseUnits() {
        return new unit_1.UnitSymbol(unit_parser_1.UnitParser.parseUnit(this.value));
    }
    collapse() {
        throw new errors_1.ValueError(`String literal ${this.value} is not able to be parsed to a value. `);
    }
}
exports.StringSymbol = StringSymbol;


/***/ }),

/***/ 869:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UnitSymbol = void 0;
const abstract_mathtree_1 = __webpack_require__(248);
class UnitSymbol extends abstract_mathtree_1.MathTree {
    value;
    constructor(value) {
        super();
        this.value = value;
    }
    parseUnits() {
        return this;
    }
    collapse() {
        return this.value;
    }
}
exports.UnitSymbol = UnitSymbol;


/***/ }),

/***/ 338:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AbstractBasedUnit = void 0;
const abstract_unit_1 = __webpack_require__(176);
class AbstractBasedUnit extends abstract_unit_1.AbstractUnit {
    _base;
    set base(value) {
        this._base = value;
    }
    get base() {
        return this._base;
    }
    isDeltaEqual(otherUnit) {
        if (otherUnit instanceof AbstractBasedUnit) {
            return super.isDeltaEqual(otherUnit) && otherUnit.base === this.base;
        }
        return super.isDeltaEqual(otherUnit);
    }
    isEqual(otherUnit) {
        if (otherUnit instanceof AbstractBasedUnit) {
            return super.isEqual(otherUnit) && otherUnit.base === this.base;
        }
        return super.isEqual(otherUnit);
    }
}
exports.AbstractBasedUnit = AbstractBasedUnit;


/***/ }),

/***/ 176:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AbstractUnit = void 0;
const errors_1 = __webpack_require__(725);
class AbstractUnit {
    symbols;
    name;
    _preferredUnitSymbol = null;
    coeff;
    offset;
    // Dimensional quantities
    // -----------------------
    dimensions;
    set preferredUnitSymbol(unitSymbol) {
        if (!this.symbols.includes(unitSymbol)) {
            throw new errors_1.ValueError(`Unit symbol ${unitSymbol} didn't match any existing symbol in the unit's list ${JSON.stringify(this.symbols)}. `);
        }
        this._preferredUnitSymbol = unitSymbol;
    }
    get preferredUnitSymbol() {
        if (this._preferredUnitSymbol === null) {
            throw new errors_1.ValueError(`Unit preferred symbol has not been defined. `);
        }
        return this._preferredUnitSymbol;
    }
    get preferredSymbol() {
        return this.preferredUnitSymbol;
    }
    isSameDimension(otherUnit) {
        return (this.dimensions.L === otherUnit.dimensions.L &&
            this.dimensions.M === otherUnit.dimensions.M &&
            this.dimensions.T === otherUnit.dimensions.T &&
            this.dimensions.I === otherUnit.dimensions.I &&
            this.dimensions.THETA === otherUnit.dimensions.THETA &&
            this.dimensions.N === otherUnit.dimensions.N &&
            this.dimensions.J === otherUnit.dimensions.J &&
            this.dimensions.D === otherUnit.dimensions.D &&
            this.dimensions.A === otherUnit.dimensions.A);
    }
    isDeltaEqual(otherUnit) {
        return (this.isSameDimension(otherUnit) &&
            this.coeff === otherUnit.coeff);
    }
    isEqual(otherUnit) {
        return (this.isSameDimension(otherUnit) &&
            this.coeff === otherUnit.coeff &&
            this.offset === otherUnit.offset);
    }
    isAffine() {
        return this.offset !== 0;
    }
    isLinear() {
        return this.offset === 0;
    }
    isDimensionless() {
        return this.dimensions.I === 0 &&
            this.dimensions.J === 0 &&
            this.dimensions.L === 0 &&
            this.dimensions.M === 0 &&
            this.dimensions.N === 0 &&
            this.dimensions.T === 0 &&
            this.dimensions.THETA === 0 &&
            this.dimensions.D === 0 &&
            this.dimensions.A === 0;
    }
    toString() {
        try {
            return this.preferredSymbol;
        }
        catch {
            return JSON.stringify(this);
        }
    }
}
exports.AbstractUnit = AbstractUnit;


/***/ }),

/***/ 429:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompoundUnit = void 0;
const errors_1 = __webpack_require__(725);
const prefixed_unit_1 = __webpack_require__(893);
const unit_1 = __webpack_require__(281);
const abstract_unit_1 = __webpack_require__(176);
const quantity_1 = __webpack_require__(759);
const unit_parser_1 = __webpack_require__(806);
const firebot_modules_1 = __webpack_require__(93);
class CompoundUnit extends abstract_unit_1.AbstractUnit {
    components = {};
    constructor(unit, unitExponent = 1) {
        super();
        this.addFactor(unit, unitExponent);
    }
    copy() {
        const newUnit = new CompoundUnit(null);
        Object.values(this.components).forEach((component) => {
            newUnit.addComponent({ ...component });
        });
        return newUnit;
    }
    addFactor(unit, exponent = 1) {
        let component;
        // If exponent is 0, we aren't changing anything
        if (exponent === 0 || unit === null) {
            this.updateUnit();
            return this;
        }
        if (unit instanceof prefixed_unit_1.PrefixedUnit) {
            component = {
                unit: unit.baseUnit,
                unitExponent: 1,
                prefix: unit.prefix,
                prefixBase: unit.base,
                prefixExponent: unit.prefix.exponent
            };
        }
        else { // (unit instanceof Unit)
            component = {
                unit: unit,
                unitExponent: 1,
                prefixBase: unit.base,
                prefixExponent: 0
            };
        }
        return this.addComponent(component, exponent);
    }
    addComponent(component, exponent = 1) {
        let unitSymbol;
        let baseUnit = component.unit;
        const unitExponent = component.unitExponent * exponent;
        //const prefix: Prefix | undefined = component.prefix ?? undefined;
        const prefixBase = component.prefixBase;
        const prefixExponent = component.prefixExponent * exponent;
        const componentsKeys = Object.keys(this.components);
        const matchingSymbols = componentsKeys.filter(componentSymbol => baseUnit.symbols.includes(componentSymbol));
        // If there was a single components, we switch the existing component to a delta unit.
        if (componentsKeys.length === 1) {
            this.components[componentsKeys[0]].unit = this.components[componentsKeys[0]].unit.deltaUnit();
        }
        // If this isn't the first component or it is to a power, the unit we add must be a delta unit
        if (componentsKeys.length > 0 || unitExponent !== 1) {
            baseUnit = baseUnit.deltaUnit();
        }
        // If the unit is already part of the compound, add to the component, otherwise add the unit.
        if (matchingSymbols.length > 1) {
            throw new errors_1.UnitError(`Several components match with unit ${component}. `);
        }
        else if (matchingSymbols.length === 1) {
            unitSymbol = matchingSymbols[0];
            if (!this.components[unitSymbol].unit.isDeltaEqual(baseUnit)) {
                throw new errors_1.UnitError(`Symbols match for ${unitSymbol} but units do not match. `);
            }
            if (this.components[unitSymbol].prefixBase !== 1 && prefixBase !== 1 && this.components[unitSymbol].prefixBase !== prefixBase) {
                throw new errors_1.PrefixError(`Prefixes for unit ${unitSymbol} don't have the same base. `);
            }
            if (prefixBase !== 1) {
                this.components[unitSymbol].prefixBase = prefixBase;
            }
            this.components[unitSymbol].unitExponent += unitExponent;
            this.components[unitSymbol].prefixExponent += prefixExponent;
            // We keep the unit registered as part of the component if the exponent cancels out.
            // Allows to keep prefixCoeff and possibly reapply it to future factors using the same unit
        }
        else { // No matching symbol
            unitSymbol = baseUnit.preferredUnitSymbol;
            this.components[unitSymbol] = {
                unit: baseUnit,
                unitExponent: unitExponent,
                //prefix: prefix,
                prefixBase: prefixBase,
                prefixExponent: prefixExponent
            };
        }
        this.updateUnit();
        return this;
    }
    updateUnit() {
        let firstComponent = true;
        // Initialize values that we recalculate
        this.dimensions = { L: 0, M: 0, T: 0, I: 0, THETA: 0, N: 0, J: 0, A: 0, D: 0 };
        this.coeff = 1;
        this.offset = 0;
        // Update dimensions and total coefficient
        for (const component of Object.values(this.components)) {
            const componentDimensions = component.unit.dimensions;
            let dimension;
            for (dimension in componentDimensions) {
                if (Object.hasOwn(componentDimensions, dimension)) {
                    this.dimensions[dimension] += componentDimensions[dimension] * component.unitExponent;
                }
            }
            this.coeff *= component.prefixBase ** component.prefixExponent * component.unit.coeff ** component.unitExponent;
            if (firstComponent) {
                firstComponent = false;
                this.offset = component.unit.offset;
            }
            else { // Set offset to 0 as soon as we reach second component. Not sure that's strictly necessary, but better safe
                this.offset = 0;
            }
        }
        const prefixedComponents = this.updatePrefix();
        this.updateSymbol(prefixedComponents);
        this.updateName(prefixedComponents);
    }
    updatePrefix() {
        let prefixedComponents = [];
        const bases = [];
        Object.values(this.components).forEach((component) => {
            const newBase = component.prefixBase;
            if (!bases.includes(newBase)) {
                bases.push(newBase);
            }
        });
        bases.forEach((base) => {
            prefixedComponents = prefixedComponents.concat(this.updatePrefixBase(base));
        });
        // TODO: Separate non prefixable units and bases so we avoid situations like kg*in*g^-1 ?
        return prefixedComponents.sort((componentA, componentB) => {
            return componentB.unitExponent - componentA.unitExponent;
        });
    }
    updatePrefixBase(base) {
        let remainingFactor = 1;
        const components = { ...this.components };
        if ('' in components) {
            components[''].unitExponent = 0;
        }
        const sortedComponents = Object.values(components).map((component) => {
            return { ...component };
        }).filter((component) => {
            if (component.prefixBase === base) {
                return true;
            }
            return false;
        }).sort((componentA, componentB) => {
            return componentB.unitExponent - componentA.unitExponent;
        });
        const nonPrefixableComponents = sortedComponents.filter((component) => {
            return !component.unit.prefixable;
        });
        const sortedFilteredComponents = sortedComponents.filter((component) => {
            if (component.unitExponent === 0 || !component.unit.prefixable) {
                remainingFactor *= component.prefixBase ** component.prefixExponent;
                return false;
            }
            return true;
        });
        // Round the remainingFactor to avoid precision loss
        remainingFactor = Math.round(remainingFactor * 1e6) / 1e6;
        // See if we find the exact prefix for the remaining units
        sortedFilteredComponents.forEach((component) => {
            const currentPrefixExponent = component.prefixExponent;
            const prefix = unit_parser_1.UnitParser.findPrefixFromExponent(currentPrefixExponent / component.unitExponent, component.prefixBase);
            if (currentPrefixExponent === 0) {
                component.prefix = undefined;
            }
            else if (prefix) {
                component.prefix = prefix;
            }
            else {
                remainingFactor *= component.prefixBase ** component.prefixExponent;
            }
        });
        // Round the remainingFactor to avoid precision loss
        remainingFactor = Math.round(remainingFactor * 1e6) / 1e6;
        if (remainingFactor === 1) {
            return sortedFilteredComponents.concat(nonPrefixableComponents);
        }
        // For units without a prefix, see if we can find a lower prefix
        sortedFilteredComponents.forEach((component) => {
            if (!component.prefix) {
                const currentPrefixExponent = component.prefixExponent;
                const prefix = unit_parser_1.UnitParser.findBestPrefixFromExponent(currentPrefixExponent / component.unitExponent, component.prefixBase);
                if (prefix) {
                    component.prefix = prefix;
                    remainingFactor /= component.prefixBase ** (prefix.exponent * component.unitExponent);
                }
            }
        });
        // Round the remainingFactor to avoid precision loss
        remainingFactor = Math.round(remainingFactor * 1e6) / 1e6;
        if (remainingFactor === 1) {
            return sortedFilteredComponents.concat(nonPrefixableComponents);
        }
        // See if we can improve the prefix of a unit, starting from the highest exponent unit
        sortedFilteredComponents.forEach((component) => {
            if (component.prefix) {
                const currentPrefixExponent = component.prefix.exponent * component.unitExponent;
                const remainingExponent = Math.log2(remainingFactor) / Math.log2(component.prefixBase);
                const prefix = unit_parser_1.UnitParser.findBestPrefixFromExponent((currentPrefixExponent + remainingExponent) / component.unitExponent, component.prefixBase);
                if (prefix) {
                    component.prefix = prefix;
                    remainingFactor /= component.prefixBase ** (prefix.exponent * component.unitExponent - currentPrefixExponent);
                }
            }
            else {
                const newPrefixBase = component.unit.base;
                const remainingExponent = Math.log2(remainingFactor) / Math.log2(newPrefixBase);
                const prefix = unit_parser_1.UnitParser.findBestPrefixFromExponent(remainingExponent / component.unitExponent, newPrefixBase);
                if (prefix) {
                    component.prefix = prefix;
                    component.prefixBase = newPrefixBase;
                    remainingFactor /= component.prefixBase ** (prefix.exponent * component.unitExponent);
                }
            }
        });
        // Round the remainingFactor to avoid precision loss
        remainingFactor = Math.round(remainingFactor * 1e6) / 1e6;
        if (remainingFactor === 1) {
            return sortedFilteredComponents.concat(nonPrefixableComponents);
        }
        // Recursively try to upgrade a prefix while downgrading another to see if we can get closer
        const componentSolutions = [];
        sortedFilteredComponents.forEach((component1) => {
            const newPrefixBase = component1.unit.base;
            const remainingExponent = Math.log2(remainingFactor) / Math.log2(newPrefixBase);
            const component1OldExponent = (component1.prefix?.exponent ?? 0) * component1.unitExponent;
            sortedFilteredComponents.forEach((component2) => {
                // NOTE: Do we need to test only a single upgrade ot every possible upgrade?
                // More computationally efficient to test a signle upgrade but is it enough?
                // I think it's enough. Not 100% sure though.
                const component2OldExponent = (component2.prefix?.exponent ?? 0) * component2.unitExponent;
                if (component1 === component2) {
                    return;
                }
                // Can't be a candidate if both units don't have the same prefix base
                if (component2.prefixBase !== 1 && component2.prefixBase !== newPrefixBase) {
                    return;
                }
                // Find the next best for component1 using prefix + remainingFactor, see what the prefixDifference is
                const component1NewPrefix = unit_parser_1.UnitParser.findNextPrefixFromExponent((component1OldExponent + remainingExponent) / component1.unitExponent, newPrefixBase);
                const component1NewPrefixExponent = (component1NewPrefix?.exponent ?? 0) * component1.unitExponent;
                const exponentDifference = component1NewPrefixExponent - component1OldExponent - remainingExponent;
                // See if we have a prefix for component2 using prefix - exponentDifference
                // component1NewPrefixExponent = component1OldExponent + remainingExponent + exponentDifference
                // component2NewPrefixExponent = component2OldExponent - exponentDifference
                const component2NewPrefix = unit_parser_1.UnitParser.findPrefixFromExponent((component2OldExponent - exponentDifference) / component2.unitExponent, newPrefixBase);
                // If so, that's a candidate solution
                // There's a corner case if the resulting prefix is no prefix that we need to handle here
                if (component1NewPrefix !== null && (component2NewPrefix !== null || component2OldExponent === exponentDifference)) {
                    componentSolutions.push({
                        component1: component1,
                        component1NewPrefix: component1NewPrefix,
                        component1NewPrefixExponent: component1NewPrefixExponent,
                        component2: component2,
                        component2NewPrefix: component2NewPrefix,
                        component2NewPrefixExponent: (component2NewPrefix?.exponent ?? 0) * component2.unitExponent,
                        newPrefixBase: newPrefixBase,
                        exponentDifference: exponentDifference
                    });
                }
            });
        });
        // Pick the best candidate solution
        // Criteria for best candidate:
        // - MUST catch up the remainingExponent (should we allow partial catch up ?)
        // - SHOULD minimize exponentDifference (minimum backchange required)
        // - ???
        // Sort best to worst
        const sortedCandidates = componentSolutions.sort((candidate1, candidate2) => Math.abs(candidate1.exponentDifference) - Math.abs(candidate2.exponentDifference));
        if (sortedCandidates.length > 0) {
            const solution = sortedCandidates[0];
            remainingFactor *= solution.component1.prefixBase ** ((solution.component1?.prefix?.exponent ?? 0) * solution.component1.unitExponent);
            remainingFactor *= solution.component2.prefixBase ** ((solution.component2?.prefix?.exponent ?? 0) * solution.component2.unitExponent);
            solution.component1.prefix = solution.component1NewPrefix;
            solution.component1.prefixBase = solution.newPrefixBase;
            solution.component2.prefix = solution.component2NewPrefix ?? undefined;
            solution.component2.prefixBase = solution.newPrefixBase;
            remainingFactor /= solution.component1.prefixBase ** ((solution.component1?.prefix?.exponent ?? 0) * solution.component1.unitExponent);
            remainingFactor /= solution.component2.prefixBase ** ((solution.component2?.prefix?.exponent ?? 0) * solution.component2.unitExponent);
        }
        // Round the remainingFactor to avoid precision loss
        remainingFactor = Math.round(remainingFactor * 1e6) / 1e6;
        if (remainingFactor === 1) {
            return sortedFilteredComponents.concat(nonPrefixableComponents);
        }
        // Split a unit with an exponent > 1 into several factors with separate prefixes
        const resortedFilteredComponents = [...sortedFilteredComponents].sort((component1, component2) => {
            const exp1 = Math.abs(component1.unitExponent) + 0.25 * (1 + Math.sign(component1.unitExponent));
            const exp2 = Math.abs(component2.unitExponent) + 0.25 * (1 + Math.sign(component2.unitExponent));
            return exp1 - exp2;
        });
        resortedFilteredComponents.forEach((component) => {
            if (remainingFactor !== 1 && component.unitExponent >= 2) {
                const newPrefixBase = component.unit.base;
                const remainingExponent = Math.log2(remainingFactor) / Math.log2(component.prefixBase);
                const totalComponentPrefixExponent = remainingExponent + (component.prefix?.exponent ?? 0) * component.unitExponent;
                // The first term, we fit with as much exponent as we can get.
                const component1UnitExponent = component.unitExponent - 1;
                const component1Prefix = unit_parser_1.UnitParser.findBestPrefixFromExponent(totalComponentPrefixExponent / component1UnitExponent, newPrefixBase);
                const component1PrefixExponent = component1Prefix?.exponent ?? 0;
                // Then we complement with the second term
                const component2UnitExponent = 1;
                const component2Prefix = unit_parser_1.UnitParser.findBestPrefixFromExponent((totalComponentPrefixExponent - component1PrefixExponent * component1UnitExponent) / component2UnitExponent, newPrefixBase);
                const component2PrefixExponent = component2Prefix?.exponent ?? 0;
                // If we found a solution with different prefixes, update stuff
                if (component1PrefixExponent !== component2PrefixExponent) {
                    remainingFactor *= newPrefixBase ** ((component.prefix?.exponent ?? 0) * component.unitExponent);
                    component.unitExponent = component1UnitExponent;
                    component.prefixBase = newPrefixBase;
                    component.prefix = component1Prefix ?? undefined;
                    component.prefixExponent = component1PrefixExponent;
                    remainingFactor /= newPrefixBase ** (component1PrefixExponent * component1UnitExponent);
                    sortedFilteredComponents.push({
                        unit: component.unit,
                        unitExponent: component2UnitExponent,
                        prefixBase: newPrefixBase,
                        prefixExponent: component2PrefixExponent,
                        prefix: component2Prefix ?? undefined
                    });
                    remainingFactor /= newPrefixBase ** (component2PrefixExponent * component2UnitExponent);
                }
            }
        });
        // Round the remainingFactor to avoid precision loss
        remainingFactor = Math.round(remainingFactor * 1e6) / 1e6;
        if (remainingFactor === 1) {
            return sortedFilteredComponents.concat(nonPrefixableComponents);
        }
        // Split a unit with 0 exponent into a ratio of units with prefixes to account for the remaining prefactor
        sortedComponents.forEach((component) => {
            if (remainingFactor !== 1 && component.unitExponent === 0 && component.unit.prefixable) {
                const newPrefixBase = component.unit.base;
                const remainingExponent = Math.log2(remainingFactor) / Math.log2(component.prefixBase);
                // At the numerator is the closest to the exact exponent approached from larger absolute values
                const numeratorPrefix = unit_parser_1.UnitParser.findNextPrefixFromExponent(remainingExponent, newPrefixBase);
                const numeratorExponent = numeratorPrefix?.exponent ?? 0;
                // At the denuminator, we take the largest prefix we can to account for all remaining prefixes
                const denominatorPrefix = unit_parser_1.UnitParser.findBestPrefixFromExponent(numeratorExponent - remainingExponent, newPrefixBase);
                const denominatorExponent = denominatorPrefix?.exponent ?? 0;
                // If we find the prefixes, add the unit
                if (numeratorPrefix || denominatorPrefix) {
                    sortedFilteredComponents.push({
                        unit: component.unit,
                        unitExponent: 1,
                        prefixBase: newPrefixBase,
                        prefixExponent: numeratorExponent,
                        prefix: numeratorPrefix ?? undefined
                    });
                    sortedFilteredComponents.push({
                        unit: component.unit,
                        unitExponent: -1,
                        prefixBase: newPrefixBase,
                        prefixExponent: denominatorExponent,
                        prefix: denominatorPrefix ?? undefined
                    });
                    remainingFactor /= newPrefixBase ** (numeratorExponent - denominatorExponent);
                }
            }
        });
        // Round the remainingFactor to avoid precision loss
        remainingFactor = Math.round(remainingFactor * 1e6) / 1e6;
        // If we have a remaining factor, that's an error case
        if (remainingFactor !== 1) {
            firebot_modules_1.logger.debug(JSON.stringify(this));
            firebot_modules_1.logger.debug(JSON.stringify(sortedFilteredComponents));
            throw new errors_1.UnexpectedError(`There was a remaining factor of ${remainingFactor} for this unit. `);
        }
        return sortedFilteredComponents.concat(nonPrefixableComponents);
    }
    updateSymbol(prefixedComponents) {
        let symbolString = "";
        let first = true;
        for (const component of prefixedComponents) {
            if (!first) {
                symbolString = `${symbolString}*`;
            }
            first = false;
            if (component.prefix) {
                symbolString = `${symbolString}${component.prefix?.symbol}`;
            }
            symbolString = `${symbolString}${component.unit.preferredSymbol}`;
            if (component.unitExponent !== 1) {
                symbolString = `${symbolString}^${component.unitExponent}`;
            }
        }
        this.symbols = [symbolString];
        this.preferredUnitSymbol = symbolString;
    }
    updateName(prefixedComponents) {
        let nameString = "";
        let first = true;
        for (const component of prefixedComponents) {
            if (!first) {
                nameString = `${nameString}*`;
            }
            first = false;
            if (component.prefix) {
                nameString = `${nameString}${component.prefix?.name}`;
            }
            nameString = `${nameString}${component.unit.name}`;
            if (component.unitExponent !== 1) {
                nameString = `${nameString}^${component.unitExponent}`;
            }
        }
        this.name = nameString;
    }
    deltaUnit() {
        const newUnit = this.copy();
        Object.values(newUnit.components).forEach((element) => {
            element.unit = element.unit.deltaUnit();
        });
        newUnit.updateUnit();
        return newUnit;
    }
    multiply(other) {
        if (typeof other === 'number') {
            return new quantity_1.Quantity(other, this);
        }
        else if (other instanceof unit_1.Unit || other instanceof prefixed_unit_1.PrefixedUnit) {
            return this.copy().addFactor(other, 1);
        }
        else if (other instanceof CompoundUnit) {
            const product = this.copy();
            Object.values(other.components).forEach((component) => {
                product.addComponent(component);
            });
            return product;
        }
        throw new errors_1.UnitError(`Unsupported unit type ${other.constructor.name} for multiplication with CompoundUnit. `);
    }
    divide(other) {
        if (typeof other === 'number') {
            return new quantity_1.Quantity(1 / other, this);
        }
        else if (other instanceof unit_1.Unit || other instanceof prefixed_unit_1.PrefixedUnit) {
            return this.copy().addFactor(other, -1);
        }
        else if (other instanceof CompoundUnit) {
            const ratio = this.copy();
            Object.values(other.components).forEach((component) => {
                ratio.addComponent(component, -1);
            });
            return ratio;
        }
        throw new errors_1.UnitError(`Unsupported unit type ${other.constructor.name} for multiplication with CompoundUnit. `);
    }
    power(exponent) {
        const result = this.copy();
        Object.values(result.components).forEach((component) => {
            component.unitExponent *= exponent;
            component.prefixExponent *= exponent;
        });
        result.updateUnit();
        return result;
    }
}
exports.CompoundUnit = CompoundUnit;


/***/ }),

/***/ 395:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Prefix = void 0;
class Prefix {
    symbol;
    name;
    factor;
    _base;
    _exponent;
    constructor(symbol, name, base, exponent) {
        this.symbol = symbol;
        this.name = name;
        this._base = base;
        this._exponent = exponent;
        this.factor = base ** exponent;
    }
    get base() {
        return this._base;
    }
    set base(value) {
        this._base = value;
        this.factor = this._base ** this._exponent;
    }
    get exponent() {
        return this._exponent;
    }
    set exponent(value) {
        this._exponent = value;
        this.factor = this._base ** this._exponent;
    }
    copy() {
        return new Prefix(this.symbol, this.name, this.base, this.exponent);
    }
}
exports.Prefix = Prefix;


/***/ }),

/***/ 893:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrefixedUnit = void 0;
const errors_1 = __webpack_require__(725);
const quantity_1 = __webpack_require__(759);
const compound_unit_1 = __webpack_require__(429);
const abstract_based_unit_1 = __webpack_require__(338);
class PrefixedUnit extends abstract_based_unit_1.AbstractBasedUnit {
    _prefix;
    baseUnit;
    constructor(prefix, unit, unitSymbol) {
        super();
        this.baseUnit = unit;
        this.base = this.baseUnit.base;
        this.dimensions = unit.dimensions;
        this.offset = unit.offset;
        if (unitSymbol) {
            this.preferredUnitSymbol = unitSymbol;
        }
        this.prefix = prefix;
    }
    copy() {
        return new PrefixedUnit(this.prefix.copy(), this.baseUnit.copy(), this._preferredUnitSymbol ? this._preferredUnitSymbol : undefined);
    }
    set preferredUnitSymbol(unitSymbol) {
        if (!this.baseUnit.symbols.includes(unitSymbol)) {
            throw new errors_1.ValueError(`Unit symbol ${unitSymbol} didn't match any existing symbol in the unit's list ${JSON.stringify(this.symbols)}. `);
        }
        this._preferredUnitSymbol = unitSymbol ? unitSymbol : null;
    }
    get preferredUnitSymbol() {
        if (!this._preferredUnitSymbol) {
            return this.baseUnit.preferredUnitSymbol;
        }
        return this._preferredUnitSymbol;
    }
    set prefix(prefix) {
        if (prefix.base !== this.base) {
            throw new errors_1.PrefixError(`Prefix ${prefix.symbol} (base ${prefix.base}) does't have the same base as unit ${this.baseUnit.preferredUnitSymbol} (base ${this.base}). `);
        }
        this._prefix = prefix;
        const symbols = this._preferredUnitSymbol ? [`${prefix.symbol}${this._preferredUnitSymbol}`] : this.baseUnit.symbols.map(unitSymbol => `${prefix.symbol}${unitSymbol}`);
        this.symbols = symbols;
        this.name = `${prefix.name}${this.baseUnit.name}`;
        this.coeff = this.baseUnit.coeff * prefix.factor;
    }
    get prefix() {
        if (!this._prefix) {
            throw new errors_1.ValueError(`Unit prefix has not been defined. `);
        }
        return this._prefix;
    }
    get preferredSymbol() {
        return `${this.prefix.symbol}${this.preferredUnitSymbol}`;
    }
    deltaUnit() {
        return new PrefixedUnit(this.prefix, this.baseUnit.deltaUnit(), this._preferredUnitSymbol ?? undefined);
    }
    multiply(other) {
        if (typeof other === 'number') {
            return new quantity_1.Quantity(other, this);
        }
        return new compound_unit_1.CompoundUnit(this, 1).multiply(other);
    }
    divide(other) {
        if (typeof other === 'number') {
            return new quantity_1.Quantity(1 / other, this);
        }
        return new compound_unit_1.CompoundUnit(this, 1).divide(other);
    }
    power(power) {
        return new compound_unit_1.CompoundUnit(this, power);
    }
}
exports.PrefixedUnit = PrefixedUnit;


/***/ }),

/***/ 281:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Unit = void 0;
const quantity_1 = __webpack_require__(759);
const prefixed_unit_1 = __webpack_require__(893);
const compound_unit_1 = __webpack_require__(429);
const abstract_based_unit_1 = __webpack_require__(338);
const errors_1 = __webpack_require__(725);
class Unit extends abstract_based_unit_1.AbstractBasedUnit {
    symbols;
    name;
    prefixable;
    coeff;
    offset;
    // Dimensional quantities
    // -----------------------
    dimensions;
    constructor(symbol, name, dimensions = {}, base = 10, coeff = 1, offset = 0, prefixable = true) {
        super();
        this.dimensions = {
            L: dimensions.L ?? 0,
            M: dimensions.M ?? 0,
            T: dimensions.T ?? 0,
            I: dimensions.I ?? 0,
            THETA: dimensions.THETA ?? 0,
            N: dimensions.N ?? 0,
            J: dimensions.J ?? 0,
            A: dimensions.A ?? 0,
            D: dimensions.D ?? 0
        };
        this.coeff = coeff;
        this.offset = offset;
        this.symbols = Array.isArray(symbol) ? symbol : [symbol];
        this.preferredUnitSymbol = this.symbols[0];
        this.name = name;
        this.base = base;
        this.prefixable = prefixable;
    }
    copy() {
        const copy = new Unit(this.symbols, this.name, { ...this.dimensions }, this.base, this.coeff, this.offset, this.prefixable);
        copy.preferredUnitSymbol = this.preferredUnitSymbol;
        return copy;
    }
    static ONE = new Unit('', '', {}, 1, 1, 0, false);
    isNeutralElement() {
        return this.isDimensionless() && this.isLinear() && this.coeff === 1;
    }
    deltaUnit() {
        if (this.isLinear()) {
            return this;
        }
        // Delta units are identical to the unit, but without an offset
        return new Unit(this.symbols, this.name, this.dimensions, this.base, this.coeff, 0, this.prefixable);
    }
    multiply(other) {
        if (typeof other === 'number') {
            return new quantity_1.Quantity(other, this);
        }
        return new compound_unit_1.CompoundUnit(this, 1).multiply(other);
    }
    divide(other) {
        if (typeof other === 'number') {
            return new quantity_1.Quantity(1 / other, this);
        }
        return new compound_unit_1.CompoundUnit(this, 1).divide(other);
    }
    power(power) {
        return new compound_unit_1.CompoundUnit(this, power);
    }
    applyPrefix(prefix, unitSymbol) {
        if (!this.prefixable) {
            throw new errors_1.UnitError(`Unit ${this.name} cannot be prefixed`);
        }
        return new prefixed_unit_1.PrefixedUnit(prefix, this, unitSymbol);
    }
}
exports.Unit = Unit;


/***/ }),

/***/ 725:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UnexpectedError = exports.InvalidOperationError = exports.DepthLimitExceededError = exports.DelimiterError = exports.ValueError = exports.UnitNotFoundError = exports.UnitMismatchError = exports.PrefixError = exports.UnitError = exports.UnitConverterError = void 0;
class UnitConverterError extends Error {
    originalMessage = '';
    constructor(message) {
        super(`Unitconverter: ${message}`);
        this.originalMessage = message;
        this.name = "UnitConverterError";
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UnitConverterError.prototype);
    }
}
exports.UnitConverterError = UnitConverterError;
class UnitError extends UnitConverterError {
    constructor(message) {
        super(`Unit error : ${message}`);
        this.originalMessage = message;
        this.name = "UnitError";
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UnitError.prototype);
    }
}
exports.UnitError = UnitError;
class PrefixError extends UnitConverterError {
    constructor(message) {
        super(`Prefix error : ${message}`);
        this.originalMessage = message;
        this.name = "PrefixError";
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, PrefixError.prototype);
    }
}
exports.PrefixError = PrefixError;
class UnitMismatchError extends UnitConverterError {
    constructor(message) {
        super(`Unit mismatch : ${message}`);
        this.originalMessage = message;
        this.name = "UnitMismatchError";
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UnitMismatchError.prototype);
    }
}
exports.UnitMismatchError = UnitMismatchError;
class UnitNotFoundError extends UnitConverterError {
    constructor(message) {
        super(`Unit not found in "${message}". `);
        this.originalMessage = `Unit not found in "${message}". `;
        this.name = "UnitNotFoundError";
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UnitNotFoundError.prototype);
    }
}
exports.UnitNotFoundError = UnitNotFoundError;
class ValueError extends UnitConverterError {
    constructor(message) {
        super(`Invalid parameter value. ${message}`);
        this.originalMessage = message;
        this.name = "ValueError";
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ValueError.prototype);
    }
}
exports.ValueError = ValueError;
class DelimiterError extends UnitConverterError {
    constructor(message) {
        super(`Delimiter Error. ${message}`);
        this.originalMessage = message;
        this.name = "DelimiterError";
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DelimiterError.prototype);
    }
}
exports.DelimiterError = DelimiterError;
class DepthLimitExceededError extends UnitConverterError {
    constructor() {
        super(`Depth limit exceeded while parsing. `);
        this.originalMessage = `Depth limit exceeded while parsing. `;
        this.name = "DepthLimitExceededError";
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DepthLimitExceededError.prototype);
    }
}
exports.DepthLimitExceededError = DepthLimitExceededError;
class InvalidOperationError extends UnitConverterError {
    constructor(message) {
        super(`Math operation invalid Error. ${message}`);
        this.originalMessage = message;
        this.name = "InvalidOperationError";
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidOperationError.prototype);
    }
}
exports.InvalidOperationError = InvalidOperationError;
class UnexpectedError extends UnitConverterError {
    constructor(message) {
        super(`Unexpected Error. ${message}`);
        this.originalMessage = message;
        this.name = "UnexpectedError";
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UnexpectedError.prototype);
    }
}
exports.UnexpectedError = UnexpectedError;


/***/ }),

/***/ 927:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
const AllUnitConverterVariables = __importStar(__webpack_require__(490));
const firebot_modules_1 = __webpack_require__(93);
const packageInfo = __importStar(__webpack_require__(330));
const data_1 = __webpack_require__(418);
const unit_parser_1 = __webpack_require__(806);
const script = {
    getScriptManifest: () => {
        return {
            name: "Unit Converter",
            description: packageInfo.description,
            author: packageInfo.author,
            version: packageInfo.version,
            firebotVersion: "5",
            startupOnly: true
        };
    },
    getDefaultParameters: () => ({}),
    run: ({ modules }) => {
        // Setup globals
        (0, firebot_modules_1.initModules)(modules);
        firebot_modules_1.logger.info("Loading Unit Converter...");
        // Register units
        firebot_modules_1.logger.info("Loading units");
        data_1.UNITS.forEach((unit) => {
            unit_parser_1.UnitParser.registerUnit(unit);
        });
        // Register prefixes
        firebot_modules_1.logger.info("Loading prefixes");
        data_1.PREFIXES.forEach((prefix) => {
            unit_parser_1.UnitParser.registerPrefix(prefix);
        });
        // Register ReplaceVariables
        firebot_modules_1.logger.info("Loading variables");
        for (const variable of Object.values(AllUnitConverterVariables)) {
            firebot_modules_1.variableManager.registerReplaceVariable(variable);
        }
        firebot_modules_1.logger.info("Unit Converter loaded");
    },
    stop: () => {
        firebot_modules_1.logger.info("Unloading Unit Converter...");
        firebot_modules_1.logger.info("Unloading units");
        unit_parser_1.UnitParser.unregisterUnits();
        firebot_modules_1.logger.info("Unloading prefixes");
        unit_parser_1.UnitParser.unregisterPrefixes();
        firebot_modules_1.logger.info("Unit Converter unloaded");
    }
};
exports["default"] = script;


/***/ }),

/***/ 730:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ParseMath = void 0;
const regex_escape_1 = __importDefault(__webpack_require__(260));
const errors_1 = __webpack_require__(725);
const MathTree_1 = __webpack_require__(815);
class ParseMath {
    static groupDelimiters = { '(': ')', '[': ']', '{': '}' };
    static match(toBeParsed) {
        const { groupMath, remainder } = ParseMath.matchGroup(toBeParsed);
        /* istanbul ignore next */
        if (remainder !== '') {
            throw new errors_1.UnexpectedError(`Input could not be fully parsed. '${remainder}' was left out. `);
        }
        return groupMath;
    }
    static matchGroup(toBeParsed, depthLevel = 0, openingDelim = '') {
        const depthLimit = 20;
        const openingDelims = Object.keys(ParseMath.groupDelimiters).join("");
        const closingDelims = Object.values(ParseMath.groupDelimiters).join("");
        const closingDelim = ParseMath.groupDelimiters[openingDelim] ?? '';
        const atoms = [];
        let remainder = '';
        while (toBeParsed) {
            const firstDelimIndex = toBeParsed.search(`[${(0, regex_escape_1.default)(closingDelim)}${(0, regex_escape_1.default)(openingDelims)}]`);
            if (firstDelimIndex === -1 && closingDelim === '') {
                // Didn't find a delimiter and wasn't looking for one
                atoms.push(new MathTree_1.StringSymbol(toBeParsed));
                toBeParsed = '';
            }
            else if (firstDelimIndex === -1) {
                // Was looking for a delimiter but didn't find one
                throw new errors_1.DelimiterError(`Sequence ended while looking for a ${closingDelim} delimiter. `);
            }
            else if (toBeParsed[firstDelimIndex] === closingDelim) {
                // Found a closing delimiter
                const preDelim = toBeParsed.substring(0, firstDelimIndex);
                let index;
                if ((index = preDelim.search(`[${(0, regex_escape_1.default)(closingDelims)}]`)) >= 0) {
                    // Found an illegal closing delimiter
                    throw new errors_1.DelimiterError(`Unexpected closing delimiter ${preDelim[index]} encountered. `);
                }
                // Anything before the delimiter is an atom
                if (preDelim) {
                    atoms.push(new MathTree_1.StringSymbol(preDelim));
                }
                const postDelim = toBeParsed.substring(firstDelimIndex + 1);
                // We finished parsing the current group. Anything left is a remainder.
                toBeParsed = '';
                remainder = postDelim;
            }
            else {
                // Found an opening delimiter
                // Check if we haven't exceeded the depth limit
                if (depthLimit - 1 < depthLevel) {
                    throw new errors_1.DepthLimitExceededError();
                }
                const preDelim = toBeParsed.substring(0, firstDelimIndex);
                let index;
                if ((index = preDelim.search(`[${(0, regex_escape_1.default)(closingDelims)}]`)) >= 0) {
                    // Found an illegal closing delimiter
                    throw new errors_1.DelimiterError(`Unexpected closing delimiter ${preDelim[index]} encountered. `);
                }
                // Anything before the delimiter is an atom
                if (preDelim) {
                    atoms.push(new MathTree_1.StringSymbol(preDelim));
                }
                const postDelim = toBeParsed.substring(firstDelimIndex + 1);
                // Parse the enclosed group
                const { groupMath, remainder } = ParseMath.matchGroup(postDelim, depthLevel + 1, toBeParsed[firstDelimIndex]);
                atoms.push(groupMath);
                toBeParsed = remainder;
            }
        }
        // Atomize the atoms into a list of math symbols or subtrees
        let quarks = [];
        for (const atom of atoms) {
            if (atom instanceof MathTree_1.StringSymbol) {
                // Check atoms don't have delimiters left
                let index;
                if ((index = atom.value.search(`[${(0, regex_escape_1.default)(`${openingDelims}${closingDelims}`)}]`)) !== -1) {
                    throw new errors_1.DelimiterError(`Unexpected delimiter ${atom.value[index]} encountered. `);
                }
                quarks = quarks.concat(ParseMath.atomize(atom.value));
            }
            else {
                quarks.push(atom);
            }
        }
        // Transform the list of Atoms into a MathTree
        const groupMath = ParseMath.makeTree(quarks);
        // Check we don't end up with an empty math tree
        if (groupMath instanceof MathTree_1.Empty) {
            throw new errors_1.InvalidOperationError(`Empty groups are forbidden. `);
        }
        return { groupMath, remainder };
    }
    static atomize(toBeParsed) {
        return toBeParsed.split(/((?<=^|[*/+-\s.^])\d*\.?\d+(?:[Ee][+-]?\d+)?)/)
            .flatMap((value, index) => (Math.floor(index / 2) === index / 2
            ? value.split(/\s*([*/+-\s.^])\s*/)
            : Number(value)))
            .filter(symbol => (symbol !== ""))
            .map(quark => (typeof quark === 'string' ? new MathTree_1.StringSymbol(quark) : new MathTree_1.Numeric(quark)));
    }
    static makeTree(atoms) {
        // 'i*' represents implicit multiplication
        const operations = ['+', '-', '*', '/', '^', 'i*'];
        // Order of operations :
        // Trim space tokens at start or end of chain
        while (atoms[0] instanceof MathTree_1.StringSymbol && atoms[0].value === ' ') {
            atoms.shift();
        }
        let lastAtom;
        while ((lastAtom = atoms.at(-1)) instanceof MathTree_1.StringSymbol && lastAtom.value === ' ') {
            atoms.pop();
        }
        // - \s is an alias for implicit multiplication i* and and . an alias for explicit multiplication *
        atoms = atoms.map(atom => (atom instanceof MathTree_1.StringSymbol && (atom.value === ' ') ? new MathTree_1.StringSymbol('i*') : atom));
        atoms = atoms.map(atom => (atom instanceof MathTree_1.StringSymbol && (atom.value === '.') ? new MathTree_1.StringSymbol('*') : atom));
        let processedAtoms = [];
        // - Check for start/end of chain ==> do as part of operations processing ?
        // Sanitize sequences of operators
        while (atoms.length > 0) {
            // Can't be undefined, as we checked the length
            let atom = atoms.shift();
            const nextAtom = atoms[0];
            let lastAtom = processedAtoms.at(-1);
            // Atom can't be an empty MathTree
            if (atom instanceof MathTree_1.Empty) {
                throw new errors_1.InvalidOperationError(`Empty groups are forbidden. `);
            }
            // Sanitize first atom
            if (processedAtoms.length === 0) {
                if (atom instanceof MathTree_1.StringSymbol && atom.value === '+') {
                    // + as first atom gets gobbled
                    continue;
                }
                else if (atom instanceof MathTree_1.StringSymbol && ['*', 'i*', '/', '^'].includes(atom.value)) {
                    throw new errors_1.InvalidOperationError(`${atom.value} is invalid as the first token. `);
                }
            }
            // Sanitize last atom
            if (nextAtom === undefined) {
                if (atom instanceof MathTree_1.StringSymbol && ['+', '-', '*', 'i*', '/', '^'].includes(atom.value)) {
                    throw new errors_1.InvalidOperationError(`${atom.value} is invalid as the last token. `);
                }
            }
            // Check we haven't skipped a +
            /* istanbul ignore next */
            if (atom instanceof MathTree_1.StringSymbol && lastAtom instanceof MathTree_1.StringSymbol && atom.value === '+' && lastAtom.value === '+') {
                throw new errors_1.UnexpectedError(`${lastAtom.value}${atom.value} should have been removed. `);
                // Cancel the last + if we still have one
                processedAtoms.pop();
                lastAtom = processedAtoms.at(-1);
            }
            // Keep i* StringSymbol (i.e. '2nm' or 'cm kL'). In all other cases, i* => *
            if (atom instanceof MathTree_1.StringSymbol && atom.value === 'i*' && !(nextAtom instanceof MathTree_1.StringSymbol)) {
                atom = new MathTree_1.StringSymbol('*');
            }
            // Sanitize atom sequences
            if (atom instanceof MathTree_1.StringSymbol && nextAtom instanceof MathTree_1.StringSymbol && atom.value === '+' && nextAtom.value === '+') {
                // + + ==> +
                continue;
            }
            else if ((!(atom instanceof MathTree_1.StringSymbol) || !operations.includes(atom.value)) &&
                nextAtom instanceof MathTree_1.StringSymbol && nextAtom.value === '-') {
                // MathTree - ==> MathTree + -
                atoms.unshift(new MathTree_1.StringSymbol('+'));
                processedAtoms.push(atom);
            }
            else if (atom instanceof MathTree_1.StringSymbol && atom.value === '+' &&
                nextAtom instanceof MathTree_1.StringSymbol && ['*', 'i*', '/', '^'].includes(nextAtom.value)) {
                // + *, + i*, + /, + ^ ==> error
                throw new errors_1.InvalidOperationError(`${atom.value}${nextAtom.value} is an invalid sequence of operations. `);
            }
            else if (atom instanceof MathTree_1.StringSymbol && atom.value === '-' && nextAtom instanceof MathTree_1.StringSymbol && nextAtom.value === '+') {
                // - + ==> -
                atoms[0] = new MathTree_1.StringSymbol('-');
            }
            else if (atom instanceof MathTree_1.StringSymbol && atom.value === '-' && nextAtom instanceof MathTree_1.StringSymbol && nextAtom.value === '-') {
                // - - ==> +
                atoms[0] = new MathTree_1.StringSymbol('+');
                // Walk back one
                const walkback = processedAtoms.pop();
                if (walkback !== undefined) {
                    atoms.unshift(walkback);
                }
            }
            else if (atom instanceof MathTree_1.StringSymbol && atom.value === '-' && nextAtom instanceof MathTree_1.StringSymbol && ['*', 'i*', '/', '^'].includes(nextAtom.value)) {
                // - *, - i*, - /, - ^ ==> error
                throw new errors_1.InvalidOperationError(`${atom.value}${nextAtom.value} is an invalid sequence of operations. `);
            }
            else if (atom instanceof MathTree_1.StringSymbol && ['*', 'i*'].includes(atom.value) && nextAtom instanceof MathTree_1.StringSymbol && nextAtom.value === '+') {
                // * +, i* + ==> *
                atoms[0] = new MathTree_1.StringSymbol('*');
            }
            else if (atom instanceof MathTree_1.StringSymbol && atom.value === '*' && nextAtom instanceof MathTree_1.StringSymbol && ['*', 'i*', '/', '^'].includes(nextAtom.value)) {
                // * *, * i*, * /, * ^ ==> error
                throw new errors_1.InvalidOperationError(`${atom.value}${nextAtom.value} is an invalid sequence of operations. `);
            }
            else if (atom instanceof MathTree_1.StringSymbol && atom.value === 'i*' && nextAtom instanceof MathTree_1.StringSymbol && ['*', 'i*', '/', '^'].includes(nextAtom.value)) {
                // i* *, i* i*, i* /, i* ^ ==> error
                throw new errors_1.InvalidOperationError(`${atom.value}${nextAtom.value} is an invalid sequence of operations. `);
            }
            else if (atom instanceof MathTree_1.StringSymbol && atom.value === '/' && nextAtom instanceof MathTree_1.StringSymbol && nextAtom.value === '+') {
                // / + ==> /
                atoms[0] = new MathTree_1.StringSymbol('/');
            }
            else if (atom instanceof MathTree_1.StringSymbol && atom.value === '/' && nextAtom instanceof MathTree_1.StringSymbol && ['*', 'i*', '/', '^'].includes(nextAtom.value)) {
                // / *, / i*, / /, / ^ ==> error
                throw new errors_1.InvalidOperationError(`${atom.value}${nextAtom.value} is an invalid sequence of operations. `);
            }
            else if (atom instanceof MathTree_1.StringSymbol && atom.value === '^' && nextAtom instanceof MathTree_1.StringSymbol && nextAtom.value === '+') {
                // ^ + ==> ^
                atoms[0] = new MathTree_1.StringSymbol('^');
            }
            else if (atom instanceof MathTree_1.StringSymbol && atom.value === '^' && nextAtom instanceof MathTree_1.StringSymbol && ['*', 'i*', '/', '^'].includes(nextAtom.value)) {
                // ^ *, ^ i*, ^ /, ^ ^ ==> error
                throw new errors_1.InvalidOperationError(`${atom.value}${nextAtom.value} is an invalid sequence of operations. `);
            }
            else if (nextAtom !== undefined &&
                (!(atom instanceof MathTree_1.StringSymbol) || !operations.includes(atom.value)) &&
                (!(nextAtom instanceof MathTree_1.StringSymbol) || !operations.includes(nextAtom.value))) {
                // MathTree MathTree ==> MathTree i* MathTree
                // TODO: If I ever want to implement functions, this needs to change.
                // Function = [Symbol MathTree] at this point, so here we destroy it.
                atoms.unshift(new MathTree_1.StringSymbol('i*'));
                processedAtoms.push(atom);
            }
            else {
                // + -, * -, i* -, / -, ^ -, Operator MathTree, MathTree Operator ==> valid
                processedAtoms.push(atom);
            }
        }
        atoms = processedAtoms;
        processedAtoms = [];
        // At this point, we only have valid sequences of [MathTree Operator MathTree] or [Operator Operator]
        // Power
        while (atoms.length > 0) {
            // Can't be undefined, as we checked the length
            const atom = atoms.shift();
            if (atom instanceof MathTree_1.StringSymbol && atom.value === '^') {
                // atoms = [..., ^ ] or [ ^, ...] hould haved thrown an error already
                let nextAtom = atoms.shift();
                // Handle sequence a ^ - b
                if (nextAtom instanceof MathTree_1.StringSymbol && nextAtom.value === '-') {
                    nextAtom = new MathTree_1.Oppose(atoms.shift());
                }
                const lastAtom = processedAtoms.pop();
                processedAtoms.push(new MathTree_1.Power(lastAtom, nextAtom));
            }
            else {
                processedAtoms.push(atom);
            }
        }
        atoms = processedAtoms;
        processedAtoms = [];
        // Implicit Multiply
        while (atoms.length > 0) {
            // Can't be undefined, as we checked the length
            const atom = atoms.shift();
            if (atom instanceof MathTree_1.StringSymbol && atom.value === 'i*') {
                // atoms = [..., i* ] or [ i*, ...] hould haved thrown an error already
                let nextAtom = atoms.shift();
                // Handle sequence a i* - b (shouldn't happen)
                if (nextAtom instanceof MathTree_1.StringSymbol && nextAtom.value === '-') {
                    nextAtom = new MathTree_1.Oppose(atoms.shift());
                }
                const lastAtom = processedAtoms.pop();
                if (lastAtom instanceof MathTree_1.Multiply && nextAtom instanceof MathTree_1.Multiply) {
                    processedAtoms.push(new MathTree_1.Multiply(...lastAtom.factors, ...nextAtom.factors));
                }
                else if (lastAtom instanceof MathTree_1.Multiply) {
                    processedAtoms.push(new MathTree_1.Multiply(...lastAtom.factors, nextAtom));
                }
                else if (nextAtom instanceof MathTree_1.Multiply) {
                    processedAtoms.push(new MathTree_1.Multiply(lastAtom, ...nextAtom.factors));
                }
                else {
                    processedAtoms.push(new MathTree_1.Multiply(lastAtom, nextAtom));
                }
            }
            else {
                processedAtoms.push(atom);
            }
        }
        atoms = processedAtoms;
        processedAtoms = [];
        // Divide
        while (atoms.length > 0) {
            // Can't be undefined, as we checked the length
            const atom = atoms.shift();
            if (atom instanceof MathTree_1.StringSymbol && atom.value === '/') {
                // atoms = [..., / ] or [ /, ...] hould haved thrown an error already
                let nextAtom = atoms.shift();
                // Handle sequence a / - b
                if (nextAtom instanceof MathTree_1.StringSymbol && nextAtom.value === '-') {
                    nextAtom = new MathTree_1.Oppose(atoms.shift());
                }
                const lastAtom = processedAtoms.pop();
                processedAtoms.push(new MathTree_1.Divide(lastAtom, nextAtom));
            }
            else {
                processedAtoms.push(atom);
            }
        }
        atoms = processedAtoms;
        processedAtoms = [];
        // Multiply
        while (atoms.length > 0) {
            // Can't be undefined, as we checked the length
            const atom = atoms.shift();
            if (atom instanceof MathTree_1.StringSymbol && atom.value === '*') {
                // atoms = [..., * ] or [ *, ...] hould haved thrown an error already
                let nextAtom = atoms.shift();
                // Handle sequence a * - b
                if (nextAtom instanceof MathTree_1.StringSymbol && nextAtom.value === '-') {
                    nextAtom = new MathTree_1.Oppose(atoms.shift());
                }
                const lastAtom = processedAtoms.pop();
                if (lastAtom instanceof MathTree_1.Multiply && nextAtom instanceof MathTree_1.Multiply) {
                    processedAtoms.push(new MathTree_1.Multiply(...lastAtom.factors, ...nextAtom.factors));
                }
                else if (lastAtom instanceof MathTree_1.Multiply) {
                    processedAtoms.push(new MathTree_1.Multiply(...lastAtom.factors, nextAtom));
                }
                else if (nextAtom instanceof MathTree_1.Multiply) {
                    processedAtoms.push(new MathTree_1.Multiply(lastAtom, ...nextAtom.factors));
                }
                else {
                    processedAtoms.push(new MathTree_1.Multiply(lastAtom, nextAtom));
                }
            }
            else {
                processedAtoms.push(atom);
            }
        }
        atoms = processedAtoms;
        processedAtoms = [];
        // Minus => Oppose
        while (atoms.length > 0) {
            // Can't be undefined, as we checked the length
            const atom = atoms.shift();
            if (atom instanceof MathTree_1.StringSymbol && atom.value === '-') {
                // atoms = [..., - ] should haved thrown an error already
                const nextAtom = atoms.shift();
                processedAtoms.push(new MathTree_1.Oppose(nextAtom));
            }
            else {
                processedAtoms.push(atom);
            }
        }
        atoms = processedAtoms;
        processedAtoms = [];
        // Add
        while (atoms.length > 0) {
            // Can't be undefined, as we checked the length
            const atom = atoms.shift();
            if (atom instanceof MathTree_1.StringSymbol && atom.value === '+') {
                // atoms = [ +, ...] already dealt with [..., + ] should haved thrown an error already
                const nextAtom = atoms.shift();
                const lastAtom = processedAtoms.pop();
                if (lastAtom instanceof MathTree_1.Add && nextAtom instanceof MathTree_1.Add) {
                    processedAtoms.push(new MathTree_1.Add(...lastAtom.terms, ...nextAtom.terms));
                }
                else if (lastAtom instanceof MathTree_1.Add) {
                    processedAtoms.push(new MathTree_1.Add(...lastAtom.terms, nextAtom));
                }
                else if (nextAtom instanceof MathTree_1.Add) {
                    processedAtoms.push(new MathTree_1.Add(lastAtom, ...nextAtom.terms));
                }
                else {
                    processedAtoms.push(new MathTree_1.Add(lastAtom, nextAtom));
                }
            }
            else {
                processedAtoms.push(atom);
            }
        }
        atoms = processedAtoms;
        processedAtoms = [];
        // Check that we fully collapsed the tree
        switch (atoms.length) {
            case 0:
                return new MathTree_1.Empty();
            case 1:
                return atoms[0];
            /* istanbul ignore next */
            default:
                throw new errors_1.UnexpectedError(`Some unknown error happened while parsing operations. Final state : ${JSON.stringify(atoms)}. `);
        }
    }
}
exports.ParseMath = ParseMath;


/***/ }),

/***/ 759:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Quantity = void 0;
const errors_1 = __webpack_require__(725);
const abstract_unit_1 = __webpack_require__(176);
const unit_1 = __webpack_require__(281);
class Quantity {
    unit;
    value;
    constructor(value, unit) {
        this.value = value;
        this.unit = unit;
    }
    static zero(unit = unit_1.Unit.ONE) {
        return new Quantity(0, unit);
    }
    // One must be dynamically initialized because Quantity and One refer to each other, so on load, one of them isn't declared yet
    static _ONE;
    static get ONE() {
        Quantity._ONE ??= new Quantity(1, unit_1.Unit.ONE);
        return Quantity._ONE;
    }
    static isNull(quantity) {
        if (typeof quantity === "number") {
            return quantity === 0;
        }
        return quantity.value === 0;
    }
    isEqual(quantity) {
        return this.value === quantity.value && this.unit.isEqual(quantity.unit);
    }
    isDeltaEqual(quantity) {
        return this.value === quantity.value && this.unit.isDeltaEqual(quantity.unit);
    }
    isEquivalent(quantity) {
        if (!this.unit.isSameDimension(quantity.unit)) {
            return false;
        }
        return this.isEqual(quantity.convert(this.unit));
    }
    add(quantity) {
        if (typeof quantity === 'number') {
            if (!this.unit.isDimensionless()) {
                throw new errors_1.UnitMismatchError(`${this.unit} isn't dimensionless. `);
            }
            else {
                return new Quantity(this.convert(unit_1.Unit.ONE).value + quantity, unit_1.Unit.ONE);
            }
        }
        else if (!this.unit.isSameDimension(quantity.unit)) {
            throw new errors_1.UnitMismatchError(`${this.unit} doesn't match ${quantity.unit}. `);
        }
        // If both units have the same dimensions but aren't equal, perform conversion into the current unit
        // The added quantity is a delta, so we want to drop all offsets.
        if (!this.unit.isEqual(quantity.unit)) {
            quantity = quantity.deltaQuantity().convert(this.unit.deltaUnit());
        }
        return new Quantity(this.value + quantity.value, this.unit);
    }
    oppose() {
        return new Quantity(-this.value, this.unit);
    }
    multiply(quantity) {
        if (quantity instanceof Quantity) {
            // Unit multiplication assumes that both units are deltas, so we don't need to do it here
            return new Quantity(this.value * quantity.value, this.unit.multiply(quantity.unit));
        }
        else if (quantity instanceof abstract_unit_1.AbstractUnit) {
            return new Quantity(this.value, this.unit.multiply(quantity));
        }
        return new Quantity(this.value * quantity, this.unit);
    }
    divide(quantity) {
        if (quantity instanceof abstract_unit_1.AbstractUnit) {
            return new Quantity(this.value, this.unit.divide(quantity));
        }
        if (Quantity.isNull(quantity)) {
            throw new errors_1.ValueError(`Division by 0. `);
        }
        if (quantity instanceof Quantity) {
            // Unit division assumes that both units are deltas, so we don't need to do it here
            return new Quantity(this.value / quantity.value, this.unit.divide(quantity.unit));
        }
        return new Quantity(this.value / quantity, this.unit);
    }
    power(power) {
        if ((power <= 0 && this.value === 0) || (this.value < 0 && !Number.isInteger(power))) {
            throw new errors_1.ValueError(`The result of power operation is undefined for value=${this.value} and power=${power}. `);
        }
        // Unit power raising assumes that units are deltas, so we don't need to do it here
        return new Quantity(this.value !== 0 ? this.value ** power : 0, this.unit.power(power));
    }
    convert(newUnit) {
        if (!this.unit.isSameDimension(newUnit)) {
            // FIXME: units display as [Object object]
            throw new errors_1.UnitMismatchError(`${this.unit} doesn't match ${newUnit}. `);
        }
        return new Quantity((this.value * this.unit.coeff + this.unit.offset - newUnit.offset) / newUnit.coeff, newUnit);
    }
    deltaQuantity() {
        return new Quantity(this.value, this.unit.deltaUnit());
    }
    toString() {
        return `${this.value} ${this.unit.preferredSymbol}`;
    }
}
exports.Quantity = Quantity;


/***/ }),

/***/ 418:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PREFIXES = exports.UNITS = void 0;
const prefix_1 = __webpack_require__(395);
const unit_1 = __webpack_require__(281);
// ----------
//  Units
// ----------
exports.UNITS = [
    // --------------
    // Basic SI units
    // --------------
    new unit_1.Unit('m', 'meter', { L: 1 }),
    new unit_1.Unit('g', 'gram', { M: 1 }, 10, 1e-3),
    new unit_1.Unit('s', 'second', { T: 1 }),
    new unit_1.Unit('A', 'ampere', { I: 1 }),
    new unit_1.Unit('K', 'kelvin', { THETA: 1 }),
    new unit_1.Unit('mol', 'mole', { N: 1 }),
    new unit_1.Unit('cd', 'candela', { J: 1 }),
    // ----------------
    // Derived SI units
    // ----------------
    new unit_1.Unit('Hz', 'hertz', { T: -1 }),
    new unit_1.Unit('N', 'newton', { M: 1, L: 1, T: -2 }),
    new unit_1.Unit('Pa', 'pascal', { M: 1, L: -1, T: -2 }),
    new unit_1.Unit('J', 'joule', { M: 1, L: 2, T: -2 }),
    new unit_1.Unit('W', 'watt', { M: 1, L: 2, T: -3 }),
    new unit_1.Unit('C', 'coulomb', { T: 1, I: 1 }),
    new unit_1.Unit('V', 'volt', { M: 1, L: 2, T: -3, I: -1 }),
    new unit_1.Unit('Ω', 'ohm', { M: 1, L: 2, T: -3, I: -2 }),
    new unit_1.Unit('S', 'siemens', { M: -1, L: -2, T: 3, I: 2 }),
    new unit_1.Unit('F', 'farad', { M: -1, L: -2, T: 4, I: 2 }),
    new unit_1.Unit('T', 'tesla', { M: 1, T: -2, I: -1 }),
    new unit_1.Unit('Wb', 'weber', { M: 1, L: 2, T: -2, I: -1 }),
    new unit_1.Unit('H', 'henry', { M: 1, L: 2, T: -2, I: -2 }),
    new unit_1.Unit(['°C', '˚C'], 'celsius', { THETA: 1 }, 10, 1, 273.15),
    new unit_1.Unit('rad', 'radian', { A: 1 }),
    new unit_1.Unit('sr', 'steradian', { A: 2 }),
    new unit_1.Unit('lm', 'lumen', { J: 1 }),
    new unit_1.Unit('lx', 'lux', { L: -2, J: 1 }),
    new unit_1.Unit('Bq', 'becquerel', { T: -1 }),
    new unit_1.Unit('Gy', 'gray', { L: 2, T: -2 }),
    new unit_1.Unit('Sv', 'sievert', { L: 2, T: -2 }),
    new unit_1.Unit('kat', 'katal', { T: -1, N: 1 }),
    new unit_1.Unit('L', 'Liter', { L: 3 }, 10, 1e-3),
    // -----------------
    // Imperial system
    // -----------------
    new unit_1.Unit(['°F', '˚F'], 'fahrenheit', { THETA: 1 }, 10, 5 / 9, 273.15 - 32 * 5 / 9),
    new unit_1.Unit('th', 'thou', { L: 1 }, 10, 2.54e-5, 0, false),
    new unit_1.Unit(['in', "''"], 'inch', { L: 1 }, 10, 2.54e-2, 0, false),
    new unit_1.Unit('hh', 'hand', { L: 1 }, 10, 0.1016, 0, false),
    new unit_1.Unit(['ft', "'"], 'foot', { L: 1 }, 10, 0.3048, 0, false),
    new unit_1.Unit('yd', 'yard', { L: 1 }, 10, 0.9144, 0, false),
    new unit_1.Unit('li', 'link', { L: 1 }, 10, 0.2011684, 0, false),
    new unit_1.Unit('rd', 'rod', { L: 1 }, 10, 5.029210, 0, false),
    new unit_1.Unit('ch', 'chain', { L: 1 }, 10, 20.1168, 0, false),
    new unit_1.Unit('fur', 'furlong', { L: 1 }, 10, 201.168, 0, false),
    new unit_1.Unit('mi', 'mile', { L: 1 }, 10, 1609.344, 0, false),
    new unit_1.Unit('lea', 'league', { L: 1 }, 10, 4828.032, 0, false),
    new unit_1.Unit('ftm', 'fathom', { L: 1 }, 10, 1.8288, 0, false),
    new unit_1.Unit('cb', 'cable', { L: 1 }, 10, 219.456, 0, false),
    new unit_1.Unit('nmi', 'nautic mile', { L: 1 }, 10, 1852, 0, false),
    new unit_1.Unit('lb', 'pound', { M: 1 }, 10, 0.45359237, 0, false),
    new unit_1.Unit('oz', 'ounce', { M: 1 }, 10, 0.00002835, 0, false),
    // -------------------
    // Miscellaneous units
    // -------------------
    new unit_1.Unit('bar', 'bar', { M: 1, L: -1, T: -2 }, 10, 1e5),
    new unit_1.Unit('min', 'minute', { T: 1 }, 10, 60, 0, false),
    new unit_1.Unit('h', 'hour', { T: 1 }, 10, 3600, 0, false),
    new unit_1.Unit('b', 'bit', { D: 1 }, 2),
    new unit_1.Unit('B', 'byte', { D: 1 }, 2, 8)
];
exports.PREFIXES = [
    // -----------------
    // Decimal Prefixes
    // -----------------
    new prefix_1.Prefix('Q', 'quetta', 10, 30),
    new prefix_1.Prefix('R', 'ronna', 10, 27),
    new prefix_1.Prefix('Y', 'yotta', 10, 24),
    new prefix_1.Prefix('Z', 'zetta', 10, 21),
    new prefix_1.Prefix('E', 'exa', 10, 18),
    new prefix_1.Prefix('P', 'peta', 10, 15),
    new prefix_1.Prefix('T', 'tera', 10, 12),
    new prefix_1.Prefix('G', 'giga', 10, 9),
    new prefix_1.Prefix('M', 'mega', 10, 6),
    new prefix_1.Prefix('k', 'kilo', 10, 3),
    new prefix_1.Prefix('h', 'hecto', 10, 2),
    new prefix_1.Prefix('da', 'deca', 10, 1),
    new prefix_1.Prefix('d', 'deci', 10, -1),
    new prefix_1.Prefix('c', 'centi', 10, -2),
    new prefix_1.Prefix('m', 'mili', 10, -3),
    new prefix_1.Prefix('µ', 'micro', 10, -6),
    new prefix_1.Prefix('n', 'nano', 10, -9),
    new prefix_1.Prefix('p', 'pico', 10, -12),
    new prefix_1.Prefix('f', 'femto', 10, -15),
    new prefix_1.Prefix('a', 'atto', 10, -18),
    new prefix_1.Prefix('z', 'zepto', 10, -21),
    new prefix_1.Prefix('y', 'yocto', 10, -24),
    new prefix_1.Prefix('r', 'ronto', 10, -27),
    new prefix_1.Prefix('q', 'quecto', 10, -30),
    // ----------------
    // Binary Prefixes
    // ----------------
    new prefix_1.Prefix('Qi', 'quebi', 2, 100),
    new prefix_1.Prefix('Ri', 'robi', 2, 90),
    new prefix_1.Prefix('Yi', 'yobi', 2, 80),
    new prefix_1.Prefix('Zi', 'zebi', 2, 70),
    new prefix_1.Prefix('Ei', 'exbi', 2, 60),
    new prefix_1.Prefix('Pi', 'pebi', 2, 50),
    new prefix_1.Prefix('Ti', 'tebi', 2, 40),
    new prefix_1.Prefix('Gi', 'gibi', 2, 30),
    new prefix_1.Prefix('Mi', 'mebi', 2, 20),
    new prefix_1.Prefix('Ki', 'kibi', 2, 10)
];


/***/ }),

/***/ 93:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initModules = initModules;
function initModules(scriptModules) {
    exports.logger = scriptModules.logger;
    exports.frontendCommunicator = scriptModules.frontendCommunicator;
    exports.effectRunner = scriptModules.effectRunner;
    exports.effectManager = scriptModules.effectManager;
    exports.eventManager = scriptModules.eventManager;
    exports.eventFilterManager = scriptModules.eventFilterManager;
    exports.variableManager = scriptModules.replaceVariableManager;
    exports.integrationManager = scriptModules.integrationManager;
    exports.jsonDb = scriptModules.JsonDb;
    exports.utils = scriptModules.utils;
    exports.httpServer = scriptModules.httpServer;
}


/***/ }),

/***/ 206:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VariableCategory = exports.OutputDataType = void 0;
/**
 * Enum for a variable's possible output data type.
 * @readonly
 * @enum {string}
 */
var OutputDataType;
(function (OutputDataType) {
    OutputDataType["NULL"] = "null";
    OutputDataType["BOOLEAN"] = "bool";
    OutputDataType["NUMBER"] = "number";
    OutputDataType["TEXT"] = "text";
    OutputDataType["ARRAY"] = "array";
    OutputDataType["OBJECT"] = "object";
    OutputDataType["ALL"] = "ALL";
})(OutputDataType || (exports.OutputDataType = OutputDataType = {}));
/**
 * Enum for variable categories.
 * @readonly
 * @enum {string}
 */
var VariableCategory;
(function (VariableCategory) {
    VariableCategory["COMMON"] = "common";
    VariableCategory["TRIGGER"] = "trigger based";
    VariableCategory["USER"] = "user based";
    VariableCategory["TEXT"] = "text";
    VariableCategory["NUMBERS"] = "numbers";
    VariableCategory["ADVANCED"] = "advanced";
})(VariableCategory || (exports.VariableCategory = VariableCategory = {}));


/***/ }),

/***/ 806:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UnitParser = void 0;
const errors_1 = __webpack_require__(725);
const unit_1 = __webpack_require__(281);
const firebot_modules_1 = __webpack_require__(93);
class UnitParser {
    static registeredUnits = {};
    static registeredPrefixes = {};
    static registerUnit(unit) {
        unit.symbols.forEach((symbol) => {
            if (symbol in UnitParser.registeredUnits) {
                firebot_modules_1.logger.warn(`UnitConverter: Unit symbol ${symbol} already in use. Couldn't register unit ${unit.name}. `);
                return;
            }
            firebot_modules_1.logger.info(`UnitConverter: Registering unit ${unit.name} under symbol ${symbol}. `);
            // Check that unit isn't already parsed as something else
            try {
                const parsedUnit = UnitParser.parseUnit(symbol);
                firebot_modules_1.logger.warn(`UnitConverter: ${unit.name}'s symbol ${symbol} is conflicting with unit ${parsedUnit.name} and being parsed as ${parsedUnit.preferredSymbol}. One of them isn't gonna work. `);
            }
            catch {
                // symbol isn't conflicting with any of the currently registered combinations
            }
            // Check that the unit works with each registered prefix
            for (const prefixSymbol of Object.keys(UnitParser.registeredPrefixes)) {
                try {
                    if (unit.prefixable && UnitParser.registeredPrefixes[prefixSymbol].base === unit.base) {
                        const parsedUnit = UnitParser.parseUnit(`${prefixSymbol}${symbol}`);
                        firebot_modules_1.logger.warn(`UnitConverter: unit ${unit.name}'s symbol ${symbol} is conflicting with unit ${parsedUnit.name} when using prefix ${prefixSymbol}. ${prefixSymbol}${symbol} is being parsed as ${parsedUnit.preferredSymbol}. One of them isn't gonna work. `);
                    }
                }
                catch {
                    // `${prefixSymbol}${symbol}` isn't conflicting with any of the currently registered combinations
                }
            }
            UnitParser.registeredUnits[symbol] = unit;
        });
    }
    static unregisterUnits() {
        UnitParser.registeredUnits = {};
    }
    static registerPrefix(prefix) {
        if (prefix.symbol in UnitParser.registeredPrefixes) {
            firebot_modules_1.logger.warn(`UnitConverter: Prefix symbol ${prefix.symbol} already in use. Couldn't register prefix ${prefix.name}. `);
            return;
        }
        firebot_modules_1.logger.info(`UnitConverter: Registering prefix ${prefix.name} under symbol ${prefix.symbol}. `);
        // Check the prefix works with each registered unit
        for (const unitSymbol of Object.keys(UnitParser.registeredUnits)) {
            try {
                if (prefix.base === UnitParser.registeredUnits[unitSymbol].base && UnitParser.registeredUnits[unitSymbol].prefixable) {
                    const parsedUnit = UnitParser.parseUnit(`${prefix.symbol}${unitSymbol}`);
                    firebot_modules_1.logger.warn(`UnitConverter: Prefix ${prefix.name}'s symbol ${prefix.symbol} is creating a conflict between units ${UnitParser.registeredUnits[unitSymbol].name} and ${parsedUnit.name}. ${prefix.symbol}${unitSymbol} is being parsed as ${parsedUnit.preferredSymbol}. One of them isn't gonna work. `);
                }
            }
            catch {
                // `${prefix.symbol}${unitSymbol}` isn't conflicting with any of the currently registered combinations
            }
        }
        UnitParser.registeredPrefixes[prefix.symbol] = prefix;
    }
    static unregisterPrefixes() {
        UnitParser.registeredPrefixes = {};
    }
    static parseUnit(candidate) {
        candidate = candidate.trim();
        let unitSymbol = '';
        let prefixSymbol = '';
        for (let prefixLength = candidate.length - 1; prefixLength >= 0; prefixLength--) {
            const symbol = candidate.substring(prefixLength);
            prefixSymbol = candidate.substring(0, prefixLength);
            if (symbol in UnitParser.registeredUnits && (prefixLength === 0 || (prefixSymbol in UnitParser.registeredPrefixes && UnitParser.registeredUnits[symbol].prefixable))) {
                unitSymbol = symbol;
                break;
            }
        }
        if (unitSymbol) {
            const foundUnit = UnitParser.registeredUnits[unitSymbol];
            if (prefixSymbol === '') {
                return new unit_1.Unit(unitSymbol, foundUnit.name, foundUnit.dimensions, foundUnit.base, foundUnit.coeff, foundUnit.offset);
            }
            const prefix = UnitParser.registeredPrefixes[prefixSymbol];
            return foundUnit.applyPrefix(prefix, unitSymbol);
        }
        throw new errors_1.UnitNotFoundError(candidate);
    }
    static findPrefixFromFactor(desiredFactor, base) {
        for (const prefix of Object.values(UnitParser.registeredPrefixes)) {
            if (desiredFactor === prefix.factor && (!base || base === prefix.base)) {
                return prefix;
            }
        }
        return null;
    }
    static findPrefixFromExponent(exponent, base = 10) {
        for (const prefix of Object.values(UnitParser.registeredPrefixes)) {
            if (exponent === prefix.exponent && base === prefix.base) {
                return prefix;
            }
        }
        return null;
    }
    static findBestPrefixFromExponent(exponent, base = 10) {
        let currentBestPrefix;
        let currentBestExponent = 0;
        for (const prefix of Object.values(UnitParser.registeredPrefixes)) {
            if (base === prefix.base && prefix.exponent / exponent > 0 && prefix.exponent / exponent <= 1 && currentBestExponent / prefix.exponent < 1) {
                //logger.debug(`Looking for exponent ${exponent}, ${prefix.name} (${prefix.exponent}) is better than ${currentBestPrefix?.name} (${currentBestExponent})`);
                currentBestPrefix = prefix;
                currentBestExponent = prefix.exponent;
            }
            else {
                //logger.debug(`Looking for exponent ${exponent}, ${prefix.name} (${prefix.exponent}) is worse than ${currentBestPrefix?.name} (${currentBestExponent})`);
            }
        }
        return currentBestPrefix ? currentBestPrefix : null;
    }
    static findNextPrefixFromExponent(exponent, base = 10) {
        let currentBestPrefix;
        let currentBestExponent = 0;
        if (exponent === 0) {
            return null;
        }
        for (const prefix of Object.values(UnitParser.registeredPrefixes)) {
            if (base === prefix.base && prefix.exponent / exponent >= 1 && (currentBestExponent === 0 || currentBestExponent / prefix.exponent > 1)) {
                //logger.debug(`Looking for exponent ${exponent}, ${prefix.name} (${prefix.exponent}) is better than ${currentBestPrefix?.name} (${currentBestExponent})`);
                currentBestPrefix = prefix;
                currentBestExponent = prefix.exponent;
            }
            else {
                //logger.debug(`Looking for exponent ${exponent}, ${prefix.name} (${prefix.exponent}) is worse than ${currentBestPrefix?.name} (${currentBestExponent})`);
            }
        }
        return currentBestPrefix ? currentBestPrefix : null;
    }
}
exports.UnitParser = UnitParser;


/***/ }),

/***/ 490:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(952), exports);
__exportStar(__webpack_require__(307), exports);


/***/ }),

/***/ 307:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.unitConvertVariable = void 0;
const variable_constants_1 = __webpack_require__(206);
const math_parser_1 = __webpack_require__(730);
const firebot_modules_1 = __webpack_require__(93);
const abstract_unit_1 = __webpack_require__(176);
const errors_1 = __webpack_require__(725);
const quantity_1 = __webpack_require__(759);
const unit_1 = __webpack_require__(281);
const unit_parser_1 = __webpack_require__(806);
const prefixed_unit_1 = __webpack_require__(893);
exports.unitConvertVariable = {
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
        categories: [variable_constants_1.VariableCategory.COMMON, variable_constants_1.VariableCategory.NUMBERS],
        possibleDataOutput: [variable_constants_1.OutputDataType.TEXT]
    },
    evaluator: function (trigger, subject, target) {
        try {
            const parsedSubject = math_parser_1.ParseMath.match(subject).parseUnits().collapse();
            let parsedTarget = math_parser_1.ParseMath.match(target).parseUnits().collapse();
            if (!(parsedTarget instanceof abstract_unit_1.AbstractUnit)) {
                throw new errors_1.ValueError('The target must be a valid unit. ');
            }
            if (parsedSubject === null) {
                throw new errors_1.ValueError('Invalid expression to convert. ');
            }
            let filteredSubject;
            if (typeof parsedSubject === 'number') {
                filteredSubject = new quantity_1.Quantity(parsedSubject, unit_1.Unit.ONE);
            }
            else if (parsedSubject instanceof quantity_1.Quantity) {
                filteredSubject = parsedSubject;
            }
            else {
                filteredSubject = new quantity_1.Quantity(1, parsedSubject);
            }
            // We convert C to °C and F to °F if :
            // - Both are either C or F
            // - Once is C or F and the other one is a temperature unit
            if ((['C', 'F'].includes(filteredSubject.unit.preferredUnitSymbol) || filteredSubject.unit.isSameDimension(unit_parser_1.UnitParser.registeredUnits['K']))
                && (['C', 'F'].includes(parsedTarget.preferredUnitSymbol) || parsedTarget.isSameDimension(unit_parser_1.UnitParser.registeredUnits['K']))) {
                let newSubjectUnit = null;
                if (filteredSubject.unit.preferredUnitSymbol === 'C') {
                    newSubjectUnit = unit_parser_1.UnitParser.registeredUnits['°C'];
                }
                else if (filteredSubject.unit.preferredUnitSymbol === 'F') {
                    newSubjectUnit = unit_parser_1.UnitParser.registeredUnits['°F'];
                }
                let newTargetUnit = null;
                if (parsedTarget.preferredUnitSymbol === 'C') {
                    newTargetUnit = unit_parser_1.UnitParser.registeredUnits['°C'];
                }
                else if (parsedTarget.preferredUnitSymbol === 'F') {
                    newTargetUnit = unit_parser_1.UnitParser.registeredUnits['°F'];
                }
                if (newSubjectUnit !== null && filteredSubject.unit instanceof unit_1.Unit) {
                    filteredSubject.unit = newSubjectUnit;
                }
                else if (newSubjectUnit !== null && filteredSubject.unit instanceof prefixed_unit_1.PrefixedUnit) {
                    filteredSubject.unit = new prefixed_unit_1.PrefixedUnit(filteredSubject.unit.prefix, newSubjectUnit);
                }
                if (newTargetUnit !== null && parsedTarget instanceof unit_1.Unit) {
                    parsedTarget = newTargetUnit;
                }
                else if (newTargetUnit !== null && parsedTarget instanceof prefixed_unit_1.PrefixedUnit) {
                    parsedTarget = new prefixed_unit_1.PrefixedUnit(parsedTarget.prefix, newTargetUnit);
                }
            }
            const result = filteredSubject.convert(parsedTarget);
            return `${result.toString()}`;
        }
        catch (err) {
            if (err instanceof errors_1.UnitConverterError) {
                firebot_modules_1.logger.debug(err.message);
                return err.originalMessage;
            }
            else if (err instanceof Error) {
                firebot_modules_1.logger.debug(err.message);
                return err.message;
            }
            firebot_modules_1.logger.debug(err);
            return '';
        }
    }
};


/***/ }),

/***/ 952:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.unitMathVariable = void 0;
const variable_constants_1 = __webpack_require__(206);
const math_parser_1 = __webpack_require__(730);
const firebot_modules_1 = __webpack_require__(93);
const errors_1 = __webpack_require__(725);
exports.unitMathVariable = {
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
                description: `Returns 1 kg*L^-1`
            }
        ],
        categories: [variable_constants_1.VariableCategory.COMMON, variable_constants_1.VariableCategory.NUMBERS],
        possibleDataOutput: [variable_constants_1.OutputDataType.TEXT]
    },
    evaluator: function (trigger, subject) {
        try {
            return math_parser_1.ParseMath.match(subject).parseUnits().collapse()?.toString() ?? '';
        }
        catch (err) {
            if (err instanceof errors_1.UnitConverterError) {
                firebot_modules_1.logger.debug(err.message);
                return err.originalMessage;
            }
            else if (err instanceof Error) {
                firebot_modules_1.logger.debug(err.message);
                return err.message;
            }
            firebot_modules_1.logger.debug(err);
            return '';
        }
    }
};


/***/ }),

/***/ 330:
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"name":"firebot-convert-unit","scriptOutputName":"firebot-convert-unit","version":"0.0.0","description":"A Firebot plugin to convert from one unit to another.","main":"","scripts":{"build":"webpack","build:dev":"npm run build && npm run copy","copy":"node ./scripts/copy-build.js","test":"jest --coverage"},"author":"Alastor_","license":"MIT","devDependencies":{"@crowbartools/firebot-custom-scripts-types":"^5.53.2-6","@eslint/eslintrc":"^3.2.0","@eslint/js":"^9.19.0","@types/express":"^4.17.1","@types/jest":"^29.5.14","@types/node":"^18.18.2","@types/regex-escape":"^3.4.1","@types/ws":"^8.2.2","@typescript-eslint/eslint-plugin":"^8.22.0","@typescript-eslint/parser":"^8.22.0","eslint":"^9.19.0","eslint-plugin-promise":"^7.2.1","globals":"^15.14.0","jest":"^29.7.0","node-json-db":"^2.3.1","prettier":"^3.1.0","prettier-eslint":"^16.1.2","terser-webpack-plugin":"^5.3.10","tiny-typed-emitter":"^2.1.0","ts-jest":"^29.2.5","ts-loader":"^9.5.1","ts-node":"^10.9.2","typescript":"^5.7.3","typescript-eslint":"^8.22.0","webpack":"^5.90.0","webpack-cli":"^5.1.4","ws":"^8.2.2"},"dependencies":{"regex-escape":"^3.4.10"}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(927);
/******/ 	module.exports = __webpack_exports__["default"];
/******/ 	
/******/ })()
;