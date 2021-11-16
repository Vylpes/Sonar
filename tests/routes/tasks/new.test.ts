import { mock } from "jest-mock-extended";

import { User } from "../../../src/entity/User";
import { New } from "../../../src/routes/tasks/new";
import { Application, Request, Response, Router } from "express";
import { Project } from "../../../src/entity/Project";
import { Task } from "../../../src/entity/Task";

describe('OnPost', () => {
    test('Given fields are valid, expect success', async (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const project = mock<Project>();
        project.Id = "projectId";
        project.CreatedBy = user;

        const task = mock<Task>();
        task.Id = "taskId";
        task.Project = project;
        
        const req = mock<Request>();
        req.body = {
            name: "name",
            description: "description",
            projectId: "projectId",
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe('/projects/view/projectId/tasks');
            expect(Task.CreateTask).toBeCalledWith('name', 'description', user, project);
            
            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/new');

            callback[1](req, res);

            return router;
        });

        Project.GetProject = jest.fn().mockResolvedValueOnce(project);
        Task.CreateTask = jest.fn().mockResolvedValueOnce(task);

        const page = new New(router);

        page.OnPost();
    });

    test('Given projectId is null, expect failure', async (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const project = mock<Project>();
        project.Id = "projectId";
        project.CreatedBy = user;

        const task = mock<Task>();
        task.Id = "taskId";
        task.Project = project;
        
        const req = mock<Request>();
        req.body = {
            name: "name",
            description: "description",
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe('/tasks/list');
            expect(req.session.error).toBe('Project not found');
            
            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/new');

            callback[1](req, res);

            return router;
        });

        const page = new New(router);

        page.OnPost();
    });

    test('Given name is null, expect failure', async (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const project = mock<Project>();
        project.Id = "projectId";
        project.CreatedBy = user;

        const task = mock<Task>();
        task.Id = "taskId";
        task.Project = project;
        
        const req = mock<Request>();
        req.body = {
            description: "description",
            projectId: "projectId",
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe('/projects/view/projectId');
            expect(req.session.error).toBe('Name is required');
            
            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/new');

            callback[1](req, res);

            return router;
        });

        const page = new New(router);

        page.OnPost();
    });

    test('Given project can not be found, expect failure', async (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const project = mock<Project>();
        project.Id = "projectId";
        project.CreatedBy = user;

        const task = mock<Task>();
        task.Id = "taskId";
        task.Project = project;
        
        const req = mock<Request>();
        req.body = {
            name: "name",
            description: "description",
            projectId: "projectId",
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe('/tasks/list');
            expect(req.session.error).toBe('Project not found');
            
            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/new');

            callback[1](req, res);

            return router;
        });

        Project.GetProject = jest.fn().mockResolvedValueOnce(null);

        const page = new New(router);

        page.OnPost();
    });

    test('Given task creation was unsuccessful, expect failure', async (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const project = mock<Project>();
        project.Id = "projectId";
        project.CreatedBy = user;

        const task = mock<Task>();
        task.Id = "taskId";
        task.Project = project;
        
        const req = mock<Request>();
        req.body = {
            name: "name",
            description: "description",
            projectId: "projectId",
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe('/projects/view/projectId/tasks');
            expect(req.session.error).toBe('Unable to create task');
            
            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/new');

            callback[1](req, res);

            return router;
        });

        Project.GetProject = jest.fn().mockResolvedValueOnce(project);
        Task.CreateTask = jest.fn().mockResolvedValueOnce(null);

        const page = new New(router);

        page.OnPost();
    });
});
