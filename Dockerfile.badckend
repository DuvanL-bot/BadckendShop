
# =====================================================
# Etapa 1: instalación de dependencias
# =====================================================
FROM node:24-alpine AS deps
 
WORKDIR /app
 
# Copiamos solo los manifiestos primero para aprovechar
# el cache de capas de Docker (si el código cambia pero
# las dependencias no, esta capa no se vuelve a construir)
COPY package*.json ./
 
# Instalación reproducible (requiere package-lock.json)
# y sin dependencias de desarrollo
RUN npm ci --omit=dev
 
 
# =====================================================
# Etapa 2: imagen final, lista para producción
# =====================================================
FROM node:24-alpine AS production
 
ENV NODE_ENV=production \
    PORT=3006
 
WORKDIR /app
 
# Creamos un usuario sin privilegios: nunca correr la app como root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
 
# Copiamos las dependencias ya instaladas desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules
 
# Copiamos el código de la aplicación
COPY --chown=appuser:appgroup . .
 
USER appuser
 
EXPOSE 3006
 
# Healthcheck: confirma que el servidor responde a peticiones HTTP.
# Acepta cualquier código de respuesta porque solo nos interesa saber
# que el proceso de Node sigue vivo y escuchando.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3006/', r => process.exit(0)).on('error', () => process.exit(1))"
 
CMD ["node", "app.js"]