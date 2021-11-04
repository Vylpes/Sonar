import { mock } from "jest-mock-extended";

import { Application, Request, Response, Router } from "express";
import { View } from "../../../src/routes/projects/view";
import { User } from "../../../src/entity/User";
import { Project } from "../../../src/entity/Project";
import { ProjectUser } from "../../../src/entity/ProjectUser";
import { UserProjectRole } from "../../../src/constants/UserProjectRole";

describe('OnGet', () => {
    test('Given user has permission to view, expect project page rendered', async (done) => {
        const user = mock<User>();

        const project = mock<Project>();
        project.Id = 'projectId';
        
        const projectUser = mock<ProjectUser>();
        projectUser.Project = project;
        project.ProjectUsers = [projectUser];

        const req = mock<Request>();
        req.params = {
            projectId: 'projectId',
        };
        req.session.User = user;

        const res = mock<Response>();
        res.locals.viewData = {};
        res.render.mockImplementationOnce((path: string, viewData: any) => {
            expect(path).toBe('projects/view');
            expect(viewData.project).toBe(project);
            expect(viewData.projectUsers.length).toBe(1);
            expect(viewData.projectUsers[0]).toBe(projectUser);
            expect(viewData.userProjectRole).toBe(UserProjectRole.Member);
            expect(viewData.canCreateTask).toBeTruthy();

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/view/:projectId');

            callback[1](req, res);

            return this;
        });

        Project.GetProject = jest.fn().mockResolvedValueOnce(project);
        ProjectUser.GetRole = jest.fn().mockResolvedValueOnce(UserProjectRole.Member);
        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

        const view = new View(router);

        view.OnGet();
    });

    test('Given project does not exist, expect failure', async (done) => {
        const user = mock<User>();

        const req = mock<Request>();
        req.params = {
            projectId: 'projectId',
        };
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
            expect(path).toBe('/view/:projectId');

            callback[1](req, res);

            return this;
        });

        Project.GetProject = jest.fn().mockResolvedValueOnce(null);
        ProjectUser.GetRole = jest.fn().mockResolvedValueOnce(UserProjectRole.Member);
        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

        const view = new View(router);

        view.OnGet();
    });

    test('Given user does not have permission to view, expect failure', async (done) => {
        const user = mock<User>();

        const project = mock<Project>();
        project.Id = 'projectId';
        
        const projectUser = mock<ProjectUser>();
        projectUser.Project = project;
        project.ProjectUsers = [projectUser];

        const req = mock<Request>();
        req.params = {
            projectId: 'projectId',
        };
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
            expect(path).toBe('/view/:projectId');

            callback[1](req, res);

            return this;
        });

        Project.GetProject = jest.fn().mockResolvedValueOnce(project);
        ProjectUser.GetRole = jest.fn().mockResolvedValueOnce(null);
        ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

        const view = new View(router);

        view.OnGet();
    });
});