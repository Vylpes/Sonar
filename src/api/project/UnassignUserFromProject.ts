import { Request, Response, Router } from "express";
import { getConnection } from "typeorm";
import { Page } from "../../contracts/Page";
import { ProjectUser } from "../../entity/ProjectUser";

export class UnassignUserFromProject extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnPost() {
        // TODO: Require Authorisation
        // TODO: Only if user is an admin
        super.router.post('/project/UnassignUserFromProject', (req: Request, res: Response) => {
            const projectUserId = req.body.projectUserId;

            if (!projectUserId) {
                throw new Error("All fields are required: projectUserId");
            }

            const connection = getConnection();

            const projectUserRepository = connection.getRepository(ProjectUser);

            projectUserRepository.findOne({ Id: projectUserId }).then(async projectUser => {
                await projectUserRepository.remove(projectUser);

                res.json(projectUser);
            }).catch(e => {
                throw new Error(e);
            });
        });
    }
}