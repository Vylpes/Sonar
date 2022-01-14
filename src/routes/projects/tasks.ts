import { Request, Response, Router } from "express";
import { UserProjectPermissions } from "../../constants/UserProjectRole";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { ProjectUser } from "../../entity/ProjectUser";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class Tasks extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnGet() {
        super.router.get('/view/:projectId/tasks', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const project = await Project.GetProject(req.params.projectId, req.session.User);

            if (!project) {
                req.session.error = "Project not found";
                res.redirect('/projects/list');
                return;
            }

            const role = await ProjectUser.GetRole(project.Id, req.session.User.Id);

            if (typeof role != "number" && !role) {
                req.session.error = "Project not found";
                res.redirect('/projects/list');
                return;
            }

            res.locals.viewData.project = project;
            res.locals.viewData.tasks = project.Tasks;
            res.locals.viewData.userProjectRole = role;
            res.locals.viewData.canCreateTask = await ProjectUser.HasPermission(project.Id, req.session.User.Id, UserProjectPermissions.TaskCreate);
            res.locals.viewData.canEditProject = await ProjectUser.HasPermission(project.Id, req.session.User.Id, UserProjectPermissions.Update);
            res.locals.viewData.showArchived = req.query.archived || false;

            res.render('projects/tasks', res.locals.viewData);
        });
    }
}