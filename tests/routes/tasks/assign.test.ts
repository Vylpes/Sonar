import { mock } from "jest-mock-extended";

import Assign from "../../../src/routes/tasks/assign";
import { Application, Router, Request, Response } from "express";
import { User } from "../../../src/entity/User";
import { Task } from "../../../src/entity/Task";

describe('OnPost', () => {
    test('Given fields are valid, expect success message displayed', async (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.body = {
            taskString: 'taskString-1',
            userId: 'userId'
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.success).toBe('Assigned user to task');
            expect(path).toBe('/tasks/view/taskString-1');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/assign/assign');

            callback[1](req, res);

            return router;
        });

        Task.AssignUserToTask = jest.fn().mockResolvedValueOnce(true);
        User.GetUser = jest.fn().mockResolvedValueOnce(user);

        const assign = new Assign(router);

        assign.OnPost();
    });

    test('Given user id is to unassign, expect success message displayed', async (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.body = {
            taskString: 'taskString-1',
            userId: '{UNASSIGN}'
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.success).toBe('Assigned user to task');
            expect(path).toBe('/tasks/view/taskString-1');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/assign/assign');

            callback[1](req, res);

            return router;
        });

        Task.UnassignUserFromTask = jest.fn().mockResolvedValueOnce(true);
        User.GetUser = jest.fn().mockResolvedValueOnce(user);

        const assign = new Assign(router);

        assign.OnPost();
    });

    test('Given user id is to unassign AND result is failure, expect failure message displayed', async (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.body = {
            taskString: 'taskString-1',
            userId: '{UNASSIGN}'
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('Unable to assign user to task');
            expect(path).toBe('/tasks/view/taskString-1');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/assign/assign');

            callback[1](req, res);

            return router;
        });

        Task.UnassignUserFromTask = jest.fn().mockResolvedValueOnce(false);
        User.GetUser = jest.fn().mockResolvedValueOnce(user);

        const assign = new Assign(router);

        assign.OnPost();
    });

    test('Given taskString is empty, expect redirect to task list', async (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.body = {
            taskString: '',
            userId: 'userId'
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('Not found');
            expect(path).toBe('/tasks/list');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/assign/assign');

            callback[1](req, res);

            return router;
        });

        Task.AssignUserToTask = jest.fn().mockResolvedValueOnce(true);
        User.GetUser = jest.fn().mockResolvedValueOnce(user);

        const assign = new Assign(router);

        assign.OnPost();
    });

    test('Given userId is empty, expect redirect to task view', async (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.body = {
            taskString: 'taskString-1',
            userId: ''
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('All fields are required');
            expect(path).toBe('/tasks/view/taskString-1');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/assign/assign');

            callback[1](req, res);

            return router;
        });

        Task.AssignUserToTask = jest.fn().mockResolvedValueOnce(true);
        User.GetUser = jest.fn().mockResolvedValueOnce(user);

        const assign = new Assign(router);

        assign.OnPost();
    });

    test('Given user cant be found, expect redirect to task view', async (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.body = {
            taskString: 'taskString-1',
            userId: 'userId'
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('Cannot find user');
            expect(path).toBe('/tasks/view/taskString-1');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/assign/assign');

            callback[1](req, res);

            return router;
        });

        Task.AssignUserToTask = jest.fn().mockResolvedValueOnce(true);
        User.GetUser = jest.fn().mockResolvedValueOnce(null);

        const assign = new Assign(router);

        assign.OnPost();
    });

    test('Given result failed, expect error message displayed', async (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.body = {
            taskString: 'taskString-1',
            userId: 'userId'
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('Unable to assign user to task');
            expect(path).toBe('/tasks/view/taskString-1');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/assign/assign');

            callback[1](req, res);

            return router;
        });

        Task.AssignUserToTask = jest.fn().mockResolvedValueOnce(false);
        User.GetUser = jest.fn().mockResolvedValueOnce(user);

        const assign = new Assign(router);

        assign.OnPost();
    });
});