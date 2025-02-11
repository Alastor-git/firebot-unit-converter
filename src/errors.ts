class UnitConverterError extends Error {
    constructor(message: string) {
        super(`Unitconverter: ${message}`);

        this.name = "UnitConverterError";

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UnitConverterError.prototype);
    }
}

export class UnitMismatchError extends UnitConverterError {
    constructor(message: string) {
        super(`Unit mismatch : ${message}`);

        this.name = "UnitMismatchError";

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UnitMismatchError.prototype);
    }

}

export class UnitNotFoundError extends UnitConverterError {
    constructor(message: string) {
        super(`Unit not found in ${message}`);

        this.name = "UnitNotFoundError";

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UnitNotFoundError.prototype);
    }

}

export class ValueError extends UnitConverterError {
    constructor(message: string) {
        super(`Invalid parameter value. ${message}`);

        this.name = "ValueError";

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ValueError.prototype);
    }

}