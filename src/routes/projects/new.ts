import { Router, Request, Response } from "express";
import { getConnection } from "typeorm";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { ProjectUser } from "../../entity/ProjectUser";
import { User } from "../../entity/User";
import { UserMiddleware } from "../../middleware/userMiddleware";
import { v4 as uuid } from "uuid";
import { UserProjectRole } from "../../constants/UserProjectRole";

export class New extends Page {
    private _userMiddleware: UserMiddleware;

    constructor(router: Router, userMiddleare: UserMiddleware) {
        super(router);
        this._userMiddleware = userMiddleare;
    }

    OnPost() {
        super.router.post('/new', this._userMiddleware.Authorise, async (req: Request, res: Response) => {
            const name = req.body.name;
            const description = req.body.description;
            const taskPrefix = req.body.taskPrefix;

            if (!name || !description || !taskPrefix) {
                req.session.error = "All fields are required";
                res.redirect('/projects/list');
                return;
            }

            const connection = getConnection();

            const projectRepository = connection.getRepository(Project);
            const projectUserRepository = connection.getRepository(ProjectUser);
            const userRepository = connection.getRepository(User);

            const user = await userRepository.findOne(req.session.userId);

            if (!user) {
                throw new Error("Current user not found");
            }
            
            const project = new Project(uuid(), name, description, taskPrefix, new Date(), false, user);
            await projectRepository.save(project);

            const projectUser = new ProjectUser(uuid(), UserProjectRole.Admin, project, user);
            await projectUserRepository.save(projectUser);

            req.session.success = "Successfully created project";
            res.redirect(`/projects/view/${project.Id}`);
        });
    }
}