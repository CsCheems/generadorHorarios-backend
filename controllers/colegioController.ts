import { db } from "../config/firebase.ts";
import { hash, compare } from "bcrypt";
import { format } from "datefns";
import { es } from "date-fns/locale";
import { Context } from "@oak/oak";
import moment from "npm:moment";
import { createJWT } from "../utils/jwt.ts";
import { ColegioData } from "../interfaces/i_colegio.ts";

export const colegioController = {

  // registrar: async (ctx: Context) => {
  //   const { claveColegio, nombreColegio, direccion, telefono, email } = await ctx.request.body({ type: "json" }).value;
  //   console.log("Datos recibidos:", { claveColegio, nombreColegio, direccion, telefono, email });
  //   if (!claveColegio || !nombreColegio || !direccion || !telefono || !email) {
  //     ctx.response.status = 400;
  //     ctx.response.body = {
  //       statusCode: 400,
  //       intMessage: "Datos incompletos",
  //       data: { message: "Todos los campos son requeridos" },
  //     };
  //     return;
  //   }

  //   try {
  //     const colegioQuery = await db.collection("colegios").where("email", "==", email).get();
  //     if (!colegioQuery.empty) {
  //       ctx.response.status = 409;
  //       ctx.response.body = {
  //         statusCode: 409,
  //         intMessage: "Conflicto",
  //         data: { message: "El email ya está en uso" },
  //       };
  //       return;
  //     }

  //     const nuevoColegio = await db.collection("colegios").add({
  //       nombreColegio,
  //       direccion,
  //       telefono,
  //       email,
  //     });

  //     await nuevoColegio.update({ idColegio: nuevoColegio.id });

  //     ctx.response.status = 201;
  //     ctx.response.body = {
  //       statusCode: 201,
  //       intMessage: "Registro exitoso",
  //       data: { idColegio: nuevoColegio.id },
  //     };

  //   } catch (error) {
  //     ctx.response.status = 500;
  //     ctx.response.body = {
  //       statusCode: 500,
  //       intMessage: "Error interno del servidor",
  //       data: { message: error.message },
  //     };
  //   }
  // },

  // listar: async (ctx: Context) => {
  //   try {
  //     const colegiosSnapshot = await db.collection("colegios").get();
  //     const colegios = colegiosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //     console.log("Colegios encontrados:", colegios);

  //     ctx.response.status = 200;
  //     ctx.response.body = {
  //       statusCode: 200,
  //       intMessage: "Lista de colegios",
  //       data: colegios,
  //     };

  //   } catch (error) {
  //     ctx.response.status = 500;
  //     ctx.response.body = {
  //       statusCode: 500,
  //       intMessage: "Error interno del servidor",
  //       data: { message: error.message },
  //     };
  //   }
  // },

  /*obtenerPorId: async (ctx: Context) => {
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
    },*/

  registrarGrupo: async (ctx: Context) => {
    //const { nombreGrupo, nivel, grado, idColegi } = await ctx.request.body({ type: "json" }).value;
    const { nombreGrupo, nivel, grado } = await ctx.request.body({ type: "json" }).value;


    //if (!nombreGrupo || !nivel || !grado || !idColegio) {
    if (!nombreGrupo || !nivel || !grado) {
      ctx.response.status = 400;
      ctx.response.body = {
        statusCode: 400,
        intMessage: "Datos incompletos",
        data: { message: "Todos los campos son requeridos" },
      };
      return;
    }

    try {
      /*const colegioDoc = await db.collection("colegios").doc(idColegio).get();
      if (!colegioDoc.exists) {
        ctx.response.status = 404;
        ctx.response.body = {
          statusCode: 404,
          intMessage: "Colegio no encontrado",
          data: { message: "No se encontró un colegio con ese ID" },
        };
        return;
      }*/

      // const nuevoGrupo = await db.collection("grupos").add({
      //   nombreGrupo,
      //   nivel,
      //   grado,
      //   idColegio,
      // });

      const nuevoGrupo = await db.collection("grupos").add({
        nombreGrupo,
        nivel,
        grado,
      });

      await nuevoGrupo.update({ idGrupo: nuevoGrupo.id });

      ctx.response.status = 201;
      ctx.response.body = {
        statusCode: 201,
        intMessage: "Grupo registrado",
        data: { idGrupo: nuevoGrupo.id },
      };

    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        statusCode: 500,
        intMessage: "Error interno del servidor",
        data: { message: "Error al registrar grupo"},
      };
    }
  },

   gruposLista: async (ctx: Context) => {
    try {
      const gruposSnapshot = await db.collection("grupos").get();
      const grupos = gruposSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (grupos.length === 0) {
        ctx.response.status = 404;
         ctx.response.body = {
          statusCode: 404,
           intMessage: "No se encontraron grupos",
           data: { message: "No hay grupos registrados" },
         };
         return;
       }

       ctx.response.status = 200;
       ctx.response.body = {
         statusCode: 200,
         intMessage: "Grupos encontrados",
         data: grupos,
       };

     } catch (error) {
       ctx.response.status = 500;
       ctx.response.body = {
       statusCode: 500,
        intMessage: "Error interno del servidor",
        data: { message: "Error al listar grupos" },
       };
     }
   },

  /*const colegioDoc = await db.collection("colegios").doc(idColegio).get();
      if (!colegioDoc.exists) {
        ctx.response.status = 404;
        ctx.response.body = {
          statusCode: 404,
          intMessage: "Colegio no encontrado",
          data: { message: "No se encontró un colegio con ese ID" },
        };
        return;
      }*/

  materiaRegistrar: async (ctx: Context) => {
    const { nombreMateria, horas, nivel, grado } = await ctx.request.body({ type: "json" }).value;
    //console.log("Datos recibidos para registrar materia:", { nombreMateria, horas, nivel, grado });
    if (!nombreMateria || !horas) {
      ctx.response.status = 400;
      ctx.response.body = {
        statusCode: 400,
        intMessage: "Datos incompletos",
        data: { message: "Todos los campos son requeridos" },
      };
      return;
    }
    try {
      
      const nuevaMateria = await db.collection("materias").add({
        nombreMateria,
        horas,
        nivel,
        grado
      });

      await nuevaMateria.update({ idMateria: nuevaMateria.id });

      ctx.response.status = 201;
      ctx.response.body = {
        statusCode: 201,
        intMessage: "Materia registrada",
        data: { idMateria: nuevaMateria.id },
      };

    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        statusCode: 500,
        intMessage: "Error interno del servidor",
        data: { message: "Error al registrar materias" },
      };
    }
  },

  lista : async (ctx: Context) => {
    try {
      const materiasSnapshot = await db.collection("materias").get();
      const materias = materiasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      //console.log("Materias encontradas:", materias);

      ctx.response.status = 200;
      ctx.response.body = {
        statusCode: 200,
        intMessage: "Lista de materias",
        data: materias,
      };

    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        statusCode: 500,
        intMessage: "Error interno del servidor",
        data: { message: "Error al listar materias" },
      };
    }
  },

  eliminarMateria: async (ctx: Context) => {
    const materiaId = ctx.params.id;
    
    if (!materiaId) {
      ctx.response.status = 400;
      ctx.response.body = {
        statusCode: 400,
        intMessage: "ID requerido",
        data: { message: "El ID de la materia es requerido" },
      };
      return;
    }

    try {
      const materiaDoc = await db.collection("materias").doc(materiaId).get();
      
      if (!materiaDoc.exists) {
        ctx.response.status = 404;
        ctx.response.body = {
          statusCode: 404,
          intMessage: "Materia no encontrada",
          data: { message: "No se encontró una materia con ese ID" },
        };
        return;
      }

      await db.collection("materias").doc(materiaId).delete();

      ctx.response.status = 200;
      ctx.response.body = {
        statusCode: 200,
        intMessage: "Materia eliminada",
        data: { message: "Materia eliminada exitosamente" },
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

  eliminarGrupo: async (ctx: Context) => {
    const grupoId = ctx.params.id;
    
    if (!grupoId) {
      ctx.response.status = 400;
      ctx.response.body = {
        statusCode: 400,
        intMessage: "ID requerido",
        data: { message: "El ID del grupo es requerido" },
      };
      return;
    }

    try {
      const grupoDoc = await db.collection("grupos").doc(grupoId).get();
      
      if (!grupoDoc.exists) {
        ctx.response.status = 404;
        ctx.response.body = {
          statusCode: 404,
          intMessage: "Grupo no encontrado",
          data: { message: "No se encontró un grupo con ese ID" },
        };
        return;
      }

      await db.collection("grupos").doc(grupoId).delete();

      ctx.response.status = 200;
      ctx.response.body = {
        statusCode: 200,
        intMessage: "Grupo eliminado",
        data: { message: "Grupo eliminado exitosamente" },
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