import { mock } from "jest-mock-extended";

let userMock = mock<User>();

jest.mock('../../../src/entity/User', () => {
    return {
	User: userMock,
    }
});

import { Login } from "../../../src/routes/auth/login";
import { Router, Request, Response, Application } from "express";
import { User } from "../../../src/entity/User";

beforeEach(() => {
    userMock = mock<User>();
});

describe('OnGet', () => {
    test('Given user is not already authenticated, render login page', () => {
	let page: string;

	const req = mock<Request>();

	const res = mock<Response>();
	res.locals.viewData = {
	    isAuthenticated: false
	};

	const router = mock<Router>();
	router.get.mockImplementation((p: any, callback: Application): Router => {
	    page = p;
	    callback(req, res);

	    return this;
	});

	const login = new Login(router);

	login.OnGet();

	expect(page).toBe('/login');
	expect(res.render).toBeCalledWith('auth/login', res.locals.viewData);
    });

    test('Given user is already authenticated, expect redirection to dashboard', () => {
	let page: string;

	const req = mock<Request>();

	const res = mock<Response>();
	res.locals.viewData = {
	    isAuthenticated: true
	};

	const router = mock<Router>();
	router.get.mockImplementation((p: any, callback: Application): Router => {
	    page = p;
	    callback(req, res);

	    return this;
	});

	const login = new Login(router);

	login.OnGet();

	expect(page).toBe('/login');
	expect(res.redirect).toBeCalledWith('/dashboard');
    });
});

describe('OnPost', () => {
    test('Given login is correct, expect session to be generated', async (done) => {
	let page: string;

	const user = mock<User>();

	const req = mock<Request>();
	req.body = {
	    email: 'email',
	    password: 'password',
	};

	req.session.regenerate = jest.fn().mockImplementation(async (callback) => {
	    await callback();

	    expect(req.session.regenerate).toBeCalled();
	    expect(req.session.User).toBe(user);
	    expect(res.redirect).toBeCalledWith('/dashboard');
	    done();
	});

	const res = mock<Response>();

	const router = mock<Router>();
	router.post.mockImplementation((p: any, callback: Application): Router => {
	    page = p;
	    callback(req, res);

	    return this;
	});

	User.IsLoginCorrect = jest.fn().mockResolvedValue(true);
	
	User.GetUserByEmailAddress = jest.fn().mockResolvedValue(user);

	const login = new Login(router);

	login.OnPost();
    });

    test('Given email is empty, expect session error', async () => {
	let page: string;

	const req = mock<Request>();
	req.body = {
	    email: '',
	    password: 'password',
	};

	const res = mock<Response>();

	const router = mock<Router>();
	router.post.mockImplementation((p: any, callback: Application): Router => {
	    page = p;
	    callback(req, res);

	    return this;
	});

	const login = new Login(router);

	login.OnPost();

	expect(req.session.error).toBe('All fields are required');
	expect(res.redirect).toBeCalledWith('/auth/login');
    });

    test('Given password is empty, expect session error', async () => {
	let page: string;

	const req = mock<Request>();
	req.body = {
	    email: 'email',
	    password: '',
	};

	const res = mock<Response>();

	const router = mock<Router>();
	router.post.mockImplementation((p: any, callback: Application): Router => {
	    page = p;
	    callback(req, res);

	    return this;
	});

	const login = new Login(router);

	login.OnPost();

	expect(req.session.error).toBe('All fields are required');
	expect(res.redirect).toBeCalledWith('/auth/login');
    });

    test('Given login is incorrect, expect session error', (done) => {
	let page: string;

	const req = mock<Request>();
	req.body = {
	    email: 'email',
	    password: 'password',
	};

	const res = mock<Response>();
	res.redirect.mockImplementation((p: string) => {
	    expect(req.session.error).toBe('Password is incorrect');
	    expect(res.redirect).toBeCalledWith('/auth/login');
	    done();
	});

	const router = mock<Router>();
	router.post.mockImplementation((p: any, callback: Application): Router => {
	    page = p;
	    callback(req, res);

	    return this;
	});

	User.IsLoginCorrect = jest.fn().mockResolvedValue(false);

	const login = new Login(router);

	login.OnPost();
    });
});
