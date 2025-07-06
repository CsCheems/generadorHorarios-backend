import { hash } from "bcrypt";
import { format } from "datefns";
import { es } from "date-fns/locale";
import process from "node:process";
import { db } from "../config/firebase.ts";
import { Context } from "@oak/oak";
import { createJWT } from "../utils/jwt.ts";
import nodemailer from "npm:nodemailer";
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { nanoid } from "npm:nanoid";


export const profesorController = {

    registro: async (ctx: Context) => {
        const { apellidoPaterno, apellidoMaterno,
            nombre, matricula, email, horasRestringidas, horasTrabajo, grupos, materiasAsignadas } = await ctx.request.body({type: "json"}).value;
            console.log("Datos recibidos:", { apellidoPaterno, apellidoMaterno, nombre, horasRestringidas, horasTrabajo, grupos, materiasAsignadas });

        //if(!apellidoPaterno || !apellidoMaterno || !nombres || !email || !matricula || !grupos || !horasRestringidas || !materiasAsignadas || !idAdmin){
        if(!apellidoPaterno || !apellidoMaterno || !nombre || !horasRestringidas || !horasTrabajo ||  !email || !grupos || !materiasAsignadas){
            ctx.response.status = 400;
            ctx.response.body = {
                statusCode: 400,
                intMessage: "Datos incompletos",
                data:{ message: "todos los campos son requeridos"},
            };
            return;
        }

        try{
            const professorQuery = await db.collection("profesores").where("matricula", "==", matricula).get();
            if(!professorQuery.empty){
                ctx.response.status = 409;
                ctx.response.body = {
                    statusCode: 409,
                    intMessage: "Conflicto",
                    data: { message: "Esta matricula ya esta registrada"},
                };
                return;
            }

            const nuevoProfesor = await db.collection("profesores").add({
                apellidoPaterno, 
                apellidoMaterno,
                nombre,
                matricula,
                grupos,
                horasRestringidas,
                horasTrabajo,
                materiasAsignadas,
                activo: false
            });

            await nuevoProfesor.update({idProfesor: nuevoProfesor.id});

            const token = await createJWT({ id: nuevoProfesor.id, tipo: "activacion" }, "1d");

            const usuarioExistente = await db.collection("usuarios").where("email", "==", email).get();
            if (!usuarioExistente.empty) {
                ctx.response.status = 409;
                ctx.response.body = {
                    statusCode: 409,
                    intMessage: "Conflicto",
                    data: { message: "Este correo ya está en uso" },
                };
                return;
            }

            const usuarioGenerado = matricula;
            const passwordPlano = nanoid(10);
            const hashPassword = await hash(passwordPlano);

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
                    <p>Hola ${nombre},</p>
                    <p>Tu cuenta ha sido registrada en el sistema. Aquí están tus credenciales de acceso:</p>
                    <ul>
                        <li><strong>Usuario:</strong> ${usuarioGenerado}</li>
                        <li><strong>Contraseña:</strong> ${passwordPlano}</li>
                    </ul>
                    <p>Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión.</p>
                    <p>Para activar tu cuenta, haz clic en el siguiente enlace:</p>
                    <a href="https://tusitio.com/activar-cuenta?token=${token}">Activar cuenta</a>
                    <p>Si no solicitaste esto, puedes ignorar este mensaje.</p>
                `,
            };

            await transporter.sendMail(mailOptions);

            await db.collection("usuarios").add({
                usuario: usuarioGenerado,
                password: hashPassword,
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

    },

    listar: async (ctx: Context) => {
        try {
            const profesoresSnapshot = await db.collection("profesores").get();
            const profesores = profesoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Profesores encontrados:", profesores);

            if (profesores.length === 0) {
                ctx.response.status = 404;
                ctx.response.body = {
                    statusCode: 404,
                    intMessage: "No hay profesores registrados",
                    data: { message: "No se encontraron profesores" },
                };
                return;
            }

            ctx.response.status = 200;
            ctx.response.body = {
                statusCode: 200,
                intMessage: "Lista de profesores",
                data: profesores,
            };

        } catch (error) {
            console.error("Error al listar profesores:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                statusCode: 500,
                intMessage: "Error interno del servidor",
                data: { message: "Ocurrió un error al procesar la solicitud" },
            };
        }
    },

    asignacion: async (ctx: Context) => {

        const { idProfesor, materias } = await ctx.request.body({ type: "json" }).value;
        console.log("Datos recibidos para asignación:", { idProfesor, materias });

        if (!idProfesor || !materias || !Array.isArray(materias)) {
            ctx.response.status = 400;
            ctx.response.body = {
                statusCode: 400,
                intMessage: "Datos incompletos",
                data: { message: "Se necesitan todos los datos" },
            };
            return;
        }

        try {
            const profesorDoc = await db.collection("profesores").doc(idProfesor).get();

            if (!profesorDoc.exists) {
                ctx.response.status = 404;
                ctx.response.body = {
                    statusCode: 404,
                    intMessage: "Profesor no encontrado",
                    data: { message: "No se encontró un profesor con ese ID" },
                };
                return;
            }

            await db.collection("profesores").doc(idProfesor).update({
                materiasAsignadas: materias
            });

            ctx.response.status = 200;
            ctx.response.body = {
                statusCode: 200,
                intMessage: "Materias asignadas",
                data: { message: "Las materias han sido asignadas correctamente" },
            };
        } catch (error) {
            console.error("Error al asignar materias:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                statusCode: 500,
                intMessage: "Error interno del servidor",
                data: { message: "Ocurrió un error al procesar la solicitud" },
            };
        }

    }

};