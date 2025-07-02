import { Router } from "@oak/oak";
import { authController } from "../controllers/authControllers.ts";
import { colegioController } from "../controllers/colegioController.ts";

const router = new Router();

router.get("/", authController.salute);

router.post("/auth/registrar", authController.registro);

router.post("/auth/login", authController.login);

router.post("/colegio/registrar", colegioController.registrar);

router.get("/colegio/listar", colegioController.listar);

router.get("/colegio/:id", colegioController.obtenerPorId);

//router.put("/colegio/:id", colegioController.actualizar);

export const ruta = router;
