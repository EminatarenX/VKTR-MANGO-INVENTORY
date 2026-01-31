# Proyecto: Inventario de Mango por Rejas (Next.js App Router + Tailwind)

## Objetivo
App web para registrar inventario por **rejas/cajas** de mango.
- El usuario **NO cuenta mango 1x1**. Solo ingresa manualmente cuántas rejas entran/salen.
- El precio es **por reja**:
- Compra: ej. 50 MXN / reja
- Venta: ej. 52 MXN / reja
- Ganancia: 2 MXN / reja
- Los **kilos por reja** se configuran por tipo de mango como referencia para reportes.

## Tipos de mango (productos)
Tratar cada tipo de mango como un **Producto** distinto (más simple para UX y reportes):
- Ataulfo: 32–34 kg con caja (promedio sugerido: 33)
- Oro: 32 kg con caja
- Tommy: 30 kg con caja

Nota:
- Para UX simple, guarda un solo valor `avgKgPerCrate`.
- Opcional (mejor exactitud): guardar `minKgPerCrate` y `maxKgPerCrate` además del promedio.

## Alcance MVP
1) Catálogo de productos (tipos de mango):
- nombre (Ataulfo/Oro/Tommy)
- kg promedio por reja (y opcional rango)
- precio_compra_por_reja (default 50)
- precio_venta_por_reja (default 52)

2) Movimientos:
- Registrar ENTRADA (IN): +X rejas
- Registrar SALIDA (OUT): -X rejas
- Cálculos automáticos por movimiento (con snapshot):
- costo = rejas * buyPricePerCrate
- ingreso = rejas * sellPricePerCrate
- ganancia_estimada = ingreso - costo
- kg_estimados = rejas * avgKgPerCrate
- inventoryAfter (rejas)

3) Inventario actual (por tipo y total):
- rejas disponibles por tipo
- kg estimados por tipo
- valor inventario estimado (a costo compra) por tipo
- (opcional) total general sumando tipos

4) Historial/Kardex:
- lista de movimientos con filtros (tipo de mango, fecha, IN/OUT)

5) Reportes:
- semanal / mensual / anual / por rango
- totales por tipo y totales generales

## Reglas importantes
- Unidad base: **REJA**
- Snapshot por movimiento:
- kg promedio
- precio compra
- precio venta
(para que el historial NO cambie si se edita config)
- Validación default:
- NO permitir salidas que dejen inventario negativo para ese tipo de mango.

## Historias de usuario (MVP)

### HU-01 Configurar tipos de mango (productos)
Como admin, quiero configurar productos (Ataulfo/Oro/Tommy) con kg por reja y precios compra/venta
para que movimientos y reportes calculen automático.

Criterios:
- Puedo crear/editar productos.
- Cambios solo aplican a movimientos nuevos.
- Movimientos antiguos conservan snapshot.

### HU-02 Registrar entrada (IN)
Como usuario, quiero registrar una entrada de X rejas seleccionando el tipo de mango
para aumentar inventario y ver costo calculado.

Criterios:
- Guarda movimiento IN.
- Calcula snapshot y totales.
- Actualiza inventarioAfter.

### HU-03 Registrar salida (OUT)
Como usuario, quiero registrar una salida de X rejas seleccionando el tipo de mango
para disminuir inventario y ver ingreso y ganancia estimada.

Criterios:
- Valida stock disponible por ese producto.
- Calcula ingreso/ganancia estimada.
- Actualiza inventarioAfter.

### HU-04 Ver inventario actual
Como usuario, quiero ver inventario por tipo de mango (rejas, kg, valor)
para saber cuánto queda de cada uno.

Criterios:
- Tabla por producto.
- Total general opcional.

### HU-05 Ver movimientos (Kardex)
Como usuario, quiero ver historial de entradas y salidas con filtros
para auditar.

Criterios:
- Filtros: from/to, type(IN/OUT), productId.
- Orden desc por fecha.

### HU-06 Reportes por periodo
Como usuario, quiero resumen semanal/mensual/anual y por rango
para ver totales por tipo y total general.

Criterios:
- Totales IN/OUT y saldo final en rejas.
- Totales en $ (costo, ingreso, ganancia).
- Totales en kg estimados.

## API (Route Handlers) - Endpoints
Base: /api

### Productos (tipos de mango)
- GET /api/products
- POST /api/products
body: { name, avgKgPerCrate, minKgPerCrate?, maxKgPerCrate?, buyPricePerCrate, sellPricePerCrate }
- GET /api/products/:id
- PUT /api/products/:id

### Movimientos
- POST /api/movements
body:
{
"productId": "ataulfo|oro|tommy",
"type": "IN" | "OUT",
"crates": 1100,
"timestamp": "2026-01-30T10:00:00-06:00",
"note": "opcional"
}

response incluye:
- estimatedKg
- buyTotal
- sellTotal
- profitEstimated
- inventoryAfter

- GET /api/movements?productId=&from=YYYY-MM-DD&to=YYYY-MM-DD&type=IN|OUT

### Inventario actual
- GET /api/inventory/summary
response:
{
"items": [
{
"productId": "ataulfo",
"name": "Ataulfo",
"cratesOnHand": 200,
"estimatedKgOnHand": 6600,
"inventoryValueEstimated": 10000
}
],
"totals": {
"totalCratesOnHand": 500,
"totalEstimatedKgOnHand": 16000,
"totalInventoryValueEstimated": 25000
}
}

### Reportes
- GET /api/reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&productId?=
response:
{
"from": "...",
"to": "...",
"byProduct": [
{
"productId": "tommy",
"totalInCrates": 2400,
"totalInCost": 120000,
"totalOutCrates": 2200,
"totalOutRevenue": 114400,
"profitEstimated": 4400,
"endingCrates": 200,
"estimatedKgIn": 72000,
"estimatedKgOut": 66000,
"estimatedKgEnding": 6000
}
],
"totals": {
"totalInCrates": 2400,
"totalInCost": 120000,
"totalOutCrates": 2200,
"totalOutRevenue": 114400,
"profitEstimated": 4400,
"endingCrates": 200
}
}

## Modelo de datos (DB)
Recomendación: Prisma + SQLite local. En Vercel usar DB externa (Turso/libsql o Postgres).

### Tables

#### Product
- id (string)
- name (string) // Ataulfo/Oro/Tommy
- avgKgPerCrate (number)
- minKgPerCrate (number nullable)
- maxKgPerCrate (number nullable)
- buyPricePerCrate (number) // ej. 50
- sellPricePerCrate (number) // ej. 52
- createdAt
- updatedAt

#### InventoryMovement
- id
- productId (fk)
- type ("IN" | "OUT")
- crates (int)
- timestamp (datetime)
- note (string nullable)

Snapshot:
- snapshotAvgKgPerCrate (number)
- snapshotBuyPricePerCrate (number)
- snapshotSellPricePerCrate (number)

Derived:
- estimatedKg (number)
- buyTotal (number) // siempre calculable = crates * snapshotBuyPricePerCrate
- sellTotal (number) // crates * snapshotSellPricePerCrate (en OUT)
- profitEstimated (number) // sellTotal - buyTotal (en OUT)
- inventoryAfter (int) // rejas después del movimiento, por producto
- createdAt

## Lógica de negocio (servicios)
- getCurrentInventory(productId): obtiene el último movement.inventoryAfter de ese producto o 0.
- createMovement(IN/OUT):
1) valida crates > 0
2) carga Product
3) current = getCurrentInventory(productId)
4) si OUT: valida current >= crates
5) snapshot = {avgKg, buyPrice, sellPrice}
6) calcula estimatedKg, buyTotal, sellTotal/profit (si OUT)
7) inventoryAfter = current +/- crates
8) guarda movimiento

- reportSummary(from,to, productId?):
- filtra movimientos por rango y opcional producto
- agrega por producto:
- sum IN crates, sum IN buyTotal
- sum OUT crates, sum OUT sellTotal, sum OUT profit
- endingCrates:
- por producto: último movement <= to (ideal) o último dentro del rango (simple)
- totals general sumando byProduct

## UI (App Router)
Pantallas:
- / (Dashboard)
- tabla inventario por tipo (Ataulfo/Oro/Tommy)
- total general
- botones: Registrar entrada / Registrar salida
- /movements
- tabla + filtros (tipo, IN/OUT, fechas)
- /in
- form: tipo mango, rejas, fecha, nota
- /out
- form: tipo mango, rejas, fecha, nota
- /settings
- CRUD simple de productos (editar kg y precios)

## Estructura recomendada del repo
- /app
- /(dashboard)/page.tsx
- /movements/page.tsx
- /in/page.tsx
- /out/page.tsx
- /settings/page.tsx
- /api
- /products/route.ts
- /products/[id]/route.ts
- /movements/route.ts
- /inventory/summary/route.ts
- /reports/summary/route.ts
- /lib
- db.ts (prisma client)
- validators.ts (zod)
- services/
- movements.service.ts
- inventory.service.ts
- reports.service.ts

## Definition of Done
- Configurar 3 tipos de mango con sus kg/promedio y precios (50/52).
- Registrar entradas y salidas por tipo.
- Inventario actual por tipo + total.
- Movimientos con filtros.
- Reporte por rango.
- Persistencia local con SQLite funcionando.