import { mock } from "jest-mock-extended";

import Account from "../../../../src/routes/user/settings/account";
import { Application, Router, Request, Response } from "express";
import { User } from "../../../../src/entity/User";

describe('OnGet', () => {
    test('Expect page to be rendered with current user', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.session.User = user;

        const res = mock<Response>();
        res.locals.viewData = {};
        res.render.mockImplementation((path: string, viewData: any) => {
            expect(path).toBe('user/settings/account');
            expect(viewData.user).toBe(user);

            done();
        });

        const router = mock<Router>();
        router.get.mockImplementation((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/settings/account');

            callback[1](req, res);

            return router;
        });

        const account = new Account(router);

        account.OnGet();
    });
});

describe('OnPost', () => {
    test('Given body is valid, expect successful redirect', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.session.User = user;
        req.body = {
            email: 'email',
            currentPassword: 'currentPassword',
            newPassword: 'newPassword',
            passwordConfirm: 'newPassword',
            username: 'username'
        };

        const res = mock<Response>();
        res.redirect.mockImplementation((path: string) => {
            expect(path).toBe('/user/settings/account');
            expect(req.session.success).toBe('Saved successfully');
            expect(User.UpdateUserDetails).toBeCalledWith('userId', 'email', 'username', 'newPassword');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementation((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/settings/account');

            callback[1](req, res);

            return router;
        });

        User.IsLoginCorrect = jest.fn().mockResolvedValue(true);
        User.UpdateUserDetails = jest.fn().mockResolvedValue({
            IsSuccess: true
        });

        const account = new Account(router);
        account.OnPost();
    });

    test('Given newPassword is empty, expect password to stay the same', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.session.User = user;
        req.body = {
            email: 'email',
            currentPassword: 'currentPassword',
            username: 'username'
        };

        const res = mock<Response>();
        res.redirect.mockImplementation((path: string) => {
            expect(path).toBe('/user/settings/account');
            expect(req.session.success).toBe('Saved successfully');
            expect(User.UpdateUserDetails).toBeCalledWith('userId', 'email', 'username', 'currentPassword');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementation((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/settings/account');

            callback[1](req, res);

            return router;
        });

        User.IsLoginCorrect = jest.fn().mockResolvedValue(true);
        User.UpdateUserDetails = jest.fn().mockResolvedValue({
            IsSuccess: true
        });

        const account = new Account(router);
        account.OnPost();
    });

    test('Given currentPassword is null, expect failure redirect', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.session.User = user;
        req.body = {
            email: 'email',
            newPassword: 'newPassword',
            passwordConfirm: 'newPassword',
            username: 'username'
        };

        const res = mock<Response>();
        res.redirect.mockImplementation((path: string) => {
            expect(path).toBe('/user/settings/account');
            expect(req.session.error).toBe('Current password is required');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementation((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/settings/account');

            callback[1](req, res);

            return router;
        });

        User.IsLoginCorrect = jest.fn().mockResolvedValue(true);
        User.UpdateUserDetails = jest.fn().mockResolvedValue({
            IsSuccess: true
        });

        const account = new Account(router);
        account.OnPost();
    });

    test('Given currentPassword is incorrect, expect failure redirect', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.session.User = user;
        req.body = {
            email: 'email',
            currentPassword: 'currentPassword',
            newPassword: 'newPassword',
            passwordConfirm: 'newPassword',
            username: 'username'
        };

        const res = mock<Response>();
        res.redirect.mockImplementation((path: string) => {
            expect(path).toBe('/user/settings/account');
            expect(req.session.error).toBe('Your password was incorrect');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementation((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/settings/account');

            callback[1](req, res);

            return router;
        });

        User.IsLoginCorrect = jest.fn().mockResolvedValue(false);
        User.UpdateUserDetails = jest.fn().mockResolvedValue({
            IsSuccess: true
        });

        const account = new Account(router);
        account.OnPost();
    });

    test('Given newPassword is supplied AND not the same as passwordConfirm, expect failure redirect', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.session.User = user;
        req.body = {
            email: 'email',
            currentPassword: 'currentPassword',
            newPassword: 'newPassword',
            passwordConfirm: 'passwordConfirm',
            username: 'username'
        };

        const res = mock<Response>();
        res.redirect.mockImplementation((path: string) => {
            expect(path).toBe('/user/settings/account');
            expect(req.session.error).toBe('Passwords must match');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementation((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/settings/account');

            callback[1](req, res);

            return router;
        });

        User.IsLoginCorrect = jest.fn().mockResolvedValue(true);
        User.UpdateUserDetails = jest.fn().mockResolvedValue({
            IsSuccess: true
        });

        const account = new Account(router);
        account.OnPost();
    });

    test('Given result is error, expect failure redirect', (done) => {
        const user = mock<User>();
        user.Id = 'userId';

        const req = mock<Request>();
        req.session.User = user;
        req.body = {
            email: 'email',
            currentPassword: 'currentPassword',
            newPassword: 'newPassword',
            passwordConfirm: 'newPassword',
            username: 'username'
        };

        const res = mock<Response>();
        res.redirect.mockImplementation((path: string) => {
            expect(path).toBe('/user/settings/account');
            expect(req.session.error).toBe('message');

            done();
        });

        const router = mock<Router>();
        router.post.mockImplementation((path: any, ...callback: Array<Application>): Router => {
            expect(path).toBe('/settings/account');

            callback[1](req, res);

            return router;
        });

        User.IsLoginCorrect = jest.fn().mockResolvedValue(true);
        User.UpdateUserDetails = jest.fn().mockResolvedValue({
            IsSuccess: false,
            Message: 'message'
        });

        const account = new Account(router);
        account.OnPost();
    });
});