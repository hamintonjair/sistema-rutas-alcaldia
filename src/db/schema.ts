import { pgTable, uuid, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const registrosPoblacion = pgTable('registros_poblacion', {
  id: uuid('id').primaryKey(),
  nombre: text('nombre').notNull(),
  tipoDocumento: text('tipo_documento').notNull(),
  numeroDocumento: text('numero_documento').notNull(),
  telefono: text('telefono'),
  barrio: text('barrio'),
  rangoEdad: text('rango_edad'),
  genero: text('genero'),
  personaDiscapacidad: boolean('persona_discapacidad').default(false),
  tieneEsposo: boolean('tiene_esposo').default(false),
  esposoNombre: text('esposo_nombre'),
  esposoTipoDocumento: text('esposo_tipo_documento'),
  esposoNumeroDocumento: text('esposo_numero_documento'),
  esposoEdad: text('esposo_edad'),
  esposoDiscapacidad: boolean('esposo_discapacidad').default(false),
  tieneHijos: boolean('tiene_hijos').default(false),
  hijos: jsonb('hijos'), // array of objects
  entidad: text('entidad').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
