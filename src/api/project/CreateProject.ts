import { Request, Response, Router } from "express";
import { Connection } from "typeorm";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { v4 as uuid } from "uuid";
import { User } from "../../entity/User";
import { ProjectUser } from "../../entity/ProjectUser";
import { UserProjectRole } from "../../constants/UserProjectRole";

export class CreateProject extends Page {
    private _connection: Connection;

    constructor(router: Router, connection: Connection) {
        super(router);
        this._connection = connection;
    }

    public OnPost() {
        super.router.post('/project/createProject', (req: Request, res: Response) => {
            const projectName = req.body.name;
            const projectDescription = req.body.description;
            const projectTaskPrefix = req.body.taskPrefix;

            if (!projectName || !projectDescription || !projectTaskPrefix) {
                throw new Error("All fields are required: name, description, taskPrefix");
            }

            const userRepository = this._connection.getRepository(User);
            const projectRepository = this._connection.getRepository(Project);
            const projectUserRepository = this._connection.getRepository(ProjectUser);

            userRepository.findOne({ Id: req.session.userId }).then(async user => {
                const project = new Project(uuid(), projectName, projectDescription, projectTaskPrefix, new Date(), false, user);
                await projectRepository.save(project);

                const projectUser = new ProjectUser(uuid(), UserProjectRole.Admin, project, user);
                await projectUserRepository.save(projectUser);

                res.json({
                    project: project,
                    projectUser: projectUser,
                });
            }).catch(e => {
                throw new Error(e);
            });
        });
    }
}