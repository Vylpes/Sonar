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
            if (!(await ProjectUser.HasPermission(req.params.projectId, req.session.User.Id,
		UserProjectPermissions.Assign))) {
                req.session.error = "Unauthorised";
                res.redirect("/projects/list");
                return;
            }

            res.locals.viewData.project = await Project.GetProject(req.params.projectId, req.session.User);
            res.locals.viewData.users = await ProjectUser.GetAllUsersNotInProject(req.params.projectId, req.session.User);

            res.render('projects/assign/assign', res.locals.viewData);
        });

        super.router.get('/assign/assign/:projectId/:userId', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            if(!(await ProjectUser.HasPermission(req.params.projectId, req.session.User.Id,
		UserProjectPermissions.Assign))) {
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
        super.router.post('/assign/assign', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const projectId = req.body.projectId;
            const assignUserId = req.body.userId;
            const currentUser = req.session.User;

            if (!projectId) {
                req.session.error = "Project not found or you do not have permission to view it";
                res.redirect('/projects/list');
                return;
            }

	        if(!(await ProjectUser.HasPermission(projectId, currentUser.Id,
		    UserProjectPermissions.Assign))) {
    	    	req.session.error = "Project not found or you do not have permission to view it";
		        res.redirect('/projects/list');
    	    	return;
	        }

            if (!assignUserId) {
                req.session.error = "All fields are required";
                res.redirect(`/projects/settings/assigned/${projectId}`);
                return;
            }

            const projectUser = await ProjectUser.AssignUserToProject(projectId, assignUserId, currentUser);

            if (projectUser) {
                req.session.success = "Assigned user to project";
            } else {
                req.session.error = "Failed to assign user to project";
            }

            res.redirect(`/projects/settings/assigned/${projectId}`);
        });
    }
}
