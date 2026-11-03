# 👟 Documentación y Arquitectura Completa: Pisando Ofertas

Esta nota contiene **todos los tipos de diagramas** conviviendo en el mismo documento de Obsidian.
> 💡 **Tip:** También podés abrir el archivo **`Tablero-Arquitectura.canvas`** que está en esta misma carpeta para ver todos estos diagramas distribuidos en una **pizarra infinita estilo Miro**.

---

## 1. 🧠 Mapa Mental del Ecosistema (Mindmap)

```mermaid
mindmap
  root((Pisando Ofertas))
    Frontend Next.js
      Home Brutalista
        Hero Search
        Marquee Animado
        Mascota Interactiva
      Comparador
        Filtros Rápidos
        Grilla / Lista
        Badge Mejor Descuento
      Detalle Producto
        Historial de Precios
        Talles Disponibles
    Motor de Scraping
      VTEX
        Solo Deportes
        OpenSports
        Dash Deportes
      Magento
        Paginación Completa
      Demandware
      DigitalSport
    Datos y Seguridad
      productos-db.json
      Firebase Firestore
      Filtro esZapatilla
```

---

## 2. 🗄️ Diagrama Entidad-Relación (DER)

```mermaid
erDiagram
    TIENDA ||--o{ PRODUCTO : "publica"
    MARCA ||--o{ PRODUCTO : "fabrica"
    PRODUCTO ||--o{ HISTORIAL_PRECIO : "registra"
    PRODUCTO ||--o{ TALLE_DISPONIBLE : "posee"

    TIENDA {
        string id PK
        string storeName
        string platform "VTEX | Magento | DigitalSport"
        string baseUrl
    }

    MARCA {
        string id PK
        string nombre "Nike | Adidas | Puma | etc"
        string colorFondoHex
    }

    PRODUCTO {
        string id PK
        string name
        number price "Precio en oferta"
        number listPrice "Precio de lista"
        number discount "Porcentaje OFF"
        boolean available
        boolean freeShipping
        string category
        string gender
        string imageUrl
        string productUrl
    }

    HISTORIAL_PRECIO {
        string id PK
        string productoId FK
        string date "YYYY-MM-DD"
        number price
    }

    TALLE_DISPONIBLE {
        string productoId FK
        string size "Ej: 39, 40, 41"
    }
```

---

## 3. 🏛️ Diagrama de Clases (Dominio y Conectores)

```mermaid
classDiagram
    class Producto {
        +String id
        +String name
        +String brand
        +String storeName
        +Number price
        +Number listPrice
        +Number discount
        +String[] sizes
        +Boolean available
        +Boolean freeShipping
        +PrecioHistorico[] priceHistory
        +calcularAhorro() Number
    }

    class FiltrosProductos {
        +String marca
        +String tienda
        +String categoria
        +String talle
        +String genero
        +Number descuentoMinimo
        +Boolean soloStock
        +Boolean envioGratis
    }

    class ConectorTienda {
        <<interface>>
        +String nombreTienda
        +String plataforma
        +obtenerProductos() Promise~Producto[]~
        +normalizarProducto(raw) Producto
    }

    class ConectorVTEX {
        +fetchAPI()
        +extraerTalles()
    }

    class ConectorMagento {
        +paginarCatalogo()
        +parsearPrecios()
    }

    class ServicioComparador {
        +filtrarProductos(productos, filtros) Producto[]
        +ordenarProductos(productos, orden) Producto[]
        +esZapatilla(nombre) Boolean
    }

    ConectorTienda <|.. ConectorVTEX
    ConectorTienda <|.. ConectorMagento
    ServicioComparador ..> Producto : procesa
    ServicioComparador ..> FiltrosProductos : aplica
    ConectorTienda --> Producto : genera
```

---

## 4. 👤 Diagrama de Casos de Uso (UML)

```mermaid
flowchart LR
    %% Actores
    Usuario(["🧑 Usuario / Comprador"])
    Cron(["⏱️ GitHub Action / Cron"])
    Tiendas(["🏪 APIs Tiendas Externas"])

    %% Limite del sistema
    subgraph Sistema ["Sistema Pisando Ofertas"]
        UC1(["Buscar zapatillas por texto"])
        UC2(["Filtrar por talle, marca, tienda y % OFF"])
        UC3(["Identificar 'Mejor Descuento'"])
        UC4(["Ver historial de precios"])
        UC5(["Redirigir a tienda oficial para comprar"])
        UC6(["Sincronizar y limpiar catálogo (esZapatilla)"])
        UC7(["Actualizar base de datos Firestore y JSON"])
    end

    %% Relaciones Usuario
    Usuario --> UC1
    Usuario --> UC2
    Usuario --> UC3
    Usuario --> UC4
    Usuario --> UC5

    %% Relaciones internas (include / extend)
    UC2 -.->|"<<include>>"| UC3
    UC4 -.->|"<<extend>>"| UC5

    %% Relaciones Automatización
    Cron --> UC6
    UC6 --> Tiendas
    UC6 -.->|"<<include>>"| UC7
```
