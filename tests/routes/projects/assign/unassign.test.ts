import { mock } from "jest-mock-extended";

import { Unassign } from "../../../../src/routes/projects/assign/unassign";
import { Router, Request, Response, Application } from "express";
import { User } from "../../../../src/entity/User";
import { ProjectUser } from "../../../../src/entity/ProjectUser";

describe('OnPost', () => {
	test('Given user has permission to unassign, expect user unassigned', async (done) => {
		const user = mock<User>();

		const req = mock<Request>();
		req.body = {
			projectId: 'projectId',
			userId: 'userId',
		}
		req.session.User = user;

		const res = mock<Response>();
		res.redirect.mockImplementationOnce((path: string) => {
			expect(path).toBe('/projects/settings/assigned/projectId');
			expect(req.session.success).toBe('Unassigned user from project');

			done();
		});

		const router = mock<Router>();
		router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
			expect(path).toBe('/assign/unassign');

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
		req.body = {
			projectId: 'projectId',
			userId: 'userId',
		}
		req.session.User = user;

		const res = mock<Response>();
		res.redirect.mockImplementationOnce((path: string) => {
			expect(path).toBe('/projects/list');
			expect(req.session.error).toBe('Project not found or you do not have permission to see it');

			done();
		});

		const router = mock<Router>();
		router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
			expect(path).toBe('/assign/unassign');

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
		req.body = {
			projectId: 'projectId',
			userId: 'userId',
		}
		req.session.User = user;

		const res = mock<Response>();
		res.redirect.mockImplementationOnce((path: string) => {
			expect(path).toBe('/projects/settings/assigned/projectId');
			expect(req.session.error).toBe('There was an error');

			done();
		});

		const router = mock<Router>();
		router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
			expect(path).toBe('/assign/unassign');

			callback[1](req, res);

			return this;
		});

		ProjectUser.UnassignUserFromProject = jest.fn().mockResolvedValueOnce(false);

		ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

		const unassign = new Unassign(router);

		unassign.OnPost();
	});

	test('Given projectId is null, expect error redirect', (done) => {
		const user = mock<User>();
		user.Id = 'userId';

		const req = mock<Request>();
		req.body = {
			unassignUserId: 'unassignUserId'
		};
		req.session.User = user;

		const res = mock<Response>();
		res.redirect.mockImplementationOnce((path: string) => {
			expect(path).toBe('/projects/list');
			expect(req.session.error).toBe('Project not found or you do not have permission to see it');

			done();
		});

		const router = mock<Router>();
		router.post.mockImplementationOnce((path: any, ...callback: Array<Application>): Router => {
			expect(path).toBe('/assign/unassign');

			callback[1](req, res);

			return router;
		});

		const unassign = new Unassign(router);

		unassign.OnPost();
	});

	test('Given unassignUserId is null, expect error redirect', (done) => {
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
			expect(path).toBe('/assign/unassign');
			
			callback[1](req, res);

			return router;
		});

		ProjectUser.HasPermission = jest.fn().mockResolvedValueOnce(true);

		const unassign = new Unassign(router);

		unassign.OnPost();
	})
});
