import { PugMiddleware } from "../../src/middleware/pugMiddleware";
import { Request, Response, NextFunction } from "express";
import { mock } from "jest-mock-extended";
import { User } from "../../src/entity/User";

describe('GetBaseString', () => {
    test('Expect base string to be set', () => {
	const user = mock<User>();
	user.Id = 'userId';

	const request = mock<Request>();
	request.session.User = user;

	const response = mock<Response>();
	response.locals.message = "message";
	response.locals.error = "error";

	const nextFunction = jest.fn();

	PugMiddleware.GetBaseString(request, response, nextFunction);
	
	const viewData = response.locals.viewData;

	expect(nextFunction).toBeCalled();
	expect(viewData.title).toBe('Sonar');
	expect(viewData.message).toBe('message');
	expect(viewData.error).toBe('error');
	expect(viewData.isAuthenticated).toBeTruthy();
	expect(viewData.user).toBe(user);
    });
});
