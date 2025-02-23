import { Unit } from "@/unit";
import { Prefix } from "@/prefix";
import { UnitSymbol } from "./unit";


test('constructor', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const prefix_k: Prefix = new Prefix('k', 'kilo', 1e3); // eslint-disable-line camelcase
    const unitkA: Unit = unitA.applyPrefix(prefix_k);

    expect(new UnitSymbol(unitA)).toMatchObject({value: unitA});
    expect(new UnitSymbol(unitkA)).toMatchObject({value: unitkA});
});

test('parseUnits', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const prefix_k: Prefix = new Prefix('k', 'kilo', 1e3); // eslint-disable-line camelcase
    const unitkA: Unit = unitA.applyPrefix(prefix_k);

    expect(new UnitSymbol(unitA).parseUnits()).toMatchObject(new UnitSymbol(unitA));
    expect(new UnitSymbol(unitkA).parseUnits()).toMatchObject(new UnitSymbol(unitA.applyPrefix(prefix_k)));
});

test('collapse', () => {
    const unitA: Unit = new Unit('A', 'unit A', {L: 1}, 2, 1);
    const prefix_k: Prefix = new Prefix('k', 'kilo', 1e3); // eslint-disable-line camelcase
    const unitkA: Unit = unitA.applyPrefix(prefix_k);

    expect(new UnitSymbol(unitA).collapse()).toMatchObject(unitA);
    expect(new UnitSymbol(unitkA).collapse()).toMatchObject(unitkA);
});