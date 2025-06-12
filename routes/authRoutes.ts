import { Router } from "@oak/oak";
import { authController } from "../controllers/authControllers.ts";

const router = new Router();

router.get("/", (ctx) => {
    ctx.response.body = authController.salute();
});

router.post("/registraUsuario", async (ctx) => {
    ctx.response.body = await authController.registro(ctx);
})

export const ruta = router;
