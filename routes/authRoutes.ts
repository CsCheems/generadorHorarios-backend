import {Router} from '@oak/oak';
import {authController} from '../controllers/authControllers.ts';

const router =  new Router();

router.post('/registroUsuario', authController.salute);

export const ruta = router;