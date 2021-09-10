import { Request, Response, Router } from "express";
import { getConnection } from "typeorm";
import { Page } from "../../contracts/Page";
import { Project } from "../../entity/Project";

export class GetProjectById extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnGet() {
        // TODO: Require Authorisation
        // TODO: Only if user is a member
        this.router.get('/project/GetProjectById/:projectId', (req: Request, res: Response) => {
            const connection = getConnection();

            const projectRepository = connection.getRepository(Project);

            projectRepository.findOne({ Id: req.params.projectId }).then(project => {
                if (project.ProjectUsers.find(x => x.User.Id == req.session.userId)) {
                    res.json(project);
                } else {
                    throw new Error("Unauthorised");
                }
            }).catch(e => {
                throw new Error(e);
            });
        });
    }
}