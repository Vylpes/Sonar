import { mock } from "jest-mock-extended";

import { Edit } from "../../../src/routes/projects/edit";
import { Router, Request, Response, Application } from "express";
import { User } from "../../../src/entity/User";
import { Project } from "../../../src/entity/Project";
import { ProjectUser } from "../../../src/entity/ProjectUser";

declare module 'express-session' {
    export interface SessionData {
        User: { [key: string]: any };
        error: { [key: string]: any };
        success: { [key:string]: any };
    }
}

describe('OnPost', () => {
    test('Given user has permission, expect success', async (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const req = mock<Request>();
        req.body = {
            projectId: 'projectId',
            name: 'name',
            description: 'description',
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe('/projects/view/projectId');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/edit');

            callback[1](req, res);

            return this;
        });

        Project.EditProject = jest.fn().mockResolvedValueOnce(true);

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

        const edit = new Edit(router);

        edit.OnPost();
    });

    test('Given user does not have permission, expect failure', async (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const req = mock<Request>();
        req.body = {
            projectId: 'projectId',
            name: 'name',
            description: 'description',
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('Unauthorised');
            expect(path).toBe('/projects/list');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/edit');

            callback[1](req, res);

            return this;
        });

        Project.EditProject = jest.fn().mockResolvedValueOnce(true);

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(false);

        const edit = new Edit(router);

        edit.OnPost();
    });

    test('Given projectId is null, expect failure', async (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.body = {
            name: 'name',
            description: 'description',
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('All fields are required');
            expect(path).toBe('/projects/list');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/edit');

            callback[1](req, res);

            return this;
        });

        Project.EditProject = jest.fn().mockResolvedValueOnce(true);

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

        const edit = new Edit(router);

        edit.OnPost();
    });

    test('Given name is null, expect failure', async (done) => {
        const user = mock<User>();

        const req = mock<Request>();
        req.body = {
            projectId: 'projectId',
            description: 'description',
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('All fields are required');
            expect(path).toBe('/projects/list');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/edit');

            callback[1](req, res);

            return this;
        });

        Project.EditProject = jest.fn().mockResolvedValueOnce(true);

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

        const edit = new Edit(router);

        edit.OnPost();
    });

    test('Given description is null, expect failure', async (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.body = {
            projectId: 'projectId',
            name: 'name',
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('All fields are required');
            expect(path).toBe('/projects/list');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/edit');

            callback[1](req, res);

            return this;
        });

        Project.EditProject = jest.fn().mockResolvedValueOnce(true);

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

        const edit = new Edit(router);

        edit.OnPost();
    });

    test('Given there was an error editing, expect failure', async (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const req = mock<Request>();
        req.body = {
            projectId: 'projectId',
            name: 'name',
            description: 'description',
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('Error editing project');
            expect(path).toBe('/projects/view/projectId');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/edit');

            callback[1](req, res);

            return this;
        });

        Project.EditProject = jest.fn().mockResolvedValueOnce(false);

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

        const edit = new Edit(router);

        edit.OnPost();
    });
});