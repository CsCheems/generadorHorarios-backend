import { Grupo } from '../interfaces/i_grupo.ts';
import { Profesor } from '../interfaces/i_profesor.ts';
import { Materia } from '../interfaces/i_materia.ts';
import { Horario } from '../interfaces/i_horario.ts';

const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes"];
const HORAS = [8, 9, 10, 11, 12, 13, 14];

export function generarHorario(
    grupo: Grupo,
    materias: Materia[],
    profesores: Profesor[]
    ): Horario {
    const horario: Horario = {};
    for (const dia of DIAS) {
        horario[dia] = Array(HORAS.length).fill(null);
    }

    const grupoNombre = `${grupo.grado.replace("do", "")}${grupo.nombre}`; // ej. "2B"
    const materiasDelGrupo = materias.filter(
        (m) =>
        m.nivel.toLowerCase() === grupo.nivel.toLowerCase() &&
        m.grado.toLowerCase() === grupo.grado.toLowerCase()
    );

    const conteoProfesorDia: Record<string, Record<string, number>> = {};

    for (const materia of materiasDelGrupo) {
        let horasPendientes = materia.horas;
        const profesoresAsignados = profesores.filter(
        (p) =>
            p.materias.includes(materia.nombre) && p.grupos.includes(grupoNombre)
        );

        while (horasPendientes > 0) {
        const dia = DIAS[Math.floor(Math.random() * DIAS.length)];
        const horaIndex = Math.floor(Math.random() * HORAS.length);
        const hora = HORAS[horaIndex];

        if (horario[dia][horaIndex]) continue; // ya hay algo

        const profesorDisponible = profesoresAsignados.find((p) => {
            if (!p.horasDisponibles.includes(hora)) return false;
            if (p.horasNoDisponibles.includes(hora)) return false;
            const clasesHoy = conteoProfesorDia[p.id]?.[dia] || 0;
            return clasesHoy < 2;
        });

        if (!profesorDisponible) continue;

        horario[dia][horaIndex] = materia.nombre;

        if (!conteoProfesorDia[profesorDisponible.id]) {
            conteoProfesorDia[profesorDisponible.id] = {};
        }

        conteoProfesorDia[profesorDisponible.id][dia] =
            (conteoProfesorDia[profesorDisponible.id][dia] || 0) + 1;

        horasPendientes--;
        }
    }

    return horario;
}