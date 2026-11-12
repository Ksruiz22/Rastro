# Rastro

Observabilidad en microservicios, vista desde una aplicación móvil.

Envía un pago que cruza seis servicios, elige qué falla y Rastro muestra la traza, los logs y las métricas con las que se encuentra la causa.

presentación: _enlace pendiente_

video: _enlace pendiente_

## Ejecutar

```bash
npm install
npx expo start
```

## Verificar

```bash
npm run typecheck
npm test
```

## Flujo

1. Elige un escenario: **Todo bien**, **Pasarela lenta** o **Base caída**
2. **Enviar pago**
3. Lo que ve el cliente: código de respuesta y tiempo total
4. Lo que ve el equipo: la traza en cascada con la causa probable, los logs de esa petición y las métricas de la sesión

## Qué muestra

- **Traza y spans** — el recorrido entrada → autorizador → pedidos → base de datos → pagos → pasarela externa
- **Contexto** — el identificador viaja de un servicio a otro en la cabecera `traceparent` (estándar W3C)
- **Logs** — cada servicio escribe el suyo y el `traceId` los une; la pasarela externa no deja ninguno, es una caja negra
- **Métricas** — peticiones, porcentaje con error y latencia p95
- **Causa raíz** — el síntoma aparece en la entrada, el fallo nace en el span más profundo que falló

Todo se simula en el teléfono con un reloj virtual: no hay servidores ni se envían datos. **Pasarela lenta** reproduce el caso de la exposición, donde pagos espera a la pasarela hasta agotar el tiempo.

## Arquitectura

Clean Architecture en `src/`:

- `domain/` — entidades, casos de uso, puertos y reglas (contexto de traza, causa raíz, métricas), sin Expo
- `data/` — cadena de servicios simulada y repositorios en memoria
- `presentation/` — hook y componentes UI
- `di/` — composition root
- `app/` — rutas Expo Router
