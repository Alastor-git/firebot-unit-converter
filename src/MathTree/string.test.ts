import "@/mocks/firebot-modules";
import { UnitParser } from '@/unit-parser';
import { UnitNotFoundError, ValueError } from "@/errors";
import { Unit } from '@/Unit/unit';
import { Prefix } from '@/Unit/prefix';
import { StringSymbol } from './string';
import { UnitSymbol } from "./unit";

test('constructor', () => {
    expect(new StringSymbol('a')).toMatchObject({value: 'a'});
});

test('parseUnits', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const prefix_k: Prefix = new Prefix('k', 'kilo', 10, 3); // eslint-disable-line camelcase

    UnitParser.registerUnit(unitA);
    UnitParser.registerPrefix(prefix_k);

    expect(new StringSymbol('A').parseUnits()).toMatchObject(new UnitSymbol(unitA));
    expect(new StringSymbol('kA').parseUnits()).toMatchObject(new UnitSymbol(unitA.applyPrefix(prefix_k, 'A')));
    expect(() => new StringSymbol('kB').parseUnits()).toThrow(UnitNotFoundError);
});

test('collapse', () => {
    expect(() => new StringSymbol('a').collapse()).toThrow(ValueError);
});