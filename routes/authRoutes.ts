import { Router } from "@oak/oak";
import { authController } from "../controllers/authControllers.ts";

const router = new Router();

router.get("/", authController.salute);

router.post("/registraUsuario", authController.registro);

router.post("/loginUsuario", authController.login);

export const ruta = router;
