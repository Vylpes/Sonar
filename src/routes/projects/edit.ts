import { Router, Request, Response } from "express";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class Edit extends Page {
    constructor(router: Router) {
        super(router);
    }

    OnPost() {
        super.router.post('/edit', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const projectId = req.body.projectId;
            const name = req.body.name;
            const description = req.body.description;

            if (!projectId || !name || !description) {
                throw new Error("Fields are required: projectId, name, description");
            }

            if (!Project.EditProject(projectId, name, description, req.session.User)) {
                req.session.error = "Error editing project";
            }

            res.redirect(`/projects/view/${projectId}`);
        });
    }
}