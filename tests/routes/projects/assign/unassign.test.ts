import { mock } from "jest-mock-extended";

import { Unassign } from "../../../../src/routes/projects/assign/unassign";
import { Router, Request, Response, Application } from "express";
import { User } from "../../../../src/entity/User";
import { Project } from "../../../../src/entity/Project";
import { ProjectUser } from "../../../../src/entity/ProjectUser";

describe('OnGet', () => {
    test('Given user has permissions to view, expect page rendered', async (done) => {
        const user = mock<User>();
	    user.Id = 'userId';

	    const project = mock<Project>();

	    const projectUser = mock<ProjectUser>();

	    const req = mock<Request>();
	    req.params = {
		projectId: 'projectId',
	    };

	    req.session.User = user;

	    const res = mock<Response>();
	    res.locals.viewData = {

	    };

	    res.render.mockImplementationOnce((path: string, viewData: any) => {
		expect(path).toBe('projects/assign/unassign');
            expect(viewData.project).toBe(project);
            expect(viewData.unassignedUser).toBe(user);

		    done();
	    });

	    const router = mock<Router>();
	    router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
			expect(path).toBe('/assign/unassign/:projectId/:userId');

			callback[1](req, res);

			return this;
	    });

        User.GetUser = jest.fn().mockResolvedValueOnce(user);
	    Project.GetProject = jest.fn().mockResolvedValueOnce(project);

	    ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

	    const unassign = new Unassign(router);

	    unassign.OnGet();
    });

	test('Given user does not have permissions to view, expect page redirct', async (done) => {
        const user = mock<User>();
	    user.Id = 'userId';

	    const project = mock<Project>();

	    const projectUser = mock<ProjectUser>();

	    const req = mock<Request>();
	    req.params = {
		projectId: 'projectId',
	    };

	    req.session.User = user;

	    const res = mock<Response>();
	    res.locals.viewData = {

	    };

		res.redirect.mockImplementationOnce((path: string) => {
			expect(path).toBe('/projects/list');
			expect(req.session.error).toBe('Unauthorised');

			done();
		});

	    const router = mock<Router>();
	    router.get.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
			expect(path).toBe('/assign/unassign/:projectId/:userId');

			callback[1](req, res);

			return this;
	    });

        User.GetUser = jest.fn().mockResolvedValueOnce(user);
	    Project.GetProject = jest.fn().mockResolvedValueOnce(project);

	    ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(false);

	    const unassign = new Unassign(router);

	    unassign.OnGet();
    });
});

describe('OnPost', () => {
	test('Given user has permission to unassign, expect user unassigned', async (done) => {
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
			expect(req.session.success).toBe('Unassigned user from project');

			done();
		});

		const router = mock<Router>();
		router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
			expect(path).toBe('/assign/unassign/:projectId/:userId');

			callback[1](req, res);

			return this;
		});

		ProjectUser.UnassignUserFromProject = jest.fn().mockResolvedValueOnce(true);

		ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

		const unassign = new Unassign(router);

		unassign.OnPost();
	});

	test('Given user does not have permission to unassign, expect error redirect', async (done) => {
		const user = mock<User>();

		const req = mock<Request>();
		req.params = {
			projectId: 'projectId',
			userId: 'userId',
		}
		req.session.User = user;

		const res = mock<Response>();
		res.redirect.mockImplementationOnce((path: string) => {
			expect(path).toBe('/projects/list');
			expect(req.session.error).toBe('Unauthorised');

			done();
		});

		const router = mock<Router>();
		router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
			expect(path).toBe('/assign/unassign/:projectId/:userId');

			callback[1](req, res);

			return this;
		});

		ProjectUser.UnassignUserFromProject = jest.fn().mockResolvedValueOnce(true);

		ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(false);

		const unassign = new Unassign(router);

		unassign.OnPost();
	});

	test('Given unassign failed, expect error redirect', async (done) => {
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
			expect(req.session.error).toBe('There was an error');

			done();
		});

		const router = mock<Router>();
		router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
			expect(path).toBe('/assign/unassign/:projectId/:userId');

			callback[1](req, res);

			return this;
		});

		ProjectUser.UnassignUserFromProject = jest.fn().mockResolvedValueOnce(false);

		ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

		const unassign = new Unassign(router);

		unassign.OnPost();
	});
});
