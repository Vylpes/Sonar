import { mock } from "jest-mock-extended";

import { User } from "../../../src/entity/User";
import { Task } from "../../../src/entity/Task";
import { Application, Request, Response, Router } from "express";
import { Edit } from "../../../src/routes/tasks/edit";

describe('OnGet', () => {
    test('Given task can be found, expect page rendered', async (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const task = mock<Task>();
        task.Id = "taskId";
        task.CreatedBy = user;

        const req = mock<Request>();
        req.session.User = user;
        req.params = {
            taskString: 'taskString',
        };

        const res = mock<Response>();
        res.locals.viewData = {};
        res.render.mockImplementationOnce((path: string, viewData: any) => {
            expect(path).toBe('tasks/edit');
            expect(viewData.task).toBe(task);

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/edit/:taskString');

            callback[1](req, res);

            return router;
        });

        Task.GetTaskByTaskString = jest.fn().mockResolvedValueOnce(task);

        const edit = new Edit(router);

        edit.OnGet();
    });

    test('Given task can not be found, expect page redirect', async (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const task = mock<Task>();
        task.Id = "taskId";
        task.CreatedBy = user;

        const req = mock<Request>();
        req.session.User = user;
        req.params = {
            taskString: 'taskString',
        };

        const res = mock<Response>();
        res.locals.viewData = {};
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe('/tasks/list');
            expect(req.session.error).toBe('Task not found');
            
            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/edit/:taskString');

            callback[1](req, res);

            return router;
        });

        Task.GetTaskByTaskString = jest.fn().mockResolvedValueOnce(null);

        const edit = new Edit(router);

        edit.OnGet();
    });
});

describe('OnPost', () => {
    test('Given task edit success, expect route success', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.session.User = user;
        req.params = {
            taskString: 'taskString',
        };
        req.body = {
            name: 'name',
            description: 'description',
        };

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe('/tasks/view/taskString');
            expect(Task.EditTask).toBeCalledWith('taskString', 'name', 'description', user);

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/edit/:taskString');

            callback[1](req, res);

            return router;
        });

        Task.EditTask = jest.fn().mockResolvedValueOnce(true);

        const edit = new Edit(router);

        edit.OnPost();
    });

    test('Given task edit failure, expect route failure', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.session.User = user;
        req.params = {
            taskString: 'taskString',
        };
        req.body = {
            name: 'name',
            description: 'description',
        };

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe('/tasks/view/taskString');
            expect(Task.EditTask).toBeCalledWith('taskString', 'name', 'description', user);
            expect(req.session.error).toBe('Unable to edit task');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/edit/:taskString');

            callback[1](req, res);

            return router;
        });

        Task.EditTask = jest.fn().mockResolvedValueOnce(false);

        const edit = new Edit(router);

        edit.OnPost();
    });

    test('Given name is empty, expect route failure', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.session.User = user;
        req.params = {
            taskString: 'taskString',
        };
        req.body = {
            description: 'description',
        };

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe('/tasks/edit/taskString');
            expect(Task.EditTask).not.toBeCalled();
            expect(req.session.error).toBe('Name is required');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/edit/:taskString');

            callback[1](req, res);

            return router;
        });

        Task.EditTask = jest.fn().mockResolvedValueOnce(false);

        const edit = new Edit(router);

        edit.OnPost();
    });
});