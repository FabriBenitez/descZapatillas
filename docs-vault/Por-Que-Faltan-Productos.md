# 🚨 Diagnóstico Real: ¿Por qué hay tiendas y productos que NO se reciben?

Hice una auditoría sobre el código real (`src/scripts/scrape-all.ts` y `src/lib/connectors/tiendas-externas.ts`) y sobre lo que **hoy mismo tiene guardado `src/data/productos-db.json`**.

El hallazgo es contundente: **tenemos 24 tiendas configuradas en el código, pero en `productos-db.json` SOLO hay productos de 6 tiendas (7.227 zapatillas en total), y las otras 18 tiendas tienen 0 productos.** Además, Solo Deportes y OpenSports tienen **0 talles** cargados.

---

## 📊 1. Estado Actual de `productos-db.json` (La Evidencia)

| Tienda | Plataforma | Productos en DB hoy | Con Talles cargados | Estado Real |
| :--- | :--- | :---: | :---: | :--- |
| **Solo Deportes** | Magento | 2.591 | **0 (0%)** | ⚠️ Entra sin talles |
| **StockCenter** | Demandware | 2.033 | 1.715 (84%) | ✅ OK |
| **Dexter** | Demandware | 1.002 | 744 (74%) | ✅ OK |
| **Moov** | Demandware | 791 | 765 (96%) | ✅ OK |
| **OpenSports** | Magento | 702 | **0 (0%)** | ⚠️ Entra sin talles |
| **Grid** | VTEX | 108 | 108 (100%) | ⚠️ Pocos (solo los de descuento) |
| **Las otras 18 tiendas** | Todas | **0** | **0** | ❌ **NO SE ESTÁN RECIBIENDO** |

---

## 🛑 2. Diagrama del Embudo: ¿Dónde mueren los productos?

```mermaid
flowchart TD
    Inicio(["🚀 Inicio Scraper (24 Tiendas)"]) --> Bug1

    subgraph Bug1 ["❌ PROBLEMA 1: Orden de Búsquedas + urlProductos (tiendas-externas.ts L1172)"]
        Q1["1ra Búsqueda: query = 'nike'"] --> CheckURL{"¿La tienda tiene urlProductos fijo?<br/>(SoloDeportes, OpenSports, TripStore,<br/>Dionysos, Reebok, Puma)"}
        CheckURL -->|"Sí, y query != 'zapatillas'"| Ignorar["Devuelve [] (Se saltea la tienda en las primeras 12 marcas)"]
        Ignorar --> Q13["Recién en la búsqueda #13 (query = 'zapatillas')<br/>intenta raspar esas tiendas, pero YA SE DESACTIVARON LOS TALLES"]
    end

    Bug1 --> Bug2

    subgraph Bug2 ["❌ PROBLEMA 2: Bloqueo de IP del Datacenter de GitHub Actions"]
        GH["Servidor de GitHub Actions (IP de Azure EE.UU.)"] --> FetchTienda["Intenta hacer fetch() a Adidas, Puma, UnderArmour,<br/>NewBalance, Vans y tiendas VTEX Argentinas"]
        FetchTienda --> Firewall["🛡️ Cloudflare / Akamai / Geo-bloqueo Argentino<br/>Rechaza con 403 Forbidden o Timeout (8s)"]
    end

    Bug2 --> Bug3

    subgraph Bug3 ["❌ PROBLEMA 3: Filtro de Descuento Obligatorio >= 1% (scrape-all.ts L144)"]
        Recibidos["Productos que SÍ respondieron JSON/HTML"] --> CheckDesc{"¿Tiene discount >= 1%?<br/>(listPrice > price)"}
        CheckDesc -->|"No (precio lista == precio actual)"| DescartadoDesc["🗑️ DESCARTADO<br/>(Aunque sea una zapatilla barata o en promoción bancaria)"]
    end

    Bug3 --> Bug4

    subgraph Bug4 ["❌ PROBLEMA 4: Filtro esZapatilla / Categorías (formato.ts)"]
        CheckDesc -->|"Sí (discount >= 1%)"| CheckPalabra{"¿Tiene alguna palabra de terminosExcluidos?<br/>(ej: 'media', 'cordon', 'conjunto', 'traje', 'pala', 'aro')"}
        CheckPalabra -->|"Sí (ej: 'Zapatilla Media Caña' o 'Con Cordones')"| DescartadoFalsoPositivo["🗑️ FALSO POSITIVO DESCARTADO"]
    end

    Bug4 --> BaseDatos(["💾 Guardado final en productos-db.json"])
```
