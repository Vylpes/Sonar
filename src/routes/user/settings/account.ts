import { Request, Response, Router } from "express";
import { Page } from "../../../contracts/Page";
import { User } from "../../../entity/User";
import { UserMiddleware } from "../../../middleware/userMiddleware";

export default class Account extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnGet(): void {
        super.router.get('/settings/account', UserMiddleware.Authorise, (req: Request, res: Response) => {
            const user = req.session.User;

            res.locals.viewData.user = user;

            res.render('user/settings/account', res.locals.viewData);
        });
    }

    public OnPost(): void {
        super.router.post('/settings/account', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const user = req.session.User;
            const email = req.body.email;
            const currentPassword = req.body.currentPassword;
            const newPassword = req.body.newPassword;
            const passwordConfirm = req.body.passwordConfirm;
            const username = req.body.username;

            if (!currentPassword) {
                req.session.error = "Current password is required";
                res.redirect('/user/settings/account');
                return;
            }

            if (!await User.IsLoginCorrect(user.Email, currentPassword)) {
                req.session.error = "Your password was incorrect";
                res.redirect('/user/settings/account');
                return;
            }

            if (newPassword && (newPassword != passwordConfirm)) {
                req.session.error = "Passwords must match";
                res.redirect('/user/settings/account');
                return;
            }

            const result = await User.UpdateUserDetails(user.Id, email, username, newPassword ? newPassword : currentPassword);

            if (!result.IsSuccess) {
                req.session.error = result.Message;
            } else {
                req.session.success = "Saved successfully";
            }

            res.redirect('/user/settings/account');
        });
    }
}