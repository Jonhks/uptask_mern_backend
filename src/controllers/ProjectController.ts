import type { Request, Response } from "express";
import Project from "../models/Proyect";

export class ProjectController {
  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({
        $or: [
          {
            manager: {
              $in: req.user.id,
            },
          },
          {
            team: {
              $in: req.user.id,
            },
          },
        ],
      });
      res.json(projects);
    } catch (error) {
      console.log(error);
    }
  };

  static createProyect = async (req: Request, res: Response) => {
    // ?forma 1
    const project = new Project(req.body);

    // ?Asignación de manager
    project.manager = req.user.id;

    if (!project) {
      const error = new Error("Error al guardar el proyecto");
      res.status(404).json({ error: error.message });
      return;
    }
    try {
      //? forma 1
      await project.save();
      //? forma 2
      // await Project.create(req.body);
      res.send("Proyecto creado");
    } catch (error) {
      console.log(error);
    }
  };

  static getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id).populate("tasks");
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        res.status(404).json({ error: error.message });
        return;
      }
      if (
        project.manager.toString() !== req.user.id.toString() &&
        !project.team.includes(req.user.id)
      ) {
        const error = new Error("Acción no valida");
        res.status(404).json({ error: error.message });
        return;
      }
      res.json(project);
    } catch (error) {
      console.log(error);
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id);
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        res.status(404).json({ error: error.message });
        return;
      }

      if (project.manager.toString() !== req.user.id.toString()) {
        const error = new Error("Acción no valida solo manager puede editarlo");
        res.status(404).json({ error: error.message });
        return;
      }

      project.projectName = req.body.projectName;
      project.clientName = req.body.clientName;
      project.description = req.body.description;
      await project.save();
      res.send("Proyecto actualizado");
    } catch (error) {
      console.log(error);
    }
  };

  static deleteProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      // ? forma 1
      // const project = await Project.findByIdAndDelete(id);
      // ? forma 2
      const project = await Project.findById(id);
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        res.status(404).json({ error: error.message });
        return;
      }
      if (project.manager.toString() !== req.user.id.toString()) {
        const error = new Error("Acción no valida");
        res.status(404).json({ error: error.message });
        return;
      }
      await project.deleteOne();
      res.send("Proyecto eliminado");
    } catch (error) {
      console.log(error);
    }
  };
}
