import { Application, Request, Response, Router } from "express";
import { mock } from "jest-mock-extended";
import { UserProjectRole } from "../../../src/constants/UserProjectRole";
import { Project } from "../../../src/entity/Project";
import { ProjectUser } from "../../../src/entity/ProjectUser";
import { Task } from "../../../src/entity/Task";
import { User } from "../../../src/entity/User";

import { Tasks } from "../../../src/routes/projects/tasks";

describe('OnGet', () => {
    test('Given project exists, expect page rendered', async (done) => {
        const user = mock<User>();

        const task = mock<Task>();

        const project = mock<Project>();
        project.Id = 'projectId';
        project.Tasks = [task];

        const req = mock<Request>();
        req.params = {
            projectId: 'projectId',
        }
        req.session.User = user;

        const res = mock<Response>();
        res.locals.viewData = {};
        res.render.mockImplementationOnce((path: string, viewData: any) => {
            expect(path).toBe('projects/tasks');
            expect(res.locals.viewData.project).toBe(project);
            expect(res.locals.viewData.tasks.length).toBe(1);
            expect(res.locals.viewData.tasks[0]).toBe(task);
            expect(res.locals.viewData.userProjectRole).toBe(UserProjectRole.Member);
            expect(res.locals.viewData.canCreateTask).toBeTruthy();

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/view/:projectId/tasks');

            callback[1](req, res);

            return this;
        });

        Project.GetProject = jest.fn().mockResolvedValueOnce(project);

        ProjectUser.GetRole = jest.fn().mockResolvedValueOnce(UserProjectRole.Member);

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

        const tasks = new Tasks(router);

        tasks.OnGet();
    });

    test('Given project does not exist, expect failure', async (done) => {
        const user = mock<User>();

        const task = mock<Task>();

        const req = mock<Request>();
        req.params = {
            projectId: 'projectId',
        }
        req.session.User = user;

        const res = mock<Response>();
        res.locals.viewData = {};
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('Project not found');
            expect(path).toBe('/projects/list');

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/view/:projectId/tasks');

            callback[1](req, res);

            return this;
        });

        Project.GetProject = jest.fn().mockResolvedValueOnce(null);

        ProjectUser.GetRole = jest.fn().mockResolvedValueOnce(UserProjectRole.Member);

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

        const tasks = new Tasks(router);

        tasks.OnGet();
    });

    test('Given user does not have permission to view, expect failure', async (done) => {
        const user = mock<User>();

        const task = mock<Task>();

        const project = mock<Project>();
        project.Id = 'projectId';
        project.Tasks = [task];

        const req = mock<Request>();
        req.params = {
            projectId: 'projectId',
        }
        req.session.User = user;

        const res = mock<Response>();
        res.locals.viewData = {};
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('Project not found');
            expect(path).toBe('/projects/list');

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/view/:projectId/tasks');

            callback[1](req, res);

            return this;
        });

        Project.GetProject = jest.fn().mockResolvedValueOnce(project);

        ProjectUser.GetRole = jest.fn().mockResolvedValueOnce(null);

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

        const tasks = new Tasks(router);

        tasks.OnGet();
    });
});