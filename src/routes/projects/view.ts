import { Request, Response, Router } from "express";
import { getConnection } from "typeorm";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { ProjectUser } from "../../entity/ProjectUser";
import { User } from "../../entity/User";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class View extends Page {
    private _userMiddleware: UserMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
    }

    OnGet() {
        super.router.get('/view/:id', this._userMiddleware.Authorise, async (req: Request, res: Response) => {
            const connection = getConnection();

            const projectRepository = connection.getRepository(Project);
            const projectUserRepository = connection.getRepository(ProjectUser);
            const userRepository = connection.getRepository(User);

            const project = await projectRepository.findOne(req.params.id);

            if (!project) {
                req.session.error = "Project not found or you are not authorised to see it";
                res.redirect('/projects/list');
                return;
            }

            const user = await userRepository.findOne(req.session.userId);

            const projectUsers = await projectUserRepository.find({ Project: project });

            const projectUser = projectUsers.find(x => x.User == user && x.Project == project);

            if (!projectUser) {
                req.session.error = "Project not found or you are not authorised to see it";
                res.redirect('/projects/list');
                return;
            }

            res.locals.viewData.project = project;
            res.locals.viewData.projectUsers = projectUsers;
            res.locals.viewData.userProjectRole = projectUser.Role;

            res.render('projects/view', res.locals.viewData);
        });
    }
}