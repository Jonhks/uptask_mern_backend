import type { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

declare global {
  namespace Express {
    interface Request {
      task: ITask;
    }
  }
}

export const taskExist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      const error = new Error("Tarea no encontrada");
      res.status(404).json({ errors: error.message });
      return;
    }
    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({ errors: "A ocurrido un error" });
    console.log(error);
  }
};

export const taskBelongsToProject = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.task.project.toString() !== req.project.id.toString()) {
    const error = new Error("Acción no valida");
    res.status(400).json({ error: error.message });
    return;
  }
  next();
};
