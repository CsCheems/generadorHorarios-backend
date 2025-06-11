import { hash } from "bcrypt";
import { format } from "datefns";
import { es } from "date-fns/locale";

import { Context } from "@oak/oak";
import { db } from "../config/firebase.ts";

export const authController = {
  salute: () => {
    return "Test: HOLA";
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
};
