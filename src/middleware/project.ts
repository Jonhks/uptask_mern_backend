import type { Request, Response, NextFunction } from "express";
import Project, { IProject } from "../models/Proyect";

declare global {
  namespace Express {
    interface Request {
      project: IProject;
    }
  }
}

export const projectExist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error("Proyecto no encontrado");
      res.status(404).json({ errors: error.message });
      return;
    }
    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ errors: "A ocurrido un error" });
    console.log(error);
  }
};
