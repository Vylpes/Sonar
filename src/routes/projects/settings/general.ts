import { Page } from "../../../contracts/Page";
import { Request, Response, Router } from "express";
import { UserMiddleware } from "../../../middleware/userMiddleware";
import { ProjectUser } from "../../../entity/ProjectUser";
import { UserProjectPermissions } from "../../../constants/UserProjectRole";
import { Project } from "../../../entity/Project";

export default class General extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnGet() {
        super.router.get("/settings/general/:projectId", UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const projectId = req.params.projectId;

            if (!projectId) {
                req.session.error = "Project not found or you do not have permissions to view it";
                res.redirect("/projects/list");
                return;
            }

            if (!(await ProjectUser.HasPermission(projectId, req.session.User.Id, UserProjectPermissions.Update))) {
                req.session.error = "Project not found or you do not have permissions to view it";
                res.redirect("/projects/list");
                return;
            }

            const project = await Project.GetProject(projectId, req.session.User);

            if (!project) {
                req.session.error = "Project not found or you do not have permissions to view it";
                res.redirect("/projects/list");
                return;
            }

            res.locals.viewData.project = project;

            res.render('projects/settings/general', res.locals.viewData);
        });
    }

    public OnPost() {
        super.router.post("/settings/general/:projectId", UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const projectId = req.params.projectId;
            const name = req.body.name;
            const description = req.body.description;

            if (!projectId) {
                req.session.error = "Project not found or you do not have permissions to view it";
                res.redirect("/projects/list");
                return;
            }

            if (!(await ProjectUser.HasPermission(projectId, req.session.User.Id, UserProjectPermissions.Update))) {
                req.session.error = "Project not found or you do not have permissions to view it";
                res.redirect("/projects/list");
                return;
            }

            if (!name || !description) {
                req.session.error = "All fields are required";
                res.redirect(`/projects/settings/general/${projectId}`);
                return;
            }

            const result = await Project.EditProject(projectId, name, description, req.session.User);

            if (result) {
                req.session.success = "Successfully updated project";
            } else {
                req.session.error = "There was an error updating the project";
            }

            res.redirect(`/projects/settings/general/${projectId}`);
        });
    }
}