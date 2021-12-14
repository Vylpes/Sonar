import { mock } from "jest-mock-extended";

import { Assign } from "../../../../src/routes/projects/assign/assign";
import { Router, Request, Response, Application } from "express";
import { User } from "../../../../src/entity/User";
import { Project } from "../../../../src/entity/Project";
import { ProjectUser } from "../../../../src/entity/ProjectUser";

describe('OnPost', () => {
    test('Given user has permission, expect user assigned', (done) => {
	const user = mock<User>();

	const project = mock<Project>();
	project.Id = 'projectId';

	const projectUser = mock<ProjectUser>();
	projectUser.Project = project;

	const req = mock<Request>();
	req.session.User = user;
	req.body = {
	    projectId: 'projectId',
	    userId: 'userId',
	};

	const res = mock<Response>();
	res.redirect.mockImplementation((path: string) => {
	    expect(path).toBe('/projects/settings/assigned/projectId');
	    expect(req.session.success).toBe('Assigned user to project');

	    done();
	});

	const router = mock<Router>();
	router.post.mockImplementation((path: any, ...callback: Array<Application>): Router => {
	    expect(path).toBe('/assign/assign');

	    callback[1](req, res);

	    return this;
	});

	ProjectUser.AssignUserToProject = jest.fn().mockResolvedValue(projectUser);

	ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

	const assign = new Assign(router);

	assign.OnPost();
    });

    test('Given user does not have permission, expect page redirect', (done) => {
	const user = mock<User>();

	const project = mock<Project>();
	project.Id = 'projectId';

	const projectUser = mock<ProjectUser>();
	projectUser.Project = project;

	const req = mock<Request>();
	req.session.User = user;
	req.body = {
	    projectId: 'projectId',
	    userId: 'userId',
	};

	const res = mock<Response>();
	res.redirect.mockImplementation((path: string) => {
		expect(path).toBe('/projects/list');
		expect(req.session.error).toBe('Project not found or you do not have permission to view it');

		done();
	    });

	const router = mock<Router>();
	router.post.mockImplementation((path: any, ...callback: Array<Application>): Router => {
	    expect(path).toBe('/assign/assign');

	    callback[1](req, res);

	    return this;
	});

	ProjectUser.AssignUserToProject = jest.fn().mockResolvedValue(projectUser);

	ProjectUser.HasPermission = jest.fn().mockResolvedValue(false);

	const assign = new Assign(router);

	assign.OnPost();
    });

    test('Given assign is unsuccessful, expect page redirect', (done) => {
	const user = mock<User>();

	const project = mock<Project>();
	project.Id = 'projectId';

	const projectUser = mock<ProjectUser>();
	projectUser.Project = project;

	const req = mock<Request>();
	req.session.User = user;
	req.body = {
	    projectId: 'projectId',
	    userId: 'userId',
	};

	const res = mock<Response>();
	res.redirect.mockImplementation((path: string) => {
		expect(path).toBe('/projects/settings/assigned/projectId');
		expect(req.session.error).toBe('Failed to assign user to project');

		done();
	    });

	const router = mock<Router>();
	router.post.mockImplementation((path: any, ...callback: Array<Application>): Router => {
	    expect(path).toBe('/assign/assign');

	    callback[1](req, res);

	    return this;
	});

	ProjectUser.AssignUserToProject = jest.fn().mockResolvedValue(null);

	ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

	const assign = new Assign(router);

	assign.OnPost();
    });
	
	test('Given projectId is null, expect error redirect', (done) => {
		const user = mock<User>();
		user.Id = 'userId';

		const req = mock<Request>();
		req.body = {
			assignUserId: 'assignUserId'
		}
		req.session.User = user;

		const res = mock<Response>();
		res.redirect.mockImplementationOnce((path: string) => {
			expect(path).toBe('/projects/list');
			expect(req.session.error).toBe("Project not found or you do not have permission to view it");

			done();
		});

		const router = mock<Router>();
		router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
			expect(path).toBe('/assign/assign');

			callback[1](req, res);

			return router;
		});

		const assign = new Assign(router);

		assign.OnPost();
	});

	test('Given assignUserId is null, exect error redirect', (done) => {
		const user = mock<User>();
		user.Id = 'userId';

		const req = mock<Request>();
		req.body = {
			projectId: 'projectId'
		};
		req.session.User = user;

		const res = mock<Response>();
		res.redirect.mockImplementationOnce((path: string) => {
			expect(path).toBe('/projects/settings/assigned/projectId');
			expect(req.session.error).toBe('All fields are required');

			done();
		});

		const router = mock<Router>();
		router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
			expect(path).toBe('/assign/assign');

			callback[1](req, res);

			return router;
		});

		ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

		const assign = new Assign(router);

		assign.OnPost();
	});
});
