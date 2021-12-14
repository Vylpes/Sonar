import { Page } from "../../../contracts/Page";
import { UserMiddleware } from "../../../middleware/userMiddleware";
import { Router, Request, Response } from "express";
import { UserProjectPermissions } from "../../../constants/UserProjectRole";
import { ProjectUser } from "../../../entity/ProjectUser";

export class Assign extends Page {
    constructor(router: Router) {
        super(router);
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
