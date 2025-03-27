export class Prefix {
    symbol: string;
    name: string;
    factor: number;
    _base: number;
    _exponent: number;

    constructor(symbol: string, name: string, base: number, exponent: number) {
        this.symbol = symbol;
        this.name = name;
        this._base = base;
        this._exponent = exponent;
        this.factor = base ** exponent;
    }

    get base(): number {
        return this._base;
    }

    set base(value: number) {
        this._base = value;
        this.factor = this._base ** this._exponent;
    }

    get exponent(): number {
        return this._exponent;
    }

    set exponent(value: number) {
        this._exponent = value;
        this.factor = this._base ** this._exponent;
    }

    copy() {
        return new Prefix(this.symbol, this.name, this.base, this.exponent);
    }
}