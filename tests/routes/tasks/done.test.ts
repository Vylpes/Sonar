import { mock } from "jest-mock-extended";

import { Application, Request, Response, Router } from "express";
import Page from "../../../src/routes/tasks/done";
import { User } from "../../../src/entity/User";
import { Task } from "../../../src/entity/Task";

describe('OnPost', () => {
    test('Given toggle was successful, expect redirect with no error message', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.body = {
            taskString: 'taskString-1',
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementation((path: string) => {
            expect(path).toBe('/tasks/view/taskString-1');
            expect(req.session.error).toBeUndefined();

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementation((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/done');

            callback[1](req, res);

            return router;
        });

        Task.ToggleTaskCompleteStatus = jest.fn().mockResolvedValue(true);

        const page = new Page(router);
        page.OnPost();
    });

    test('Given taskString is null, expect error redirect', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.body = {};
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementation((path: string) => {
            expect(path).toBe('/tasks/list');
            expect(req.session.error).toBe('All fields are required');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementation((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/done');

            callback[1](req, res);

            return router;
        });

        Task.ToggleTaskCompleteStatus = jest.fn().mockResolvedValue(true);

        const page = new Page(router);
        page.OnPost();
    });

    test('Given toggle failed, expect error redirect', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.body = {
            taskString: 'taskString-1',
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementation((path: string) => {
            expect(path).toBe('/tasks/view/taskString-1');
            expect(req.session.error).toBe('There was an error');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementation((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/done');

            callback[1](req, res);

            return router;
        });

        Task.ToggleTaskCompleteStatus = jest.fn().mockResolvedValue(false);

        const page = new Page(router);
        page.OnPost();
    });
});