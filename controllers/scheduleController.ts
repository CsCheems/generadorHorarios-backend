import { Grupo } from '../interfaces/i_grupo.ts';
import { Profesor } from '../interfaces/i_profesor.ts';
import { Materia } from '../interfaces/i_materia.ts';
import { Horario } from '../interfaces/i_horario.ts';
import { Context } from "@oak/oak";
import { mapearProfesor, mapearGrupo } from '../utils/utils.ts';
import { generarHorario } from '../utils/generadorHorario.ts';
import { db } from "../config/firebase.ts";

export const scheduleController = {
  generarHorario: async (ctx: Context) => {
    try {
      console.log("📥 Recibiendo solicitud para generar horario...");
      const { grupoId } = await ctx.request.body({ type: "json" }).value;
      console.log("✅ ID del grupo recibido:", grupoId);

      const grupoDoc = await db.collection("grupos").doc(grupoId).get();
      if (!grupoDoc.exists) {
        console.warn("⚠️ Grupo no encontrado:", grupoId);
        ctx.throw(404, "Grupo no encontrado");
      }
      const grupo: Grupo = mapearGrupo({ grupoId, ...grupoDoc.data() });
      console.log("🏫 Grupo obtenido:", grupo);

      const materiasSnap = await db.collection("materias").get();
      const materias: Materia[] = [];
      materiasSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (
          data.nivel.toLowerCase() === grupo.nivel.toLowerCase() &&
          data.grado.toLowerCase() === grupo.grado.toLowerCase()
        ) {
          materias.push({
            id: data.idMateria,
            nombre: data.nombreMateria,
            horas: parseInt(data.horas),
            nivel: data.nivel,
            grado: data.grado,
          });
        }
      });
      console.log(`📚 Materias filtradas para el grupo (${materias.length}):`, materias.map(m => `${m.nombre} (${m.horas}h)`));
      const idsMateriasDelGrupo = materias.map((m) => m.id);

      const profesoresSnap = await db.collection("profesores").get();
      const profesores: Profesor[] = [];
      profesoresSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.materiasAsignadas?.some((id: string) => idsMateriasDelGrupo.includes(id))) {
          profesores.push(mapearProfesor(data));
        }
      });
      console.log(`👨‍🏫 Profesores que imparten al menos una materia del grupo (${profesores.length}):`, profesores.map(p => p.nombre));

      const gruposSnap = await db.collection("grupos").get();
      const gruposMismoNivelYGrado: string[] = [];
      gruposSnap.forEach((doc) => {
        const data = doc.data();
        if (
          data.nivel.toLowerCase() === grupo.nivel.toLowerCase() &&
          data.grado.toLowerCase() === grupo.grado.toLowerCase() &&
          doc.id !== grupo.id
        ) {
          gruposMismoNivelYGrado.push(doc.id);
        }
      });

      const horariosExistentes: Record<string, Horario> = {};
      for (const id of gruposMismoNivelYGrado) {
        const horarioDoc = await db.collection("horarios").doc(id).get();
        if (horarioDoc.exists && horarioDoc.data()?.horario) {
          horariosExistentes[id] = horarioDoc.data()!.horario;
        }
      }
      console.log(`📅 Horarios existentes de otros grupos del mismo grado y nivel:`, Object.keys(horariosExistentes));

      console.log("🧩 Generando horario...");
      const horario: Horario = generarHorario(grupo, materias, profesores, horariosExistentes);
      console.log("📆 Horario generado con éxito:");
      for (const dia in horario) {
        console.log(`📅 ${dia}:`, horario[dia]);
      }

      const horarioGenerado = await db.collection("horarios").doc(grupo.id).set({
        grupo: `${grupo.grado.toUpperCase()} ${grupo.nombre}`,
        horarioGrupoId: grupo.id,
        horario,
        Creado: new Date().toISOString(), 
        
      });

      console.log("💾 Horario guardado en Firebase con éxito.");

      ctx.response.status = 200;
      ctx.response.body = {
        grupo: `${grupo.grado.toUpperCase()} ${grupo.nombre}`,
        horario,
      };
      console.log("✅ Respuesta enviada al cliente.");
    } catch (error) {
      console.error("❌ Error generando horario:", error);
      ctx.throw(500, "Error generando el horario");
    }
  },

  listarHorarios: async(ctx: Context) => {
     try {
      const horariosSnapshot = await db.collection("horarios").get();
      const horarios = horariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (horarios.length === 0) {
        ctx.response.status = 404;
         ctx.response.body = {
          statusCode: 404,
           intMessage: "No se encontraron horarios",
           data: { message: "No hay horarios registrados" },
         };
         return;
       }

       ctx.response.status = 200;
       ctx.response.body = {
         statusCode: 200,
         intMessage: "Horarios encontrados",
         data: horarios,
       };

     } catch (error) {
       ctx.response.status = 500;
       ctx.response.body = {
       statusCode: 500,
        intMessage: "Error interno del servidor",
        data: { message: "Error al listar horarios" },
       };
     }
   },

   listarHorarioPorProfesor: async (ctx: Context) => {
    try {
      const profesorId = ctx.state.user?.id;
      if (!profesorId) {
        ctx.throw(401, "No autorizado. Token inválido.");
      }

      // Obtener todos los horarios
      const horariosSnap = await db.collection("horarios").get();
      const horariosFiltrados = [];

      horariosSnap.forEach((doc) => {
        const data = doc.data();
        const horario: Horario = data.horario;

        const horarioFiltrado: Horario = {};

        for (const dia in horario) {
          const bloques = horario[dia];

          // Filtrar solo los bloques donde el profesor esté asignado
          const bloquesDelProfesor = bloques.map((bloque) => {
            if (
              bloque &&
              bloque !== "RECESO" &&
              bloque.profesorId === profesorId
            ) {
              return bloque;
            }
            return null;
          }).filter((b) => b !== null); // Eliminar nulos

          if (bloquesDelProfesor.length > 0) {
            horarioFiltrado[dia] = bloquesDelProfesor;
          }
        }

        if (Object.keys(horarioFiltrado).length > 0) {
          horariosFiltrados.push({
            grupo: data.grupo,
            grupoId: data.horarioGrupoId,
            horario: horarioFiltrado,
          });
        }
      });

      ctx.response.status = 200;
      ctx.response.body = {
        statusCode: 200,
        intMessage: "Horarios del profesor encontrados",
        data: horariosFiltrados,
      };

    } catch (error) {
      console.error("❌ Error al listar horarios del profesor:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        statusCode: 500,
        intMessage: "Error interno del servidor",
        data: { message: "No se pudieron obtener los horarios del profesor" },
      };
    }
  }

};
