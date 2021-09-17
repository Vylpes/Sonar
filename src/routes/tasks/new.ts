import { Request, Response, Router } from "express";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { Task } from "../../entity/Task";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class New extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnPost() {
        super.router.post('/new', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const name = req.body.name;
            const description = req.body.description || "";
            const createdBy = req.session.User;
            const projectId = req.body.projectId;

            if (!projectId) {
                req.session.error = "Project not found";
                res.redirect('/tasks/list');
                return;
            }

            if (!name || !createdBy) {
                req.session.error = "All fields are required";
                res.redirect(`/projects/view/${projectId}`);
                return;
            }

            const project = await Project.GetProject(projectId, req.session.User);

            if (!project) {
                req.session.error = "Project not found";
                res.redirect('/tasks/list');
                return;
            }

            const task = await Task.CreateTask(name, description, createdBy, project);

            if (!task) {
                req.session.error = "Unable to create task";
            }

            res.redirect(`/projects/view/${projectId}`);
            return;
        });
    }
}