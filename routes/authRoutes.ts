import { Router } from "@oak/oak";
import { authController } from "../controllers/authControllers.ts";
import { colegioController } from "../controllers/colegioController.ts";
import { profesorController } from "../controllers/professorController.ts";
import { scheduleController } from "../controllers/scheduleController.ts";
import { authMiddleware } from "../middleware/authMiddleware.ts";

const router = new Router();

router.get("/", authController.salute);

//user
router.post("/auth/registrar", authController.registro);

router.post("/auth/login", authController.login);

//colegio

//router.post("/colegio/registrar", colegioController.registrar);

//router.get("/colegio/listar", colegioController.listar);

//router.get("/colegio/:id", colegioController.obtenerPorId);

router.post("/colegio/registrarGrupo", colegioController.registrarGrupo);

router.get("/colegio/gruposLista", colegioController.gruposLista);

router.post("/colegio/materiaRegistrar", colegioController.materiaRegistrar);

router.get("/colegio/materias", colegioController.lista);

//router.put("/colegio/:id", colegioController.actualizar);

//profesor

//router.post("/profesor/activar", profesorController.activarProfesor);

router.post("/profesor/registrar", profesorController.registro);

router.get("/profesor/listar", profesorController.listar);

router.post("/profesor/asignacion", profesorController.asignacion);

router.post("/horario/crear", scheduleController.generarHorario);

router.get("/horario/listar", scheduleController.listarHorarios);

router.get("/horario/profesor", authMiddleware, scheduleController.listarHorarioPorProfesor);


export const ruta = router;
