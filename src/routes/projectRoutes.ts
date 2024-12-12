import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validations";
import { TaskController } from "../controllers/TaskController";
import { projectExist } from "../middleware/project";
import Task from "../models/Task";
import { taskBelongsToProject, taskExist } from "../middleware/task";
const router = Router();

router.post(
  "/",
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del Proyecto es Obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del Cliente es Obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción del Proyecto es Obligatorio"),
  handleInputErrors,
  ProjectController.createProyect
);

router.get("/", ProjectController.getAllProjects);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("Id no valido"),
  handleInputErrors,
  ProjectController.getProjectById
);

router.put(
  "/:id",
  param("id").isMongoId().withMessage("Id no valido"),
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del Proyecto es Obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del Cliente es Obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción del Proyecto es Obligatorio"),
  handleInputErrors,
  ProjectController.updateProject
);

router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Id no valido"),
  handleInputErrors,
  ProjectController.deleteProject
);

//? Routes for tasks

router.param("projectId", projectExist);
router.param("taskId", taskExist);
router.param("taskId", taskBelongsToProject);

router.post(
  "/:projectId/tasks",
  body("name").notEmpty().withMessage("El nombre de la Tarea es Obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es Obligatoria"),
  // projectExist,
  TaskController.createTask
);

router.get(
  "/:projectId/tasks",
  // projectExist,
  TaskController.getTasks
);

router.get(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("Id no valido"),
  handleInputErrors,
  // projectExist,
  TaskController.getTaskById
);

router.put(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("Id no valido"),
  body("name").notEmpty().withMessage("El nombre de la Tarea es Obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es Obligatoria"),
  handleInputErrors,
  // projectExist,
  TaskController.updateTask
);

router.delete(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("Id no valido"),
  handleInputErrors,
  // projectExist,
  TaskController.deleteTask
);

router.post(
  "/:projectId/tasks/:taskId/status",
  param("taskId").isMongoId().withMessage("Id no valido"),
  body("status").notEmpty().withMessage("El estado es obligatorio"),
  handleInputErrors,
  TaskController.updateStatusTask
);

export default router;