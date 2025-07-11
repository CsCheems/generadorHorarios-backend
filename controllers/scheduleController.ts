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
      const { idGrupo } = await ctx.request.body({ type: "json" }).value;

      const grupoDoc = await db.collection("grupos").doc(idGrupo).get();
      if (!grupoDoc.exists) ctx.throw(404, "Grupo no encontrado");
      const grupo: Grupo = mapearGrupo({ idGrupo, ...grupoDoc.data() });

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

      const profesoresSnap = await db.collection("profesores").get();
      const profesores: Profesor[] = [];
      profesoresSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.grupos && data.grupos.includes(grupo.id)) {
          profesores.push(mapearProfesor(data));
        }
      });

      const horario: Horario = generarHorario(grupo, materias, profesores);

      await db.collection("horarios").doc(grupo.id).set({
        grupo: `${grupo.grado.toUpperCase()}${grupo.nombre}`,
        horario,
        generadoEn: new Date().toISOString()
      });

      ctx.response.status = 200;
      ctx.response.body = {
        grupo: `${grupo.grado.toUpperCase()}${grupo.nombre}`,
        horario,
      };
    } catch (error) {
      console.error("Error generando horario:", error);
      ctx.throw(500, "Error generando el horario");
    }
  },
};
