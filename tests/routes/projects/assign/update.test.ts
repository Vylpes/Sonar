import { mock } from "jest-mock-extended";

import { Update } from "../../../../src/routes/projects/assign/update";
import { Router, Request, Response, Application } from "express";
import { User } from "../../../../src/entity/User";
import { Project } from "../../../../src/entity/Project";
import { ProjectUser } from "../../../../src/entity/ProjectUser";

describe('OnGet', () => {
    test('Given user has permission, expect success', async (done) => {
        const user = mock<User>();

        const req = mock<Request>();
        req.params = {
            projectId: 'projectId',
            userId: 'userId',
        }
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe('/projects/view/projectId');

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/assign/update/:projectId/:userId');
            
            callback[1](req, res);

            return this;
        });

        ProjectUser.ToggleAdmin = jest.fn().mockResolvedValueOnce(true);

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

        const update = new Update(router);

        update.OnGet();
    });

    test('Given user does not have permission, expect failure', async (done) => {
        const user = mock<User>();

        const req = mock<Request>();
        req.params = {
            projectId: 'projectId',
            userId: 'userId',
        }
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe("Unauthorised");
            expect(path).toBe('/projects/list');

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/assign/update/:projectId/:userId');
            
            callback[1](req, res);

            return this;
        });

        ProjectUser.ToggleAdmin = jest.fn().mockResolvedValueOnce(true);
        
        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(false);

        const update = new Update(router);

        update.OnGet();
    });

    test('Given result fails, expect failure', async (done) => {
        const user = mock<User>();

        const req = mock<Request>();
        req.params = {
            projectId: 'projectId',
            userId: 'userId',
        }
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(req.session.error).toBe('An error occurred. Please try again');
            expect(path).toBe('/projects/view/projectId');

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/assign/update/:projectId/:userId');
            
            callback[1](req, res);

            return this;
        });

        ProjectUser.ToggleAdmin = jest.fn().mockResolvedValueOnce(false);
        
        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

        const update = new Update(router);

        update.OnGet();
    });
});
