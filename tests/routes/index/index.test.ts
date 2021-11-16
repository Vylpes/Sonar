import { mock } from "jest-mock-extended";

import { Index } from "../../../src/routes/index/index";
import { Router, Request, Response, Application } from "express";

describe('OnGet', () => {
    test('Given user is not authenticated, expect home page rendered', (done) => {
	const req = mock<Request>();

	const res = mock<Response>();
	res.locals.viewData = {
	    isAuthenticated: false,
	};

	res.render.mockImplementation((path: string, viewData) => {
	    expect(path).toBe('index/index');
	    expect(viewData).toBe(res.locals.viewData);

	    done();
	});

	const router = mock<Router>();
	router.get.mockImplementation((path: any, callback: Application): Router => {
	    expect(path).toBe('/');

	    callback(req, res);

	    return this;
	});

	const index = new Index(router);

	index.OnGet();
    });

    test('Given user is authenticated, expect redirection to dashboard', (done) => {
	const req = mock<Request>();

	const res = mock<Response>();
	res.locals.viewData = {
	    isAuthenticated: true,
	};

	res.redirect.mockImplementation((path: string) => {
	    expect(path).toBe('/dashboard');

	    done();
	});

	const router = mock<Router>();
	router.get.mockImplementation((path: any, callback: Application): Router => {
	    expect(path).toBe('/');

	    callback(req, res);

	    return this;
	});

	const index = new Index(router);

	index.OnGet();

    });
});
