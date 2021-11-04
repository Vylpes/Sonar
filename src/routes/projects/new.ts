import { Router, Request, Response } from "express";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class New extends Page {
    constructor(router: Router) {
        super(router);
    }

    OnPost() {
        super.router.post('/new', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const name = req.body.name;
            const description = req.body.description;
            const taskPrefix = req.body.taskPrefix;

            if (!name || !description || !taskPrefix) {
                req.session.error = "All fields are required";
                res.redirect('/projects/list');
                return;
            }

            const project = await Project.CreateProject(name, description, taskPrefix, req.session.User);

            if (!project) {
                req.session.error = "There was an error creating the project";
                res.redirect('/projects/list');
                return;
            }

            req.session.success = "Successfully created project";
            res.redirect(`/projects/view/${project.Id}`);
        });
    }
}