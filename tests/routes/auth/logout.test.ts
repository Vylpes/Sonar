import { mock } from "jest-mock-extended";

import { Logout } from "../../../src/routes/auth/logout";
import { Router, Request, Response, Application } from "express";

describe('OnGet', () => {
    test('Expect session to be destroyed', (done) => {
	const req = mock<Request>();
	req.session.destroy = jest.fn().mockImplementation(callback => {
	    callback();
	});

	const res = mock<Response>();
	res.redirect.mockImplementation((path: string) => {
	    expect(path).toBe('/');

	    done();
	});

	const router = mock<Router>();
	router.get.mockImplementation((path: any, callback: Application): Router => {
	    expect(path).toBe('/logout');

	    callback(req, res);

	    return this;
	});

	const logout = new Logout(router);

	logout.OnGet();
    });
});
