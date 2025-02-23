import { ValueError } from "@/errors";
import { Empty } from "./empty";

test('constructor', () => {
    expect(new Empty()).toMatchObject({});
});

test('parseUnits', () => {
    expect(new Empty().parseUnits()).toMatchObject(new Empty());
});

test('collapse', () => {
    expect(() => new Empty().collapse()).toThrow(ValueError);
});