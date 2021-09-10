import { Request, Response, Router } from "express";
import { getConnection } from "typeorm";
import { UserProjectRole } from "../../constants/UserProjectRole";
import { Page } from "../../contracts/Page";
import { ProjectUser } from "../../entity/ProjectUser";

export class ToggleAdmin extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnPost() {
        // TODO: Authorise
        // TODO: Only if user is admin
        // TODO: Only if its not themselves
        super.router.post('/project/ToggleAdmin', (req: Request, res: Response) => {
            const projectUserId = req.body.projectUserId;

            if (!projectUserId) {
                throw new Error("Required fields: projectUserId");
            }

            const connection = getConnection();

            const projectUserRepository = connection.getRepository(ProjectUser);

            projectUserRepository.findOne({ Id: projectUserId }).then(projectUser => {
                projectUser.ToggleAdmin();

                projectUserRepository.save(projectUser);
            }).catch(e => {
                throw new Error(e);
            });
        });
    }
}