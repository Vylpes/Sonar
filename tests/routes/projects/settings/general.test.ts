import { mock } from "jest-mock-extended";

import General from "../../../../src/routes/projects/settings/general";
import { Application, Request, Response, Router } from "express";
import { User } from "../../../../src/entity/User";
import { Project } from "../../../../src/entity/Project";
import { ProjectUser } from "../../../../src/entity/ProjectUser";

describe('OnGet', () => {
    test('Given user has permission to view, expect page rendered', (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const project = mock<Project>();
        project.Id = "projectId";

        const req = mock<Request>();
        req.params = {
            projectId: "projectId"
        };
        req.session.User = user;

        const res = mock<Response>();
        res.locals.viewData = {};
        res.render.mockImplementationOnce((path: string, viewData: any) => {
            expect(path).toBe("projects/settings/general");
            expect(viewData.project).toBe(project);
            expect(Project.GetProject).toBeCalledWith("projectId", user);

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe("/settings/general/:projectId");

            callback[1](req, res);

            return router;
        });

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);
        Project.GetProject = jest.fn().mockResolvedValueOnce(project);

        const general = new General(router);

        general.OnGet();
    });

    test('Given projectId is null, expect redirection to project list', (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const project = mock<Project>();
        project.Id = "projectId";

        const req = mock<Request>();
        req.params = {};
        req.session.User = user;

        const res = mock<Response>();
        res.locals.viewData = {};
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe("/projects/list");
            expect(req.session.error).toBe("Project not found or you do not have permissions to view it");

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe("/settings/general/:projectId");

            callback[1](req, res);

            return router;
        });

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);
        Project.GetProject = jest.fn().mockResolvedValueOnce(project);

        const general = new General(router);

        general.OnGet();
    });

    test('Given user does not have the permission to update, expect redirection to project list', (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const project = mock<Project>();
        project.Id = "projectId";

        const req = mock<Request>();
        req.params = {
            projectId: "projectId"
        };
        req.session.User = user;

        const res = mock<Response>();
        res.locals.viewData = {};
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe("/projects/list");
            expect(req.session.error).toBe("Project not found or you do not have permissions to view it");

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe("/settings/general/:projectId");

            callback[1](req, res);

            return router;
        });

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(false);
        Project.GetProject = jest.fn().mockResolvedValueOnce(project);

        const general = new General(router);

        general.OnGet();
    });

    test('Given project can not be found, expect redirection to project list', (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const project = mock<Project>();
        project.Id = "projectId";

        const req = mock<Request>();
        req.params = {
            projectId: "projectId"
        };
        req.session.User = user;

        const res = mock<Response>();
        res.locals.viewData = {};
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe("/projects/list");
            expect(req.session.error).toBe("Project not found or you do not have permissions to view it");

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe("/settings/general/:projectId");

            callback[1](req, res);

            return router;
        });

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);
        Project.GetProject = jest.fn().mockResolvedValueOnce(null);

        const general = new General(router);

        general.OnGet();
    });
});

describe('OnPost', () => {
    test('Given user has permission and input is valid, expect project update', (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const req = mock<Request>();
        req.params = {
            projectId: "projectId"
        };
        req.body = {
            name: "name",
            description: "description"
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe("/projects/settings/general/projectId");
            expect(req.session.success).toBe("Successfully updated project");
            expect(Project.EditProject).toBeCalledWith("projectId", "name", "description", user);

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe("/settings/general/:projectId");

            callback[1](req, res);

            return router;
        });

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);
        Project.EditProject = jest.fn().mockResolvedValueOnce(true);

        const general = new General(router);

        general.OnPost();
    });

    test('Given projectId is null, expect redirect', (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const req = mock<Request>();
        req.params = {};
        req.body = {
            name: "name",
            description: "description"
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe("/projects/list");
            expect(req.session.error).toBe("Project not found or you do not have permissions to view it");
            expect(Project.EditProject).not.toBeCalled();

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe("/settings/general/:projectId");

            callback[1](req, res);

            return router;
        });

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);
        Project.EditProject = jest.fn().mockResolvedValueOnce(true);

        const general = new General(router);

        general.OnPost();
    });

    test('Given user does not have permission, expect redirect', (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const req = mock<Request>();
        req.params = {
            projectId: "projectId"
        };
        req.body = {
            name: "name",
            description: "description"
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe("/projects/list");
            expect(req.session.error).toBe("Project not found or you do not have permissions to view it");
            expect(Project.EditProject).not.toBeCalled();

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe("/settings/general/:projectId");

            callback[1](req, res);

            return router;
        });

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(false);
        Project.EditProject = jest.fn().mockResolvedValueOnce(true);

        const general = new General(router);

        general.OnPost();
    });

    test('Given name is null, expect redirect', (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const req = mock<Request>();
        req.params = {
            projectId: "projectId"
        };
        req.body = {
            description: "description"
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe("/projects/settings/general/projectId");
            expect(req.session.error).toBe("All fields are required");
            expect(Project.EditProject).not.toBeCalled();

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe("/settings/general/:projectId");

            callback[1](req, res);

            return router;
        });

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);
        Project.EditProject = jest.fn().mockResolvedValueOnce(true);

        const general = new General(router);

        general.OnPost();
    });

    test('Given description is null, expect redirect', (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const req = mock<Request>();
        req.params = {
            projectId: "projectId"
        };
        req.body = {
            name: "name"
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe("/projects/settings/general/projectId");
            expect(req.session.error).toBe("All fields are required");
            expect(Project.EditProject).not.toBeCalled();

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe("/settings/general/:projectId");

            callback[1](req, res);

            return router;
        });

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);
        Project.EditProject = jest.fn().mockResolvedValueOnce(true);

        const general = new General(router);

        general.OnPost();
    });

    test('Given edit project failure, expect notice', (done) => {
        const user = mock<User>();
        user.Id = "userId";

        const req = mock<Request>();
        req.params = {
            projectId: "projectId"
        };
        req.body = {
            name: "name",
            description: "description"
        };
        req.session.User = user;

        const res = mock<Response>();
        res.redirect.mockImplementationOnce((path: string) => {
            expect(path).toBe("/projects/settings/general/projectId");
            expect(req.session.error).toBe("There was an error updating the project");
            expect(Project.EditProject).toBeCalledWith("projectId", "name", "description", user);

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe("/settings/general/:projectId");

            callback[1](req, res);

            return router;
        });

        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);
        Project.EditProject = jest.fn().mockResolvedValueOnce(false);

        const general = new General(router);

        general.OnPost();
    });
});