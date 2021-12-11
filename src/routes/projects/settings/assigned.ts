import { Request, Response, Router } from "express";
import { UserProjectPermissions } from "../../../constants/UserProjectRole";
import { Page } from "../../../contracts/Page";
import { Project } from "../../../entity/Project";
import { ProjectUser } from "../../../entity/ProjectUser";
import { UserMiddleware } from "../../../middleware/userMiddleware";

export default class Assigned extends Page {
    constructor(router: Router) {
        super(router);
    }
    
    public OnGet() {
        super.router.get('/settings/assigned/:projectId', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const projectId = req.params.projectId;
            const user = req.session.User;

            if (!projectId) {
                req.session.error = "Project not found or you do not have the permission to view it";
                res.redirect('/projects/list');
                return;
            }

            const project = await Project.GetProject(projectId, user);

            if (!project) {
                req.session.error = "Project not found or you do not have the permission to view it";
                res.redirect('/projects/list');
                return;
            }

            if (!(await ProjectUser.HasPermission(projectId, user.Id, UserProjectPermissions.Update))) {
                req.session.error = "Project not found or you do not have the permission to view it";
                res.redirect('/projects/list');
                return;
            }

            res.locals.viewData.project = project;
            res.locals.viewData.projectUsers = project.ProjectUsers;
            res.locals.viewData.canAssignUser = await ProjectUser.HasPermission(projectId, user.Id, UserProjectPermissions.Assign);
            res.locals.viewData.unassignedUsers = await ProjectUser.GetAllUsersNotInProject(projectId, user);

            res.render('projects/settings/assigned', res.locals.viewData);
        });
    }
}