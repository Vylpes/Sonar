import { mock } from "jest-mock-extended";

import { Index } from "../../../src/routes/dashboard/index";
import { Router, Request, Response, Application, NextFunction } from "express";
import { UserMiddleware } from "../../../src/middleware/userMiddleware";

describe('OnGet', () => {
    test('Expect dashboard rendered', (done) => {
	const req = mock<Request>();

	const res = mock<Response>();
	res.locals.viewData = {
	    title: 'Sonar'
	};

	res.render.mockImplementation((path: string, viewData) => {
	    expect(path).toBe('dashboard/index');
	    expect(viewData).toBe(res.locals.viewData);

	    done();
	});

	const router = mock<Router>();
	router.get.mockImplementation((path: any, ...callback: Array<Application>): Router => {
	    expect(path).toBe('/');
		
		callback[1](req, res);

	    return this;
	});

	const index = new Index(router);

	index.OnGet();
    });
});
