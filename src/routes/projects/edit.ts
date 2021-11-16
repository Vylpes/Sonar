import { Router, Request, Response } from "express";
import { UserProjectPermissions } from "../../constants/UserProjectRole";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { ProjectUser } from "../../entity/ProjectUser";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class Edit extends Page {
    constructor(router: Router) {
        super(router);
    }

    OnPost() {
        super.router.post('/edit', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            if (!(await ProjectUser.HasPermission(req.params.projectId, req.session.User.Id,
                UserProjectPermissions.Update))) {
                req.session.error = "Unauthorised";
                res.redirect("/projects/list");
                return;
            }

            const projectId = req.body.projectId;
            const name = req.body.name;
            const description = req.body.description;

            if (!projectId || !name || !description) {
                req.session.error = "All fields are required";
                res.redirect('/projects/list');
                return;
            }

            if (!(await Project.EditProject(projectId, name, description, req.session.User))) {
                req.session.error = "Error editing project";
            }

            res.redirect(`/projects/view/${projectId}`);
        });
    }
}