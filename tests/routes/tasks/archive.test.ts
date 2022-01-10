import { mock } from "jest-mock-extended";

import Archive from "../../../src/routes/tasks/archive";
import { Application, Request, Response, Router } from "express";
import { User } from "../../../src/entity/User";
import { Task } from "../../../src/entity/Task";

describe('OnPost', () => {
    test('Given taskString is set, expect success message', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.session.User = user;
        req.body = {
            taskString: 'taskString-1'
        };

        const res = mock<Response>();
        res.redirect.mockImplementation((path: string) => {
            expect(path).toBe('/tasks/view/taskString-1');
            expect(req.session.success).toBe('Successfully set archive status');
            expect(Task.ToggleTaskArchiveStatus).toBeCalledWith('taskString-1', user);

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementation((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/archive');

            callback[1](req, res);

            return router;
        });

        Task.ToggleTaskArchiveStatus = jest.fn().mockResolvedValue(true);

        const archive = new Archive(router);

        archive.OnPost();
    });

    test('Given taskString is null, expect error message', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.session.User = user;
        req.body = {};

        const res = mock<Response>();
        res.redirect.mockImplementation((path: string) => {
            expect(path).toBe('/tasks/list');
            expect(req.session.error).toBe('All fields are required');
            expect(Task.ToggleTaskArchiveStatus).not.toBeCalled();

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementation((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/archive');

            callback[1](req, res);

            return router;
        });

        Task.ToggleTaskArchiveStatus = jest.fn().mockResolvedValue(true);

        const archive = new Archive(router);

        archive.OnPost();
    });

    test('Given toggle failed, expect error message', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.session.User = user;
        req.body = {
            taskString: 'taskString-1'
        };

        const res = mock<Response>();
        res.redirect.mockImplementation((path: string) => {
            expect(path).toBe('/tasks/view/taskString-1');
            expect(req.session.error).toBe('There was an error, please try again');
            expect(Task.ToggleTaskArchiveStatus).toBeCalledWith('taskString-1', user);

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementation((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/archive');

            callback[1](req, res);

            return router;
        });

        Task.ToggleTaskArchiveStatus = jest.fn().mockResolvedValue(false);

        const archive = new Archive(router);

        archive.OnPost();
    });
});