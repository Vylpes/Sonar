import { Request, Response, Router } from "express";
import { getConnection } from "typeorm";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";
import { ProjectUser } from "../../entity/ProjectUser";
import { User } from "../../entity/User";
import { v4 as uuid } from "uuid";
import { UserProjectRole } from "../../constants/UserProjectRole";

export class AssignUserToProject extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnPost() {
        // TODO: As long as they aren't already assigned
        // TODO: As long as the current user is an admin of the project
        // TODO: As long as they are authorised
        super.router.post('/project/AssignUserToProject', (req: Request, res: Response) => {
            const projectId = req.body.projectId;
            const userId = req.body.userId;

            if (!projectId || !userId) {
                throw new Error("All fields are required: projectId, userId");
            }

            const connection = getConnection();

            const projectRepository = connection.getRepository(Project);
            const userRepository = connection.getRepository(User);
            const projectUserRepository = connection.getRepository(ProjectUser);

            projectRepository.findOne({ Id: projectId }).then(project => {
                userRepository.findOne({ Id: userId }).then(async user => {
                    const projectUser = new ProjectUser(uuid(), UserProjectRole.Member, project, user);

                    await projectUserRepository.save(projectUser);

                    res.json(projectUser);
                });
            }).catch(e => {
                throw new Error(e);
            });
        });
    }
}