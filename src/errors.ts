class UnitConverterError extends Error {
    constructor(message: string) {
        super(`Unitconverter: ${message}`);

        this.name = "UnitConverterError";

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UnitConverterError.prototype);
    }
}

export class UnitError extends UnitConverterError {
    constructor(message: string) {
        super(`Unit error : ${message}`);

        this.name = "UnitError";

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UnitError.prototype);
    }

}

export class PrefixError extends UnitConverterError {
    constructor(message: string) {
        super(`Prefix error : ${message}`);

        this.name = "PrefixError";

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, PrefixError.prototype);
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
        super(`Unit not found in "${message}"`);

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

export class DelimiterError extends UnitConverterError {
    constructor(message: string) {
        super(`Delimiter Error. ${message}`);

        this.name = "DelimiterError";

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DelimiterError.prototype);
    }

}

export class DepthLimitExceededError extends UnitConverterError {
    constructor() {
        super(`Depth limit exceeded while parsing`);

        this.name = "DepthLimitExceededError";

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DepthLimitExceededError.prototype);
    }

}

export class InvalidOperation extends UnitConverterError {
    constructor(message: string) {
        super(`Math operation invalid Error. ${message}`);

        this.name = "InvalidOperation";

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, InvalidOperation.prototype);
    }

}

export class UnexpectedError extends UnitConverterError {
    constructor(message: string) {
        super(`Unexpected Error. ${message}`);

        this.name = "UnexpectedError";

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UnexpectedError.prototype);
    }

}

