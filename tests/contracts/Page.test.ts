import { Router } from "express";
import { Page } from "../../src/contracts/Page";

describe('Constructor', () => {
    test('Parameters should be set', () => {
        const router = {} as unknown as Router;

        const page = new Page(router);

        expect(page.router).toBeDefined();
    });
});

describe('Route', () => {
    test('Expect methods to be called', () => {
        const router = {} as unknown as Router;

        const page = new Page(router);
        
        const onGet = jest.spyOn(page, 'OnGet');
        const onPost = jest.spyOn(page, 'OnPost');

        page.Route();

        expect(onGet).toBeCalledTimes(1);
        expect(onPost).toBeCalledTimes(1);
    });
});