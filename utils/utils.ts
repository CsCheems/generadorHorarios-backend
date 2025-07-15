import { Grupo } from '../interfaces/i_grupo.ts';
import { Profesor } from '../interfaces/i_profesor.ts';

export function normalizarHora(hora: string): number {
    const match = hora.match(/(\d{1,2}):00(am|pm)/i);
    if(!match) return -1;
    let h = parseInt(match[1]);
    if(match[2].toLowerCase() === "pm" && h !== 12) h += 12;
    if (match[2].toLowerCase() === "am" && h === 12) h = 0;
    return h;
}

export function mapearProfesor(doc: any): Profesor {
    return {
        id: doc.idProfesor,
        nombre: `${doc.nombre} ${doc.apellidoPaterno} ${doc.apellidoMaterno}`,
        materias: doc.materiasAsignadas,
        grupos: doc.grupos,
        horasNoDisponibles: Array.isArray(doc.horasRestringidas)
        ? doc.horasRestringidas.map(normalizarHora)
        : [],
    };
}

export function mapearGrupo(doc: any): Grupo {
    return {
        id: doc.idGrupo,
        nivel: doc.nivel.toLowerCase(), 
        grado: doc.grado.toLowerCase(),
        nombre: doc.nombreGrupo.toUpperCase() 
    };
}

