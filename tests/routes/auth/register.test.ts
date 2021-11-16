import { mock } from "jest-mock-extended";

import { Register } from "../../../src/routes/auth/register";
import { Router, Request, Response, Application } from "express";
import { User } from "../../../src/entity/User";

describe('OnPost', () => {
    test('Given user registration is successful, expect success message', (done) => {
	const req = mock<Request>();
	req.body = {
	    username: 'username',
	    email: 'email',
	    password: 'password',
	    passwordRepeat: 'password',
	};

	const res = mock<Response>();
	res.redirect.mockImplementation((path: string) => {
	    expect(path).toBe('/auth/login');
	    expect(req.session.success).toBe('You are now registered');

	    done();
	});

	const router = mock<Router>();
	router.post.mockImplementation((path: any, callback: Application): Router => {
	    expect(path).toBe('/register');

	    callback(req, res);

	    return this;
	});

	User.RegisterUser = jest.fn().mockResolvedValue(true);

	const register = new Register(router);

	register.OnPost();
    });

    test('Given username is empty, expect failure message', (done) => {
	const req = mock<Request>();
	req.body = {
	    username: '',
	    email: 'email',
	    password: 'password',
	    passwordRepeat: 'password',
	};

	const res = mock<Response>();
	res.redirect.mockImplementation((path: string) => {
	    expect(path).toBe('/auth/login');
	    expect(req.session.error).toBe('All fields are required');

	    done();
	});

	const router = mock<Router>();
	router.post.mockImplementation((path: any, callback: Application): Router => {
	    expect(path).toBe('/register');

	    callback(req, res);

	    return this;
	});

	User.RegisterUser = jest.fn().mockResolvedValue(true);

	const register = new Register(router);

	register.OnPost();
    });

    test('Given email is empty, expect failure message', (done) => {
	const req = mock<Request>();
	req.body = {
	    username: 'username',
	    email: '',
	    password: 'password',
	    passwordRepeat: 'password',
	};

	const res = mock<Response>();
	res.redirect.mockImplementation((path: string) => {
	    expect(path).toBe('/auth/login');
	    expect(req.session.error).toBe('All fields are required');

	    done();
	});

	const router = mock<Router>();
	router.post.mockImplementation((path: any, callback: Application): Router => {
	    expect(path).toBe('/register');

	    callback(req, res);

	    return this;
	});

	User.RegisterUser = jest.fn().mockResolvedValue(true);

	const register = new Register(router);

	register.OnPost();
    });

    test('Given password is empty, expect failure message', (done) => {
	const req = mock<Request>();
	req.body = {
	    username: 'username',
	    email: 'email',
	    password: '',
	    passwordRepeat: 'password',
	};

	const res = mock<Response>();
	res.redirect.mockImplementation((path: string) => {
	    expect(path).toBe('/auth/login');
	    expect(req.session.error).toBe('All fields are required');

	    done();
	});

	const router = mock<Router>();
	router.post.mockImplementation((path: any, callback: Application): Router => {
	    expect(path).toBe('/register');

	    callback(req, res);

	    return this;
	});

	User.RegisterUser = jest.fn().mockResolvedValue(true);

	const register = new Register(router);

	register.OnPost();
    });

    test('Given passwordRepeat is empty, expect failure message', (done) => {
	const req = mock<Request>();
	req.body = {
	    username: 'username',
	    email: 'email',
	    password: 'password',
	    passwordRepeat: '',
	};

	const res = mock<Response>();
	res.redirect.mockImplementation((path: string) => {
	    expect(path).toBe('/auth/login');
	    expect(req.session.error).toBe('All fields are required');

	    done();
	});

	const router = mock<Router>();
	router.post.mockImplementation((path: any, callback: Application): Router => {
	    expect(path).toBe('/register');

	    callback(req, res);

	    return this;
	});

	User.RegisterUser = jest.fn().mockResolvedValue(true);

	const register = new Register(router);

	register.OnPost();
    });
    
    test('Given user registration is not successful, expect error message', (done) => {
	const req = mock<Request>();
	req.body = {
	    username: 'username',
	    email: 'email',
	    password: 'password',
	    passwordRepeat: 'password',
	};

	const res = mock<Response>();
	res.redirect.mockImplementation((path: string) => {
	    expect(path).toBe('/auth/login');
	    expect(req.session.error).toBe('Failed to register user. Please try again');

	    done();
	});

	const router = mock<Router>();
	router.post.mockImplementation((path: any, callback: Application): Router => {
	    expect(path).toBe('/register');

	    callback(req, res);

	    return this;
	});

	User.RegisterUser = jest.fn().mockResolvedValue(false);

	const register = new Register(router);

	register.OnPost();
    });

    test('Given passwords do not match, expect failure message', (done) => {
	const req = mock<Request>();
	req.body = {
	    username: 'username',
	    email: 'email',
	    password: 'password',
	    passwordRepeat: 'passwordRepeat',
	};

	const res = mock<Response>();
	res.redirect.mockImplementation((path: string) => {
	    expect(path).toBe('/auth/login');
	    expect(req.session.error).toBe('Passwords do not match');

	    done();
	});

	const router = mock<Router>();
	router.post.mockImplementation((path: any, callback: Application): Router => {
	    expect(path).toBe('/register');

	    callback(req, res);

	    return this;
	});

	User.RegisterUser = jest.fn().mockResolvedValue(true);

	const register = new Register(router);

	register.OnPost();
    });

    test('Given password is less than 7 characters, expect failure message', (done) => {
	const req = mock<Request>();
	req.body = {
	    username: 'username',
	    email: 'email',
	    password: 'one',
	    passwordRepeat: 'passwordRepeat',
	};

	const res = mock<Response>();
	res.redirect.mockImplementation((path: string) => {
	    expect(path).toBe('/auth/login');
	    expect(req.session.error).toBe('Password must be greater than 7 characters in length');

	    done();
	});

	const router = mock<Router>();
	router.post.mockImplementation((path: any, callback: Application): Router => {
	    expect(path).toBe('/register');

	    callback(req, res);

	    return this;
	});

	User.RegisterUser = jest.fn().mockResolvedValue(true);

	const register = new Register(router);

	register.OnPost();
    });

});
