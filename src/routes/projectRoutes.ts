import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validations";
import { TaskController } from "../controllers/TaskController";
import { projectExist } from "../middleware/project";
import {
  hasAuthorization,
  taskBelongsToProject,
  taskExist,
} from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";
const router = Router();

router.use(authenticate);

router.post(
  "/",
  // hasAuthorization,
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

//? Routes for tasks
router.param("projectId", projectExist);

router.put(
  "/:projectId",
  param("projectId").isMongoId().withMessage("Id no valido"),
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
  hasAuthorization,
  ProjectController.updateProject
);

router.delete(
  "/:projectId",
  param("projectId").isMongoId().withMessage("Id no valido"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.deleteProject
);

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
  hasAuthorization,
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
  hasAuthorization,
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

// ? Router for Teams

router.get(
  "/:projectId/team",
  // body("id").isMongoId().withMessage("Id no valido"),
  // handleInputErrors,
  TeamMemberController.getprojectsMember
);

router.post(
  "/:projectId/team/find",
  body("email").isEmail().toLowerCase().withMessage("E-mail no valido"),
  handleInputErrors,
  TeamMemberController.findMemberById
);

router.post(
  "/:projectId/team",
  body("id").isMongoId().withMessage("Id no valido"),
  handleInputErrors,
  TeamMemberController.addMemberById
);

router.delete(
  "/:projectId/team/:userId",
  param("userId").isMongoId().withMessage("Id no valido"),
  handleInputErrors,
  TeamMemberController.removeMemberById
);

// ? Routes for Notes

router.post(
  "/:projectId/tasks/:taskId/notes",
  body("content")
    .notEmpty()
    .withMessage("El contenido de la nota es obligatorio"),
  handleInputErrors,
  NoteController.createNote
);

router.get("/:projectId/tasks/:taskId/notes", NoteController.getTaskNotes);

router.delete(
  "/:projectId/tasks/:taskId/notes/:noteId",
  param("noteId").isMongoId().withMessage("Id no valido"),
  handleInputErrors,
  NoteController.deleteNote
);

export default router;
