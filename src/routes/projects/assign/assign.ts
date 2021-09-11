import { Page } from "../../../contracts/Page";
import { UserMiddleware } from "../../../middleware/userMiddleware";
import { Router, Request, Response } from "express";
import { getConnection } from "typeorm";
import { Project } from "../../../entity/Project";
import { UserProjectRole } from "../../../constants/UserProjectRole";
import { User } from "../../../entity/User";
import { ProjectUser } from "../../../entity/ProjectUser";
import { v4 as uuid } from "uuid";

export class Assign extends Page {
    private _userMiddleware: UserMiddleware;

    constructor(router: Router, userMiddleware: UserMiddleware) {
        super(router);
        this._userMiddleware = userMiddleware;
    }

    OnGet() {
        super.router.get('/assign/assign/:projectId', this._userMiddleware.Authorise, async (req: Request, res: Response) => {
            const connection = getConnection();

            const projectRepository = connection.getRepository(Project);
            const userRepository = connection.getRepository(User);

            const project = await projectRepository.findOne(req.params.projectId);

            if (!project) {
                req.session.error = "Project does not exist or you are not authorised to see it";
                res.redirect("/projects/list");
                return;
            }

            const projectUser = project.ProjectUsers.find(x => x.User.Id == req.session.userId);

            if (!projectUser) {
                req.session.error = "Project does not exist or you are not authorised to see it";
                res.redirect("/projects/list");
                return;
            }

            if (projectUser.Role != UserProjectRole.Admin) {
                req.session.error = "Unauthorised";
                res.redirect(`/projects/view/${project.Id}`);
                return;
            }

            const users = await userRepository.find();

            const usersNotInProject = users.map(x => !x.AssignedProjects.find(y => y.Project.Id == project.Id));

            res.locals.viewData.project = project;
            res.locals.viewData.users = usersNotInProject;

            res.render('projects/assign/assign', res.locals.viewData);
        });

        super.router.get('/assign/assign/:projectId/:userId', this._userMiddleware.Authorise, async (req: Request, res: Response) => {
            const connection = getConnection();

            const projectRepository = connection.getRepository(Project);
            const userRepository = connection.getRepository(User);

            const project = await projectRepository.findOne(req.params.projectId);

            if (!project) {
                req.session.error = "Project does not exist or you are not authorised to see it";
                res.redirect("/projects/list");
                return;
            }

            const projectUser = project.ProjectUsers.find(x => x.User.Id == req.session.userId);

            if (!projectUser) {
                req.session.error = "Project does not exist or you are not authorised to see it";
                res.redirect("/projects/list");
                return;
            }

            if (projectUser.Role != UserProjectRole.Admin) {
                req.session.error = "Unauthorised";
                res.redirect("/projects/list");
                return;
            }

            const user = await userRepository.findOne(req.params.userId);

            if (!user) {
                req.session.error = "User does not exist";
                res.redirect(`/projects/view/${project.Id}`);
                return;
            }

            res.locals.viewData.user = user;
            res.locals.viewData.project = project;

            res.render('projects/assign/assignConfirm', res.locals.viewData);
        });
    }

    OnPost() {
        super.router.post('/assign/assign/:projectId/:userId', this._userMiddleware.Authorise, async (req: Request, res: Response) => {
            const connection = getConnection();

            const projectRepository = connection.getRepository(Project);
            const projectUserRepository = connection.getRepository(ProjectUser);
            const userRepository = connection.getRepository(User);

            const project = await projectRepository.findOne(req.params.projectId);

            if (!project) {
                req.session.error = "Project does not exist or you are not authorised to see it";
                res.redirect("/projects/list");
                return;
            }

            const projectUser = project.ProjectUsers.find(x => x.User.Id == req.session.userId);

            if (!projectUser) {
                req.session.error = "Project does not exist or you are not authorised to see it";
                res.redirect("/projects/list");
                return;
            }

            if (projectUser.Role != UserProjectRole.Admin) {
                req.session.error = "Unauthorised";
                res.redirect("/projects/list");
                return;
            }

            const user = await userRepository.findOne(req.params.userId);

            if (!user) {
                req.session.error = "User does not exist";
                res.redirect(`/projects/view/${project.Id}`);
                return;
            }

            const assignedProjectUser = new ProjectUser(uuid(), UserProjectRole.Member, project, user);
            await projectUserRepository.save(assignedProjectUser);

            req.session.success = "Assigned user to project";
            res.redirect(`/projects/view/${project.Id}`);
        });
    }
}