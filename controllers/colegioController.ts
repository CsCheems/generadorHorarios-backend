import { db } from "../config/firebase.ts";
import { hash, compare } from "bcrypt";
import { format } from "datefns";
import { es } from "date-fns/locale";
import { Context } from "@oak/oak";
import moment from "npm:moment";
import { createJWT } from "../utils/jwt.ts";
import { ColegioData } from "../interfaces/i_colegio.ts";

export const colegioController = {

  registrar: async (ctx: Context) => {
    const { claveColegio, nombreColegio, direccion, telefono, email } = await ctx.request.body({ type: "json" }).value;
    console.log("Datos recibidos:", { claveColegio, nombreColegio, direccion, telefono, email });
    if (!claveColegio || !nombreColegio || !direccion || !telefono || !email) {
      ctx.response.status = 400;
      ctx.response.body = {
        statusCode: 400,
        intMessage: "Datos incompletos",
        data: { message: "Todos los campos son requeridos" },
      };
      return;
    }

    try {
      const colegioQuery = await db.collection("colegios").where("email", "==", email).get();
      if (!colegioQuery.empty) {
        ctx.response.status = 409;
        ctx.response.body = {
          statusCode: 409,
          intMessage: "Conflicto",
          data: { message: "El email ya está en uso" },
        };
        return;
      }

      const nuevoColegio = await db.collection("colegios").add({
        nombreColegio,
        direccion,
        telefono,
        email,
      });

      await nuevoColegio.update({ idColegio: nuevoColegio.id });

      ctx.response.status = 201;
      ctx.response.body = {
        statusCode: 201,
        intMessage: "Registro exitoso",
        data: { idColegio: nuevoColegio.id },
      };

    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        statusCode: 500,
        intMessage: "Error interno del servidor",
        data: { message: error.message },
      };
    }
  },

  listar: async (ctx: Context) => {
    try {
      const colegiosSnapshot = await db.collection("colegios").get();
      const colegios = colegiosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Colegios encontrados:", colegios);

      ctx.response.status = 200;
      ctx.response.body = {
        statusCode: 200,
        intMessage: "Lista de colegios",
        data: colegios,
      };

    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        statusCode: 500,
        intMessage: "Error interno del servidor",
        data: { message: error.message },
      };
    }
  },

  obtenerPorId: async (ctx: Context) => {
    const id = ctx.params.id;  
    if (!id) {
      ctx.response.status = 400;
      ctx.response.body = {
        statusCode: 400,
        intMessage: "ID requerido",
        data: { message: "El ID del colegio es requerido" },
      };
      return;
    }
    try {
      const colegioDoc = await db.collection("colegios").doc(id).get();
      if (!colegioDoc.exists) {
        ctx.response.status = 404;
        ctx.response.body = {
          statusCode: 404,
          intMessage: "Colegio no encontrado",
          data: { message: "No se encontró un colegio con ese ID" },
        };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = {
        statusCode: 200,
        intMessage: "Colegio encontrado",
        data: { id: colegioDoc.id, ...colegioDoc.data() },
      };

    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        statusCode: 500,
        intMessage: "Error interno del servidor",
        data: { message: error.message },
      };
    }
    },

}