import type { Request, Response } from "express";
import Project from "../models/Proyect";
import Task from "../models/Task";

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
      task.project = req.project.id;
      req.project.tasks.push(task.id);
      Promise.allSettled([task.save(), req.project.save()]);
      res.send("Tarea creada");
    } catch (error) {
      res.status(500).json({ errors: "A ocurrido un error" });
    }
  };

  static getTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({
        project: req.project.id,
      }).populate("project");
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ errors: "A ocurrido un error" });
    }
  };

  static getTaskById = async (req: Request, res: Response) => {
    try {
      res.json(req.task);
    } catch (error) {
      res.status(500).json({ errors: "A ocurrido un error" });
    }
  };

  static updateTask = async (req: Request, res: Response) => {
    try {
      req.task.name = req.body.name;
      req.task.description = req.body.description;
      await req.task.save();
      res.send("Tarea actualizada correctamente");
    } catch (error) {
      res.status(500).json({ errors: "A ocurrido un error" });
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    try {
      req.project.tasks = req.project.tasks.filter(
        (task) => task.toString() !== req.task.id.toString()
      );
      await Promise.allSettled([req.task.deleteOne(), req.project.save()]);
      res.send("Tarea eliminada correctamente");
    } catch (error) {
      res.status(500).json({ errors: "A ocurrido un error" });
    }
  };

  static updateStatusTask = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      req.task.status = status;
      await req.task.save();
      res.send("Tarea actualizada");
    } catch (error) {
      res.status(500).json({ errors: "A ocurrido un error" });
    }
  };
}
