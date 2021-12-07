import { mock } from "jest-mock-extended";

import { Application, Request, Response, Router } from "express";
import Unassign from "../../../../src/routes/tasks/assign/unassign";
import { User } from "../../../../src/entity/User";
import { Task } from "../../../../src/entity/Task";

describe('OnPost', () => {
    test('Given user is unassigned, expect success message redirect', async (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.body = {
            taskString: 'taskString-1'
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.success).toBe('Unassigned user from task');
            expect(path).toBe('/tasks/view/taskString-1');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/assign/unassign');

            callback[1](req, res);

            return router;
        });

        Task.UnassignUserFromTask = jest.fn().mockResolvedValueOnce(true);

        const unassign = new Unassign(router);

        unassign.OnPost();
    });

    test('Given taskString is empty, expect failure message redirect', async (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.body = {};
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('Not found');
            expect(path).toBe('/tasks/list');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/assign/unassign');

            callback[1](req, res);

            return router;
        });

        Task.UnassignUserFromTask = jest.fn().mockResolvedValueOnce(true);

        const unassign = new Unassign(router);

        unassign.OnPost();
    });

    test('Given result is failure, expect failure message redirect', async (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.body = {
            taskString: 'taskString-1'
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('Unable to unassign user from task');
            expect(path).toBe('/tasks/view/taskString-1');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/assign/unassign');

            callback[1](req, res);

            return router;
        });

        Task.UnassignUserFromTask = jest.fn().mockResolvedValueOnce(false);

        const unassign = new Unassign(router);

        unassign.OnPost();
    });
});