import { hash } from "bcrypt";
import { format } from "datefns";
import { es } from "date-fns/locale";
import process from "node:process";
import admin from "firebase_admin";
import {readJson} from "https://deno.land/x/jsonfile@1.0.0/mod.ts";
import { Context } from "@oak/oak";
import { createJWT } from "../utils/jwt.ts";
import nodemailer from "npm:nodemailer";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

if (!admin.apps.length) {
  const serviceAccount = await readJson("./config/firebase.json") as Record<string, string>;
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export const authController = {

    registro: async (ctx: Context) => {
        const { apellidoPaterno, apellidoMaterno, 
            nombres, email, matricula, grupos, 
            horasRestringidas, materiasAsignadas, idAdmin } = await ctx.request.body({type: "json"}).value;

        if(!apellidoPaterno || !apellidoMaterno || !nombres || !email || !matricula || !grupos || !horasRestringidas || !materiasAsignadas || !idAdmin){
            ctx.response.status = 400;
            ctx.response.body = {
                statusCode: 400,
                intMessage: "Datos incompletos",
                data:{ message: "todos los campos son requeridos"},
            };
            return;
        }

        try{
            const professorQuery = await db.collection("profesores").where("email", "==", email).get();
            if(!professorQuery.empty){
                ctx.response.status = 409;
                ctx.response.body = {
                    statusCode: 409,
                    intMessage: "Conflicto",
                    data: { message: "El email ya esta en uso"},
                };
                return;
            }

            const nuevoProfesor = await db.collection("profesores").add({
                apellidoPaterno, 
                apellidoMaterno,
                nombres,
                email,
                matricula,
                grupos,
                horasRestringidas,
                materiasAsignadas,
                idAdmin,
                activo: false
            });

            await nuevoProfesor.update({idProfesor: nuevoProfesor.id});

            const token = await createJWT({ id: nuevoProfesor.id, tipo: "activacion" }, "1d");

            const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "warrido34@gmail.com",
                pass: process.env.EMAIL_PASSWORD,
            },
            });

            const mailOptions = {
            from: '"Plataforma Educativa" <warrido34@gmail.com>',
            to: email,
            subject: "Activación de cuenta de profesor",
            html: `
                <p>Hola ${nombres},</p>
                <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
                <a href="https://tusitio.com/activar-cuenta?token=${token}">Activar cuenta</a>
                <p>Si no solicitaste esto, puedes ignorar este mensaje.</p>
            `,
            };

            await transporter.sendMail(mailOptions);

            await db.collection("usuarios").add({
                usuario: null,
                password: null,
                email,
                telefono: null,
                fechaNacimiento: null,
                last_login: "",
                rol: "OPnlSKOdhPj5Xdm11gqf",
                mfaActivo: false,
                usuarioId: nuevoProfesor.id,
                activationToken: token 
            });

            ctx.response.status = 201;
            ctx.response.body = {
                statusCode: 201,
                intMessage: "Creado",
                data: { message: "Registro de profesor exitoso" },
            };

        }catch(error){
            console.error("Error en registro:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                statusCode: 500,
                intMessage: "Error",
                data: { message: "Error al crear el profesor o usuario" },
            };
        }
    },
    
    activarProfesor: async (ctx: Context) => {
        const { email, phone, dob, username, password, activationToken } = await ctx.request.body({type: "json"}).value;

        if(!email || !phone || !dob || !username || !password || !activationToken){
            ctx.response.status = 400;
            ctx.response.body = {
                statusCode: 400,
                intMessage: "Datos incompletos",
                data: { message: "Se necesitan todos los datos"},
            }
            return;
        }

        try {
            
            const usuarioQuery = await db.collection("usuarios").where("email", "==", email).get();

            if (usuarioQuery.empty) {
                ctx.response.status = 404;
                ctx.response.body = {
                    statusCode: 404,
                    intMessage: "Usuario no encontrado",
                    data: { message: "No se encontró un usuario con ese email" },
                };
                return;
            }

            const usuarioDoc = usuarioQuery.docs[0];
            const dataUsuario = usuarioDoc.data();

            if(dataUsuario.activationToken !== activationToken){
                ctx.response.status = 401;
                ctx.response.body = {
                    statusCode: 401,
                    intMessage: "Token Invalido",
                    data: { message: "El token de activacion no coincide"}
                };
                return;
            }
            
            const hashPassword = await hash(password);
            const fecha = format(new Date(dob), "dd/MM/yyyy", { locale: es });

            await db.collection("usuarios").doc(usuarioDoc.id).update({
                telefono: phone,
                fechaNacimiento: fecha,
                usuario: username,
                password: hashPassword,
                activationToken: null
            });

            await db.collection("profesores").doc(dataUsuario.usuarioId).update({
                activo: true
            });

            ctx.response.status = 200;
            ctx.response.body = {
                statusCode: 200,
                intMessage: "Profesor activado",
                data: { message: "La cuenta ha sido activada correctamente" },
            };

        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                statusCode: 500,
                intMessage: "Error interno del servidor",
                data: { message: "Ocurrió un error al procesar la solicitud" },
            };
        }

    }
}