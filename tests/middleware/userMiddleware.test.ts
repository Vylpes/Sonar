import { UserMiddleware } from "../../src/middleware/userMiddleware";
import { Request, Response } from "express";
import { mock } from "jest-mock-extended";
import { User } from "../../src/entity/User";

describe('Authorise', () => {
    test('Given user is authorised, expect middleware to continue', () => {
	const user = mock<User>();

	const req = mock<Request>();
	req.session.User = user;

	const res = mock<Response>();

	const next = jest.fn();

	UserMiddleware.Authorise(req, res, next);

	expect(next).toBeCalled();
    });

    test('Given user is not authenticated, expect redirection to login', () => {
	const req = mock<Request>();

	const res = mock<Response>();

	const next = jest.fn();

	UserMiddleware.Authorise(req, res, next);

	expect(req.session.error).toBe("Access denied");
	expect(res.redirect).toBeCalledWith('/auth/login');
    });
});
