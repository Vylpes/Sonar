import { mock } from "jest-mock-extended";

import { Assign } from "../../../../src/routes/projects/assign/assign";
import { Router, Request, Response, Application } from "express";
import { User } from "../../../../src/entity/User";
import { Project } from "../../../../src/entity/Project";
import { ProjectUser } from "../../../../src/entity/ProjectUser";

describe('OnGet', () => {
    describe('/assign/assign/:projectId', () => {
	test('Given user has permission to view, expect page rendered', async (done) => {
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
		expect(path).toBe('projects/assign/assign');
		expect(viewData.project).toBe(project);
		expect(viewData.users.length).toBe(1);
		expect(viewData.users[0]).toBe(projectUser);

		done();
	    });

	    const router = mock<Router>();
	    router.get.mockImplementationOnce((path: string, ...callback: Array<Application>): Router => {
		expect(path).toBe('/assign/assign/:projectId');

		callback[1](req, res);

		return this;
	    });

	    Project.GetProject = jest.fn().mockResolvedValueOnce(project);

	    ProjectUser.GetAllUsersNotInProject = jest.fn().mockResolvedValueOnce([projectUser]);

	    ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

	    const assign = new Assign(router);

	    assign.OnGet();
	});

	test('Given user does not have permission to view, expect redirect for unauthorised', async (done) => {
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
	    router.get.mockImplementationOnce((path: string, ...callback: Array<Application>): Router => {
		expect(path).toBe('/assign/assign/:projectId');

		callback[1](req, res);

		return this;
	    });

	    Project.GetProject = jest.fn().mockResolvedValueOnce(project);

	    ProjectUser.GetAllUsersNotInProject = jest.fn().mockResolvedValueOnce([projectUser]);

	    ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(false);

	    const assign = new Assign(router);

	    assign.OnGet();
	});
    });

    describe('/assign/assign/:projectId/:userId', () => {
	test('Given user has permission, expect page rendered', (done) => {
	    const user = mock<User>();
	    user.Id = 'userId';

	    const project = mock<Project>();

	    const assignedUser = mock<User>();

	    const req = mock<Request>();
	    req.params = {
		projectId: 'projectId',
		userId: 'userId',
	    };

	    req.session.User = user;

	    const res = mock<Response>();
	    res.locals.viewData = {};
	    res.render.mockImplementationOnce((path: string, viewData: any) => {
		    expect(path).toBe('projects/assign/assignConfirm');
		    expect(viewData.assignedUser).toBe(assignedUser);
		    expect(viewData.project).toBe(project);

		    done();
		});

	    const router = mock<Router>();
	    router.get
		.mockImplementationOnce((path: string, ...callback: Array<Application>): Router => {
		    return this;
		})
		.mockImplementationOnce((path: string, ...callback: Array<Application>): Router => {
		    expect(path).toBe('/assign/assign/:projectId/:userId');

		    callback[1](req, res);

		    return this;
		});

	    User.GetUser = jest.fn().mockResolvedValue(assignedUser);

	    Project.GetProject = jest.fn().mockResolvedValue(project);

	    ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

	    const assign = new Assign(router);

	    assign.OnGet();
	});

	test('Given user does not have permission, expect page redirect', (done) => {
	    const user = mock<User>();
	    user.Id = 'userId';

	    const project = mock<Project>();

	    const assignedUser = mock<User>();

	    const req = mock<Request>();
	    req.params = {
		projectId: 'projectId',
		userId: 'userId',
	    };

	    req.session.User = user;

	    const res = mock<Response>();
	    res.locals.viewData = {};
	    res.redirect.mockImplementation((path: string) => {
		expect(path).toBe('/projects/list');
		expect(req.session.error).toBe('Unauthorised');

		done();
	    });

	    const router = mock<Router>();
	    router.get
		.mockImplementationOnce((path: string, ...callback: Array<Application>): Router => {
		    return this;
		})
		.mockImplementationOnce((path: string, ...callback: Array<Application>): Router => {
		    expect(path).toBe('/assign/assign/:projectId/:userId');

		    callback[1](req, res);

		    return this;
		});

	    User.GetUser = jest.fn().mockResolvedValue(assignedUser);

	    Project.GetProject = jest.fn().mockResolvedValue(project);

	    ProjectUser.HasPermission = jest.fn().mockResolvedValue(false);

	    const assign = new Assign(router);

	    assign.OnGet();
	});
    });
});

describe('OnPost', () => {
    test('Given user has permission, expect user assigned', (done) => {
	const user = mock<User>();

	const project = mock<Project>();
	project.Id = 'projectId';

	const projectUser = mock<ProjectUser>();
	projectUser.Project = project;

	const req = mock<Request>();
	req.session.User = user;
	req.params = {
	    projectId: 'projectId',
	    userId: 'userId',
	};

	const res = mock<Response>();
	res.redirect.mockImplementation((path: string) => {
	    expect(path).toBe('/projects/view/projectId');
	    expect(req.session.success).toBe('Assigned user to project');

	    done();
	});

	const router = mock<Router>();
	router.post.mockImplementation((path: string, ...callback: Array<Application>): Router => {
	    expect(path).toBe('/assign/assign/:projectId/:userId');

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
	req.params = {
	    projectId: 'projectId',
	    userId: 'userId',
	};

	const res = mock<Response>();
	res.redirect.mockImplementation((path: string) => {
		expect(path).toBe('/projects/list');
		expect(req.session.error).toBe('Unauthorised');

		done();
	    });

	const router = mock<Router>();
	router.post.mockImplementation((path: string, ...callback: Array<Application>): Router => {
	    expect(path).toBe('/assign/assign/:projectId/:userId');

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
	req.params = {
	    projectId: 'projectId',
	    userId: 'userId',
	};

	const res = mock<Response>();
	res.redirect.mockImplementation((path: string) => {
		expect(path).toBe('/projects/view/projectId');
		expect(req.session.error).toBe('Failed to assign user to project');

		done();
	    });

	const router = mock<Router>();
	router.post.mockImplementation((path: string, ...callback: Array<Application>): Router => {
	    expect(path).toBe('/assign/assign/:projectId/:userId');

	    callback[1](req, res);

	    return this;
	});

	ProjectUser.AssignUserToProject = jest.fn().mockResolvedValue(null);

	ProjectUser.HasPermission = jest.fn().mockResolvedValue(true);

	const assign = new Assign(router);

	assign.OnPost();
    });

});
