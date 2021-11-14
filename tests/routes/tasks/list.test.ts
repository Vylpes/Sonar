import { mock } from "jest-mock-extended";

import { List } from "../../../src/routes/tasks/list";
import { User } from "../../../src/entity/User";
import { Application, Router, Request, Response } from "express";
import { Task } from "../../../src/entity/Task";

declare module 'express-session' {
    interface Session {
        User?: User;
        error?: string;
        success?: string;
    }
}

describe('OnGet', () => {
    test('Expect page rendered', async (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const task = mock<Task>();
        task.Id = "taskId";
        task.CreatedBy = user;

        const req = mock<Request>();
        req.session.User = user;

        const res = mock<Response>();
        res.locals.viewData = {};
        res.render.mockImplementationOnce((path: string, viewData: any) => {
            expect(path).toBe('tasks/list');
            expect(viewData.tasks.length).toBe(1);
            expect(viewData.tasks[0]).toBe(task);

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/list');

            callback[1](req, res);

            return router;
        });

        Task.GetAllTasks = jest.fn().mockResolvedValueOnce([task]);

        const list = new List(router);

        list.OnGet();
    });
});