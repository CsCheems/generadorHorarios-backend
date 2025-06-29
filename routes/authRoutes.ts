import { Router } from "@oak/oak";
import { authController } from "../controllers/authControllers.ts";

const router = new Router();

router.get("/", authController.salute);

router.post("/auth/registrar", authController.registro);

router.post("/auth/login", authController.login);

export const ruta = router;
