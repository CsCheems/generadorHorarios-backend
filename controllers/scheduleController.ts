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

      // Obtener grupo
      const grupoDoc = await db.collection("grupos").doc(grupoId).get();
      if (!grupoDoc.exists) {
        console.warn("⚠️ Grupo no encontrado:", grupoId);
        ctx.throw(404, "Grupo no encontrado");
      }
      const grupo: Grupo = mapearGrupo({ grupoId, ...grupoDoc.data() });
      console.log("🏫 Grupo obtenido:", grupo);

      // Obtener materias del grupo
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

      // Obtener profesores que imparten al menos una de las materias del grupo
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

      // Generar horario
      console.log("🧩 Generando horario...");
      const horario: Horario = generarHorario(grupo, materias, profesores);
      console.log("📆 Horario generado con éxito:");
      for (const dia in horario) {
        console.log(`📅 ${dia}:`, horario[dia]);
      }

      // Guardar en base de datos
      await db.collection("horarios").doc(grupo.id).set({
        grupo: `${grupo.grado.toUpperCase()}${grupo.nombre}`,
        horario,
        generadoEn: new Date().toISOString()
      });
      console.log("💾 Horario guardado en Firebase con éxito.");

      // Respuesta
      ctx.response.status = 200;
      ctx.response.body = {
        grupo: `${grupo.grado.toUpperCase()}${grupo.nombre}`,
        horario,
      };
      console.log("✅ Respuesta enviada al cliente.");
    } catch (error) {
      console.error("❌ Error generando horario:", error);
      ctx.throw(500, "Error generando el horario");
    }
  },
};
