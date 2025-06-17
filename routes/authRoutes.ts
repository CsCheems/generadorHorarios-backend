import { Router } from "@oak/oak";
import { authController } from "../controllers/authControllers.ts";

const router = new Router();

router.get("/", authController.salute);

router.post("/registraUsuario", authController.registro);

export const ruta = router;
