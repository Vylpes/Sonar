import { Request, Response, Router } from "express";
import { UserProjectPermissions } from "../../constants/UserProjectRole";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { ProjectUser } from "../../entity/ProjectUser";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class View extends Page {
    constructor(router: Router) {
        super(router);
    }

    OnGet() {
        super.router.get('/view/:projectId', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const project = await Project.GetProject(req.params.projectId, req.session.User);

            if (!project) {
                req.session.error = "Project not found";
                res.redirect('/projects/list');
                return;
            }

            if (!(await ProjectUser.HasPermission(req.params.projectId, req.session.User.Id, UserProjectPermissions.View))) {
                req.session.error = "Project not found";
                res.redirect('/projects/list');
                return;
            }
            
            const role = await ProjectUser.GetRole(project.Id, req.session.User.Id);

            res.locals.viewData.project = project;
            res.locals.viewData.projectUsers = project.ProjectUsers;
            res.locals.viewData.userProjectRole = role;
            res.locals.viewData.canCreateTask = await ProjectUser.HasPermission(project.Id, req.session.User.Id, UserProjectPermissions.TaskCreate);
            res.locals.viewData.canEditProject = await ProjectUser.HasPermission(project.Id, req.session.User.Id, UserProjectPermissions.Update);

            res.render('projects/view', res.locals.viewData);
        });
    }
}