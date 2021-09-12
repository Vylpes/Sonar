import { Page } from "../../../contracts/Page";
import { UserMiddleware } from "../../../middleware/userMiddleware";
import { Router, Request, Response } from "express";
import { Project } from "../../../entity/Project";
import { UserProjectPermissions } from "../../../constants/UserProjectRole";
import { User } from "../../../entity/User";
import { ProjectUser } from "../../../entity/ProjectUser";

export class Assign extends Page {
    constructor(router: Router) {
        super(router);
    }

    OnGet() {
        super.router.get('/assign/assign/:projectId', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            if (!ProjectUser.HasPermission(req.params.projectId, req.session.User.Id, UserProjectPermissions.Assign)) {
                req.session.error = "Unauthorised";
                res.redirect("/projects/list");
                return;
            }

            res.locals.viewData.project = await Project.GetProject(req.params.projectId, req.session.User);
            res.locals.viewData.users = await ProjectUser.GetAllUsersNotInProject(req.params.projectId, req.session.User);

            res.render('projects/assign/assign', res.locals.viewData);
        });

        super.router.get('/assign/assign/:projectId/:userId', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            if(!ProjectUser.HasPermission(req.params.projectId, req.session.User.Id, UserProjectPermissions.Assign)) {
                req.session.error = "Unauthorised";
                res.redirect("/projects/list");
                return;
            }

            res.locals.viewData.assignedUser = await User.GetUser(req.params.userId);
            res.locals.viewData.project = await Project.GetProject(req.params.projectId, req.session.User);

            res.render('projects/assign/assignConfirm', res.locals.viewData);
        });
    }

    OnPost() {
        super.router.post('/assign/assign/:projectId/:userId', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const projectUser = await ProjectUser.AssignUserToProject(req.params.projectId, req.params.userId, req.session.User);
            const project = await projectUser.Project;

            req.session.success = "Assigned user to project";
            res.redirect(`/projects/view/${project.Id}`);
        });
    }
}