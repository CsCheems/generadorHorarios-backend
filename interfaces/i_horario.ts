export interface CeldaHorario {
  materiaId: string;
  materiaNombre: string;
  profesorId: string;
  profesorNombre: string;
}

export interface Horario {
  [dia: string]: (CeldaHorario | "RECESO" | null)[];
}

// export interface HorarioEntry {
//     dia: string;
//     hora: number;
//     grupoId: string;
//     materiaId: string;
//     profesorId: string;
// }

// export type Horario = HorarioEntry[][][];