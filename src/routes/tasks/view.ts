import { Request, Response, Router } from "express";
import { UserProjectPermissions } from "../../constants/UserProjectRole";
import { Page } from "../../contracts/Page";
import { ProjectUser } from "../../entity/ProjectUser";
import { Task } from "../../entity/Task";
import { UserMiddleware } from "../../middleware/userMiddleware";

export class View extends Page {
    constructor(router: Router) {
        super(router);
    }

    public OnGet() {
        super.router.get('/view/:taskString', UserMiddleware.Authorise, async (req: Request, res: Response) => {
            const taskString = req.params.taskString;

            const task = await Task.GetTaskByTaskString(taskString, req.session.User);

            if (!task) {
                req.session.error = "Task not found";
                res.redirect('/tasks/list');
                return;
            }

            res.locals.viewData.task = task;
            
            if (task.Archived) {
                res.locals.viewData.canEditTask = false;
                res.locals.viewData.canAssignTask = false;
                res.locals.viewData.canArchiveTask = true;
            } else {
                res.locals.viewData.canEditTask = await ProjectUser.HasPermission(task.Project.Id, req.session.User.Id, UserProjectPermissions.TaskUpdate);
                res.locals.viewData.canAssignTask = await ProjectUser.HasPermission(task.Project.Id, req.session.User.Id, UserProjectPermissions.TaskAssign);
                res.locals.viewData.canArchiveTask = res.locals.viewData.canEditTask;
            }
            
            res.render('tasks/view', res.locals.viewData);
        });
    }
}