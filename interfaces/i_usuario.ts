export interface UsuarioData {
  usuario: string;
  password: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  last_login: string;
  rol: string;
  mfaActivo: boolean;
  usuarioId?: string;
}