import { Grupo } from '../interfaces/i_grupo.ts';
import { Profesor } from '../interfaces/i_profesor.ts';
import { Materia } from '../interfaces/i_materia.ts';
import { Horario } from '../interfaces/i_horario.ts';

const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes"];
const HORAS = [8, 9, 10, 11, 12, 13, 14];
const HORA_RECESO = 11;

export function generarHorario(
    grupo: Grupo,
    materias: Materia[],
    profesores: Profesor[]
    ): Horario {
    const horario: Horario = {};
    for (const dia of DIAS) {
        horario[dia] = HORAS.map((hora) => (hora === HORA_RECESO ? "RECESO" : null));
    }

    const materiasDelGrupo = materias.filter(
        (m) =>
        m.nivel.toLowerCase() === grupo.nivel.toLowerCase() &&
        m.grado.toLowerCase() === grupo.grado.toLowerCase()
    );
    console.log("📚 Materias del grupo para asignar:", materiasDelGrupo.map(m => `${m.nombre} (${m.horas}h)`));

    const conteoProfesorDia: Record<string, Record<string, number>> = {};

    for (const materia of materiasDelGrupo) {
        let horasPendientes = materia.horas;

        const profesoresAsignados = profesores.filter((p) =>
            Array.isArray(p.materias) &&
            p.materias.includes(materia.id)
        );


        console.log(`\n🧱 Asignando materia: ${materia.nombre} (${materia.horas}h)`);
        console.log(`👨‍🏫 Profesores disponibles para ${materia.nombre}:`, profesoresAsignados.map(p => p.nombre));

        let intentos = 0;

        while (horasPendientes > 0 && intentos < 1000) {
        intentos++;
        const dia = DIAS[Math.floor(Math.random() * DIAS.length)];
        const horaIndex = Math.floor(Math.random() * HORAS.length);
        const hora = HORAS[horaIndex];

        if (hora === HORA_RECESO) {
            console.log(`⏩ ${hora}:00 es hora de RECESO, se omite`);
            continue;
        }

        if (horario[dia][horaIndex]) {
            console.log(`⏩ ${dia} ${hora}:00 ya está ocupado (${horario[dia][horaIndex]})`);
            continue;
        }

        const profesorDisponible = profesoresAsignados.find((p) => {
            if (p.horasNoDisponibles.includes(hora)) {
            console.log(`⛔ ${p.nombre} no disponible a las ${hora}:00`);
            return false;
            }
            const clasesHoy = conteoProfesorDia[p.id]?.[dia] || 0;
            if (clasesHoy >= 2) {
            console.log(`⚠️ ${p.nombre} ya tiene 2 clases el ${dia}`);
            return false;
            }
            return true;
        });

        if (!profesorDisponible) {
            console.log(`❌ Ningún profesor disponible para ${materia.nombre} el ${dia} a las ${hora}:00`);
            continue;
        }

        horario[dia][horaIndex] = {
            materiaId: materia.id,
            materiaNombre: materia.nombre,
            profesorId: profesorDisponible.id,
            profesorNombre: profesorDisponible.nombre
        };

        if (!conteoProfesorDia[profesorDisponible.id]) {
            conteoProfesorDia[profesorDisponible.id] = {};
        }

        conteoProfesorDia[profesorDisponible.id][dia] =
            (conteoProfesorDia[profesorDisponible.id][dia] || 0) + 1;

        console.log(`✅ ${materia.nombre} asignada el ${dia} a las ${hora}:00 con ${profesorDisponible.nombre}`);
        horasPendientes--;
        }

        if (horasPendientes > 0) {
        console.warn(`⚠️ No se pudieron asignar ${horasPendientes} horas de ${materia.nombre}`);
        }
    }

    return horario;
}
