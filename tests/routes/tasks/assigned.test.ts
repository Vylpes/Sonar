import { mock } from "jest-mock-extended";

import { Assigned } from "../../../src/routes/tasks/assigned";
import { Application, Request, Response, Router } from "express";
import { User } from "../../../src/entity/User";
import { Task } from "../../../src/entity/Task";

describe('OnGet', () => {
    test('Expect page rendered', async (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const task = mock<Task>();

        const req = mock<Request>();
        req.session.User = user;

        const res = mock<Response>();
        res.locals.viewData = {};
        res.render.mockImplementationOnce((path: string, viewData: any) => {
            expect(path).toBe('tasks/assigned');
            expect(viewData.tasks.length).toBe(1);
            expect(viewData.tasks[0]).toBe(task);

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/assigned');

            callback[1](req, res);

            return router;
        });

        Task.GetAssignedTasks = jest.fn().mockResolvedValueOnce([task]);

        const assigned = new Assigned(router);

        assigned.OnGet();
    });
});
