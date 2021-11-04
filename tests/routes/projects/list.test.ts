import { mock } from "jest-mock-extended";

import { List } from "../../../src/routes/projects/list";
import { User } from "../../../src/entity/User";
import { Project } from "../../../src/entity/Project";
import { ProjectUser } from "../../../src/entity/ProjectUser";
import { Application, Router, Request, Response } from "express";

describe('OnGet', () => {
    test('Expect list page rendered', async (done) => {
        const user = mock<User>();

        const project = mock<Project>();

        const req = mock<Request>();
        req.session.User = user;

        const res = mock<Response>();
        res.locals.viewData = {};
        res.render.mockImplementationOnce((path: string, viewData: any) => {
            expect(viewData.projects.length).toBe(1);
            expect(viewData.projects[0]).toBe(project);
            expect(path).toBe('projects/list');

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/list');

            callback[1](req, res);

            return this;
        });

        Project.GetAllProjects = jest.fn().mockResolvedValueOnce([project]);

        const list = new List(router);

        list.OnGet();
    });
});