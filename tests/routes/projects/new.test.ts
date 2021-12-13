import { Application, Request, Response, Router } from "express";
import { mock } from "jest-mock-extended";
import { Project } from "../../../src/entity/Project";

import { New } from "../../../src/routes/projects/new";

describe('OnPost', () => {
    test('Given all data is valid, expect success', async (done) => {
        const project = mock<Project>();
        project.Id = 'projectId';
        
        const req = mock<Request>();
        req.body = {
            name: 'name',
            description: 'description',
            taskPrefix: 'taskPrefix',
        };
        
        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.success).toBe('Successfully created project');
            expect(path).toBe('/projects/view/projectId');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/new');

            callback[1](req, res);

            return this;
        });

        Project.CreateProject = jest.fn().mockResolvedValueOnce(project);

        const page = new New(router);

        page.OnPost();
    });

    test('Given name is empty, expect failure', async (done) => {
        const project = mock<Project>();
        project.Id = 'projectId';
        
        const req = mock<Request>();
        req.body = {
            description: 'description',
            taskPrefix: 'taskPrefix',
        };
        
        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('All fields are required');
            expect(path).toBe('/projects/list');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/new');

            callback[1](req, res);

            return this;
        });

        Project.CreateProject = jest.fn().mockResolvedValueOnce(project);

        const page = new New(router);

        page.OnPost();
    });

    test('Given all data is valid, expect success', async (done) => {
        const project = mock<Project>();
        project.Id = 'projectId';
        
        const req = mock<Request>();
        req.body = {
            name: 'name',
            description: 'description',
            taskPrefix: 'taskPrefix',
        };
        
        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.success).toBe('Successfully created project');
            expect(path).toBe('/projects/view/projectId');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/new');

            callback[1](req, res);

            return this;
        });

        Project.CreateProject = jest.fn().mockResolvedValueOnce(project);

        const page = new New(router);

        page.OnPost();
    });

    test('Given all data is valid, expect success', async (done) => {
        const project = mock<Project>();
        project.Id = 'projectId';
        
        const req = mock<Request>();
        req.body = {
            name: 'name',
            description: 'description',
            taskPrefix: 'taskPrefix',
        };
        
        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.success).toBe('Successfully created project');
            expect(path).toBe('/projects/view/projectId');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/new');

            callback[1](req, res);

            return this;
        });

        Project.CreateProject = jest.fn().mockResolvedValueOnce(project);

        const page = new New(router);

        page.OnPost();
    });

    test('Given all data is valid, expect success', async (done) => {
        const project = mock<Project>();
        project.Id = 'projectId';
        
        const req = mock<Request>();
        req.body = {
            name: 'name',
            description: 'description',
            taskPrefix: 'taskPrefix',
        };
        
        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.success).toBe('Successfully created project');
            expect(path).toBe('/projects/view/projectId');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/new');

            callback[1](req, res);

            return this;
        });

        Project.CreateProject = jest.fn().mockResolvedValueOnce(project);

        const page = new New(router);

        page.OnPost();
    });

    test('Given project can not be found, expect error redirect', (done) => {
        const req = mock<Request>();
        req.body = {
            name: 'name',
            description: 'description',
            taskPrefix: 'taskPrefix'
        }

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe('/projects/list');
            expect(req.session.error).toBe('There was an error creating the project');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/new');

            callback[1](req, res);

            return router;
        });

        Project.CreateProject = jest.fn().mockResolvedValueOnce(false);

        const page = new New(router);

        page.OnPost();
    });
});