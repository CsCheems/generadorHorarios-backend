import { hash, compare } from "bcrypt";
import { format } from "datefns";
import { es } from "date-fns/locale";
import admin from "firebase_admin";
import {readJson} from "https://deno.land/x/jsonfile@1.0.0/mod.ts";
import { Context } from "@oak/oak";
import { moment } from "https://deno.land/x/momentjs@2.29.1-deno/mod.ts";

if (!admin.apps.length) {
  const serviceAccount = await readJson("./config/firebase.json") as Record<string, string>;
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export const authController = {
  salute: (ctx: Context) => {
    return ctx.response.body = {
        statusCode: 200,
        intMessage: "Saludos",
        data: { message: "Hola Mundo!" },
      };
  },

  registro: async (ctx: Context) => {
    const { email, phone, dob, username, password } = await ctx.request.body({ type: "json" }).value;

    if (!email || !phone || !dob || !username || !password) {
      ctx.response.status = 400;
      ctx.response.body = {
        statusCode: 400,
        intMessage: "Datos Incompletos",
        data: { message: "Todos los campos son requeridos" },
      };
      return;
    }

    try {
      const userQuery = await db.collection("usuarios").where("usuario", "==", username).get();
      if (!userQuery.empty) {
        ctx.response.status = 409;
        ctx.response.body = {
          statusCode: 409,
          intMessage: "Conflicto",
          data: { message: "El usuario ya existe" },
        };
        return;
      }

      const emailQuery = await db.collection("usuarios").where("email", "==", email).get();
      if (!emailQuery.empty) {
        ctx.response.status = 409;
        ctx.response.body = {
          statusCode: 409,
          intMessage: "Conflicto",
          data: { message: "El email ya está en uso" },
        };
        return;
      }

      const hashPassword = await hash(password);
      const fecha = format(new Date(dob), "dd/MM/yyyy", { locale: es });

      const nuevoUsuario = await db.collection("usuarios").add({
        usuario: username,
        password: hashPassword,
        email,
        telefono: phone,
        fechaNacimiento: fecha,
        last_login: "",
        rol: "divEXH8fhzEdMw0wwS4y",
        mfaActivo: false,
      });

      await nuevoUsuario.update({ usuarioId: nuevoUsuario.id });

      ctx.response.status = 201;
      ctx.response.body = {
        statusCode: 201,
        intMessage: "Creado",
        data: { message: "Registro exitoso" },
      };
    } catch (error) {
      console.error("Error en registro:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        statusCode: 500,
        intMessage: "Error",
        data: { message: "Error al crear el usuario" },
      };
    }
  },

  login: async (ctx: Context) => {
    const {username, password} = await ctx.request.body({ type: "json" }).value;

    if(!username || !password){
      ctx.response.status = 400;
      ctx.response.body = {
        statusCode: 400,
        intMessage: "Datos Incompletos",
        data: { message: "Todos los campos son requeridos" },
      };
      return;
    }

    try {

      const userQuery = await db.collection("usuarios").where("usuario", "==", username).get();
      
      if (userQuery.empty) {
        ctx.response.status = 404;
        ctx.response.body = {
          statusCode: 404,
          intMessage: "No encontrador",
          data: { message: "El usuario no existe" },
        };
        return;
      }

      const document = userQuery.docs[0];
      const usuario = document.data;
      const pwValida = await compare(password, usuario.password);

      if(!pwValida){
        ctx.response.status = 401;
        ctx.response.body = {
          statusCode: 401,
          intMessage: "No autorizado",
          data: {message: "Contraseña incorrecta"},
        };
        return;
      }

      const roleDoc = await db.collection("roles").doc(usuario.rol).get();

      if(!roleDoc.exists){
        ctx.response.status = 404;
        ctx.response.body = {
          statusCode: 404,
          intMessage: "No encontrado",
          data: {message: "No se encontro el rol de este usuario"},
        };
        return;
      }

      const ultimoLogin = moment().format('DD-MM-YYYY HH:mm:ss');

      await document.ref.update({ last_login: ultimoLogin });

      ctx.response.status = 201;
      ctx.response.body = {
        statusCode : 201,
        intMessage: "Login Existoso",
        data:{
          message: "Credenciales correctas!"
        },
      }
      return;
    } catch (error) {
      console.error("Error en login:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        statusCode: 500,
        intMessage: "Error",
        data: { message: "Error al iniciar sesion" },
      };
    }
  }
};
