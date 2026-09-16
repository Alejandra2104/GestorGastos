/* Configuración de la nube familiar (Supabase).
   La clave "anon" es pública por diseño: solo permite llamar a las funciones
   obtener_hogar / guardar_hogar con un código de hogar (imposible listar ajenos). */
window.NUBE_CONFIG = {
  SUPABASE_URL: 'https://rvtpplccjdjmskatexun.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dHBwbGNjamRqbXNrYXRleHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NzQyNjUsImV4cCI6MjEwNTE1MDI2NX0.WWwJiFcqnAcm-GjzKUDIynG9M_DigZflUTzh8w2Ucsc'
};
