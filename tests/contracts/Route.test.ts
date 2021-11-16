import { Route } from "../../src/contracts/Route";

beforeEach(() => {
    jest.mock('express');
});

describe('Constructor', () => {
    test('Parameters should be set', () => {
        const route = new Route();

        expect(route.router).toBeDefined();
    });
});

describe('Route', () => {
    test('Expect router to be returned', () => {
        const route = new Route();

        const router = route.router;

        const result = route.Route();

        expect(result).toBe(router);
    });
});