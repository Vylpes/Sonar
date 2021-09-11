import { Router, Request, Response } from "express";
import { getConnection } from "typeorm";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class Edit extends Page {
    private _userMiddleware: UserMiddleware;

    constructor(router: Router, userMiddleare: UserMiddleware) {
        super(router);
        this._userMiddleware = userMiddleare;
    }

    OnPost() {
        super.router.post('/edit', this._userMiddleware.Authorise, async (req: Request, res: Response) => {
            const projectId = req.body.projectId;
            const name = req.body.name;
            const description = req.body.description;

            if (!projectId || !name || !description) {
                throw new Error("Fields are required: projectId, name, description");
            }

            if (!Project.EditProject(projectId, name, description, req.session.userId)) {
                req.session.error = "Error editing project";
            }

            res.redirect(`/projects/view/${projectId}`);
        });
    }
}