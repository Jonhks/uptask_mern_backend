import { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Proyect";

export class TeamMemberController {
  static findMemberById = async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email }).select("id name email");
    if (!user) {
      const error = new Error("Usuario no encontrado");
      res.status(404).json({ error: error.message });
      return;
    }
    res.json(user);
  };

  static addMemberById = async (req: Request, res: Response) => {
    const { id } = req.body;
    const user = await User.findById(id).select("id");
    if (!user) {
      const error = new Error("Usuario no encontrado");
      res.status(404).json({ error: error.message });
      return;
    }

    if (
      req.project.team.some((team) => team.toString() === user.id.toString())
    ) {
      const error = new Error("Usuario ya existe en el proyecto");
      res.status(409).json({ error: error.message });
      return;
    }

    req.project.team.push(user.id);
    await req.project.save();
    res.json("Usuario agregado correctamente");
  };

  static removeMemberById = async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (
      !req.project.team.some((team) => team.toString() === userId.toString())
    ) {
      const error = new Error("Usuario no existe en el proyecto");
      res.status(409).json({ error: error.message });
      return;
    }

    req.project.team = req.project.team.filter(
      (member) => member.toString() !== userId.toString()
    );
    await req.project.save();
    res.json("Usuario eliminado correctamente");
  };

  static getprojectsMember = async (req: Request, res: Response) => {
    const project = await Project.findById(req.project.id).populate({
      path: "team",
      select: "id email name",
    });
    res.json(project.team);
  };
}
