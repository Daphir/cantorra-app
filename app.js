/**
 * ==========================================================================
 * Garden Can Torra (Fundat el 1948) - PWA
 * Archivo principal: app.js
 * 
 * Funcionalidades clave:
 * 1. Conexión real con Google Sheets vía fetch() para leer las 10 columnas.
 * 2. Árbol de navegación estricto y dinámico multinivel (Categoría, Subcategoría, Subsección, Variedad).
 * 3. Botones dinámicos de filtrado por 'Marca' basados en el Stock (con conteos y estado 'Agotado').
 * 4. Validación estricta de Stock = 0 ('Agotado' / 'Esgotat').
 * 5. Sistema multiidioma (Català / Español) y modo Claro/Oscuro.
 * 6. Carrito de compra reactivo con reglas de envío (Terrassa y comarca, 48h).
 * 7. Formulario interactivo de Endoterapia con carga y vista previa de imágenes.
 * 8. Soporte PWA y modo Offline vía Service Worker (sw.js).
 * ==========================================================================
 */

// ==========================================================================
// CONFIGURACIÓN DE GOOGLE SHEETS
// Pega aquí el enlace de tu hoja de cálculo publicada en formato CSV:
// En Google Sheets: Fitxer > Compartir > Publicar a la web > Format: Valors separats per comes (.csv)
// ==========================================================================
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/TU_ENLACE_AQUI/pub?output=csv";

//Enviar compras registradas y acciones de Email
const ORDER_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzo-sMi-X2aIG7gkph_Zi8tfEBQRpl80zESHPYH9R0X3_ZGBXHWqfrkAVWSlgaSMBGe/exec";


// Diccionario de Traducciones (Català / Español)
const I18N = {
  ca: {
    tagline: "Des de 1948 • Qualitat & Tradició",
    search_placeholder: "Cercar pinso, llavors, tests...",
    nav_all: "Tots els productes",
    nav_pets: "Mascotes",
    nav_garden: "Hort i Jardí",
    nav_food: "Alimentació km0",
    nav_misc: "Miscel·lània",
    nav_advice: "Assessorament Agrícola",
    nav_endo: "Endoteràpia",
    hero_title: "Tradició i assessorament al teu servei des de 1948",
    hero_subtitle: "Especialistes en sanitat vegetal, nutrició animal i cultiu de proximitat a Terrassa i comarca.",
    hero_advice_btn: "Assessorament Agrònom a Botiga",
    filter_brand_title: "Filtrar per Marques:",
    filter_only_instock: "Només marques amb estoc",
    clear_filters: "Netejar filtres",
    all_brands: "Totes les marques",
    no_brands: "Cap marca disponible en aquesta secció",
    no_products: "No s'ha trobat cap producte amb aquests criteris.",
    cart_title: "La teva Cistella",
    cart_empty: "La cistella està buida.",
    cart_total: "Total a pagar:",
    checkout_delivery_type: "Mètode d'entrega:",
    delivery_pickup: "Recollida a botiga (Gratis)",
    delivery_home: "Repartiment a domicili (48h)",
    checkout_payment_type: "Forma de pagament:",
    checkout_confirm_btn: "Finalitzar Comanda",
    stock_out: "Agotado",
    stock_out_ca: "Esgotat",
    stock_available: "en estoc",
    stock_add: "Afegir a la Cistella",
    order_success: "Comanda rebuda correctament!",
    subcat_all: "Tots",
    subcat_all_in: "Tot a",
    breadcrumb_catalog: "Catàleg General",
    brands_count: "marques",
    brand_count: "marca",
    in_stock_units: "en estoc",
    out_of_stock_tag: "Esgotat"
  },
  es: {
    tagline: "Desde 1948 • Calidad & Tradición",
    search_placeholder: "Buscar pienso, semillas, macetas...",
    nav_all: "Todos los productos",
    nav_pets: "Mascotas",
    nav_garden: "Huerto y Jardín",
    nav_food: "Alimentación km0",
    nav_misc: "Miscelánea",
    nav_advice: "Asesoramiento Agrícola",
    nav_endo: "Endoterapia",
    hero_title: "Tradición y asesoramiento a tu servicio desde 1948",
    hero_subtitle: "Especialistas en sanidad vegetal, nutrición animal y cultivo de proximidad en Terrassa y comarca.",
    hero_advice_btn: "Asesoramiento Agrónomo en Tienda",
    filter_brand_title: "Filtrar por Marcas:",
    filter_only_instock: "Solo marcas con stock",
    clear_filters: "Limpiar filtros",
    all_brands: "Todas las marcas",
    no_brands: "Ninguna marca disponible en esta sección",
    no_products: "No se encontró ningún producto con estos criterios.",
    cart_title: "Tu Cesta de Compra",
    cart_empty: "La cesta está vacía.",
    cart_total: "Total a pagar:",
    checkout_delivery_type: "Método de entrega:",
    delivery_pickup: "Recogida en tienda (Gratis)",
    delivery_home: "Reparto a domicilio (48h)",
    checkout_payment_type: "Forma de pago:",
    checkout_confirm_btn: "Finalizar Pedido",
    stock_out: "Agotado",
    stock_out_ca: "Agotado",
    stock_available: "en stock",
    stock_add: "Añadir al Carrito",
    order_success: "¡Pedido recibido correctamente!",
    subcat_all: "Todos",
    subcat_all_in: "Todo en",
    breadcrumb_catalog: "Catálogo General",
    brands_count: "marcas",
    brand_count: "marca",
    in_stock_units: "en stock",
    out_of_stock_tag: "Agotado"
  }
};

/**
 * ==========================================================================
 * ÁRBOL ESTRICTO DE NAVEGACIÓN (según especificación estricta de SKILL.md)
 * 
 * 1. MASCOTAS:
 *   1.1 Perro (Alimentación [Seca, Húmeda, Snacks], Paseo y Viaje, Higiene,
 *              Descanso, Comederos, Juguetes, Varios)
 *   1.2 Gato (Alimentación, Rascadores, Higiene y Arenas, Paseo, Juguetes, Varios)
 *   1.3 Aves (Alimentación, Jaulas y Cuidado)
 *   1.4 Roedores (Alimentación, Higiene, Equipamiento)
 *   1.5 Peces (Alimentación)
 *   1.6 Tortugas (Alimentación)
 *   1.7 Granja (Alimentación, Equipamiento)
 * 2. HUERTO Y JARDÍN:
 *   Herramientas/Maquinaria, Macetas (Terracota, Plástico), Tierras y Nutrición,
 *   Fitosanitarios (Insecticidas, Fungicidas, Herbicidas, Control Roedores, Trampas, Endoterapia),
 *   Plantas/Cultivo (Semillas, Plantel), Mallas/Riego.
 * 3. ALIMENTACIÓN: Consumo Humano/Proximidad.
 * 4. MISCELÁNEA: Tapones de corcho, Varios.
 * ==========================================================================
 */
const CATALOG_TREE = {
  MASCOTAS: {
    key: "MASCOTAS",
    title_ca: "Mascotes",
    title_es: "Mascotas",
    icon: "🐶",
    subcategories: {
      "Perro": {
        icon: "🐕",
        title_ca: "Perro / Gossos",
        title_es: "Perro",
        items: {
          "Alimentación": ["Seca", "Húmeda", "Snacks"],
          "Paseo y Viaje": [],
          "Higiene": [],
          "Descanso": [],
          "Comederos": [],
          "Juguetes": [],
          "Varios": []
        }
      },
      "Gato": {
        icon: "🐱",
        title_ca: "Gato / Gats",
        title_es: "Gato",
        items: {
          "Alimentación": [],
          "Rascadores": [],
          "Higiene y Arenas": [],
          "Paseo": [],
          "Juguetes": [],
          "Varios": []
        }
      },
      "Aves": {
        icon: "🦜",
        title_ca: "Aves / Ocells",
        title_es: "Aves",
        items: {
          "Alimentación": [],
          "Jaulas y Cuidado": []
        }
      },
      "Roedores": {
        icon: "🐹",
        title_ca: "Roedores / Rosegadors",
        title_es: "Roedores",
        items: {
          "Alimentación": [],
          "Higiene": [],
          "Equipamiento": []
        }
      },
      "Peces": {
        icon: "🐠",
        title_ca: "Peces / Peixos",
        title_es: "Peces",
        items: {
          "Alimentación": []
        }
      },
      "Tortugas": {
        icon: "🐢",
        title_ca: "Tortugas / Tortugues",
        title_es: "Tortugas",
        items: {
          "Alimentación": []
        }
      },
      "Granja": {
        icon: "🐔",
        title_ca: "Granja",
        title_es: "Granja",
        items: {
          "Alimentación": [],
          "Equipamiento": []
        }
      }
    }
  },
  HUERTO_JARDIN: {
    key: "HUERTO_JARDIN",
    title_ca: "Hort i Jardí",
    title_es: "Huerto y Jardín",
    icon: "🪴",
    subcategories: {
      "Herramientas/Maquinaria": {
        icon: "🚜",
        title_ca: "Eines / Maquinària",
        title_es: "Herramientas/Maquinaria",
        items: {}
      },
      "Macetas": {
        icon: "🏺",
        title_ca: "Tests / Macetas",
        title_es: "Macetas",
        items: {
          "Terracota": [],
          "Plástico": []
        }
      },
      "Tierras y Nutrición": {
        icon: "🌱",
        title_ca: "Terres i Nutrició",
        title_es: "Tierras y Nutrición",
        items: {}
      },
      "Fitosanitarios": {
        icon: "🧪",
        title_ca: "Fitosanitaris",
        title_es: "Fitosanitarios",
        items: {
          "Insecticidas": [],
          "Fungicidas": [],
          "Herbicidas": [],
          "Control Roedores": [],
          "Trampas": [],
          "Endoterapia": []
        }
      },
      "Plantas/Cultivo": {
        icon: "🌿",
        title_ca: "Plantes i Cultiu",
        title_es: "Plantas/Cultivo",
        items: {
          "Semillas": [],
          "Plantel": []
        }
      },
      "Mallas/Riego": {
        icon: "💧",
        title_ca: "Malles i Reg",
        title_es: "Mallas/Riego",
        items: {}
      }
    }
  },
  ALIMENTACION: {
    key: "ALIMENTACION",
    title_ca: "Alimentació km0",
    title_es: "Alimentación km0",
    icon: "🍎",
    subcategories: {
      "Consumo Humano/Proximidad": {
        icon: "🥖",
        title_ca: "Consum Humà / Proximitat",
        title_es: "Consumo Humano/Proximidad",
        items: {}
      }
    }
  },
  MISCELANEA: {
    key: "MISCELANEA",
    title_ca: "Miscel·lània",
    title_es: "Miscelánea",
    icon: "🍾",
    subcategories: {
      "Tapones de corcho": {
        icon: "🍾",
        title_ca: "Taps de suro",
        title_es: "Tapones de corcho",
        items: {}
      },
      "Varios": {
        icon: "📦",
        title_ca: "Varis",
        title_es: "Varios",
        items: {}
      }
    }
  }
};

/**
 * Catálogo base de demostración completo que cubre todas las categorías,
 * subcategorías y niveles profundos de la especificación, con variedad
 * de marcas y validación de Stock = 0 (Agotado).
 * Se utiliza cuando SHEET_URL aún no tiene un enlace publicado para que
 * el usuario pueda explorar la experiencia completa de inmediato.
 */
const DEMO_PRODUCTS_TREE = [
  // 1. MASCOTAS > Perro
  {
    Nombre: "Advance Dog Medium Adult amb Pollastre i Arròs 14kg",
    Categoría: "Mascotas",
    Subcategoría: "Perro - Alimentación Seca",
    Marca: "Advance",
    Precio: 54.95,
    Descripción: "Pinso súper prèmium d'alta digestibilitat amb immunoglobulines per a gossos adults de raça mitjana.",
    SKU: "ADV-DOG-MED-14",
    Código_de_Barras: "8410650152431",
    Imagen: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&auto=format&fit=crop&q=60",
    Stock: 15
  },
  {
    Nombre: "Royal Canin Maxi Adult Wet Sobre Humit 140g",
    Categoría: "Mascotas",
    Subcategoría: "Perro - Alimentación Húmeda",
    Marca: "Royal Canin",
    Precio: 2.15,
    Descripción: "Paté sucós d'alta palatabilitat adaptat per a gossos adults de races grans. Reforça la salut articular.",
    SKU: "RC-WET-MAXI-140",
    Código_de_Barras: "3182550858129",
    Imagen: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&auto=format&fit=crop&q=60",
    Stock: 8
  },
  {
    Nombre: "Brekkies Dental Bites Snack Cuidado Bucal",
    Categoría: "Mascotas",
    Subcategoría: "Perro - Snacks",
    Marca: "Brekkies",
    Precio: 2.80,
    Descripción: "Snack cruixent per a la higiene dental diària del gos. Controla la placa i el tosca dental.",
    SKU: "BRK-DENT-01",
    Código_de_Barras: "8410650109923",
    Imagen: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=500&auto=format&fit=crop&q=60",
    Stock: 0 // AGOTADO (prueba de validación Stock = 0)
  },
  {
    Nombre: "Corretja extensible Flexi New Classic Cinta 5m",
    Categoría: "Mascotas",
    Subcategoría: "Perro - Paseo y Viaje",
    Marca: "Flexi",
    Precio: 18.90,
    Descripción: "Corretja retràctil d'alta resistència fabricada a Alemanya, amb fre ràpid i empunyadura ergonòmica.",
    SKU: "FLX-5M-CL",
    Código_de_Barras: "4000498018309",
    Imagen: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&auto=format&fit=crop&q=60",
    Stock: 6
  },
  {
    Nombre: "Xampú dermatològic bio Àloe Vera Caní 300ml",
    Categoría: "Mascotas",
    Subcategoría: "Perro - Higiene",
    Marca: "Menforsan",
    Precio: 7.95,
    Descripción: "Xampú natural pH equilibrat que hidrata, regenera i proporciona lluentor intensa al pelatge.",
    SKU: "MNF-SHAMP-ALOE",
    Código_de_Barras: "8414580001021",
    Imagen: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&auto=format&fit=crop&q=60",
    Stock: 10
  },
  {
    Nombre: "Llit ortopèdic impermeable Memory Foam 85cm",
    Categoría: "Mascotas",
    Subcategoría: "Perro - Descanso",
    Marca: "Ferplast",
    Precio: 42.50,
    Descripción: "Matalàs ergonòmic visc elàstic desenfundable i rentable per a un descans articular òptim.",
    SKU: "FRP-BED-MEM-85",
    Código_de_Barras: "8010690098711",
    Imagen: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=500&auto=format&fit=crop&q=60",
    Stock: 4
  },
  {
    Nombre: "Menjador doble d'acer inoxidable amb base de fusta",
    Categoría: "Mascotas",
    Subcategoría: "Perro - Comederos",
    Marca: "Nayeco",
    Precio: 19.95,
    Descripción: "Bol doble higiènic extraïble de 900ml per bol amb base pesada antilliscant de fusta de bambú.",
    SKU: "NAY-BOWL-WOOD",
    Código_de_Barras: "8425838045129",
    Imagen: "https://images.unsplash.com/photo-1597843797221-50d4f23b204e?w=500&auto=format&fit=crop&q=60",
    Stock: 12
  },
  {
    Nombre: "Joguina KONG Classic resistent vermell L",
    Categoría: "Mascotas",
    Subcategoría: "Perro - Juguetes",
    Marca: "KONG",
    Precio: 14.50,
    Descripción: "Joguina de cautxú natural rebotant i emplenable de premis. Estímul mental i masticatori certificat.",
    SKU: "KONG-RED-L",
    Código_de_Barras: "035585111046",
    Imagen: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500&auto=format&fit=crop&q=60",
    Stock: 9
  },
  {
    Nombre: "Placa identificativa metàl·lica gravada Can Torra",
    Categoría: "Mascotas",
    Subcategoría: "Perro - Varios",
    Marca: "Can Torra",
    Precio: 6.50,
    Descripción: "Placa d'alumini anoditzat inoxidable amb gravat làser personalitzat de nom i telèfon.",
    SKU: "CT-TAG-01",
    Código_de_Barras: "8401948001019",
    Imagen: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&auto=format&fit=crop&q=60",
    Stock: 25
  },

  // 1. MASCOTAS > Gato
  {
    Nombre: "Purina Pro Plan Sterilised Salmó 3kg",
    Categoría: "Mascotas",
    Subcategoría: "Gato - Alimentación",
    Marca: "Pro Plan",
    Precio: 29.95,
    Descripción: "Fórmula científica Optisenses que manté la salut renal i controla el pes en felins esterilitzats.",
    SKU: "PP-CAT-SALM-3",
    Código_de_Barras: "7613035122119",
    Imagen: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=60",
    Stock: 14
  },
  {
    Nombre: "Rascador arbre felí amb torre i cova de peluix 120cm",
    Categoría: "Mascotas",
    Subcategoría: "Gato - Rascadores",
    Marca: "Trixie",
    Precio: 49.00,
    Descripción: "Postes enrotllats de sisal natural resistents amb plataforma superior de descans i joguina penjant.",
    SKU: "TRX-SCRATCH-120",
    Código_de_Barras: "4011905445129",
    Imagen: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&auto=format&fit=crop&q=60",
    Stock: 3
  },
  {
    Nombre: "Sorra de bentonita blanca aglomerant 10L",
    Categoría: "Mascotas",
    Subcategoría: "Gato - Higiene y Arenas",
    Marca: "Sanicat",
    Precio: 11.50,
    Descripción: "Sorra mineral de màxima aglomeració, 99.9% lliure de pols i amb control actiu d'olors d'oxigen.",
    SKU: "SAN-SAND-10L",
    Código_de_Barras: "8411514013412",
    Imagen: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&auto=format&fit=crop&q=60",
    Stock: 20
  },
  {
    Nombre: "Arnés ajustable i corretja de passeig per a gats",
    Categoría: "Mascotas",
    Subcategoría: "Gato - Paseo",
    Marca: "Trixie",
    Precio: 9.90,
    Descripción: "Set de niló transpirable amb tancaments de seguretat de clic per a passejos tranquils.",
    SKU: "TRX-CAT-HARN",
    Código_de_Barras: "4011905418819",
    Imagen: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=500&auto=format&fit=crop&q=60",
    Stock: 5
  },
  {
    Nombre: "Canya telescòpica amb plomes i cascavell",
    Categoría: "Mascotas",
    Subcategoría: "Gato - Juguetes",
    Marca: "Nayeco",
    Precio: 4.50,
    Descripción: "Estimula l'instint natural de caça amb plomes de colors naturals i nansa ergonòmica.",
    SKU: "NAY-CAT-FEATHER",
    Código_de_Barras: "8425838089123",
    Imagen: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=500&auto=format&fit=crop&q=60",
    Stock: 0 // AGOTADO
  },
  {
    Nombre: "Herba gatera Catnip ecològica en brot fresc Can Torra",
    Categoría: "Mascotas",
    Subcategoría: "Gato - Varios",
    Marca: "Can Torra",
    Precio: 3.20,
    Descripción: "Test viu d'herba de blat ecològica cultivada a Terrassa per a la purga natural de boles de pèl.",
    SKU: "CT-CATNIP-01",
    Código_de_Barras: "8401948001026",
    Imagen: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=500&auto=format&fit=crop&q=60",
    Stock: 18
  },

  // 1. MASCOTAS > Aves, Roedores, Peces, Tortugas, Granja
  {
    Nombre: "Barreja llavors selecció periquitos i canaris 1kg",
    Categoría: "Mascotas",
    Subcategoría: "Aves - Alimentación",
    Marca: "Kiki",
    Precio: 3.40,
    Descripción: "Escaiola, mill groc, mill vermell i nègre enriquida amb grànuls vitamínics essencials.",
    SKU: "KIK-BIRD-1KG",
    Código_de_Barras: "8412853001019",
    Imagen: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=500&auto=format&fit=crop&q=60",
    Stock: 16
  },
  {
    Nombre: "Gàbia Voltregà esmaltada blanca per a ocells petits",
    Categoría: "Mascotas",
    Subcategoría: "Aves - Jaulas y Cuidado",
    Marca: "Voltregà",
    Precio: 38.00,
    Descripción: "Fabricada amb pintura epoxi atòxica sense plom. Inclou 2 menjadors i saltadors ergonòmics.",
    SKU: "VOL-CAGE-614",
    Código_de_Barras: "8429886001221",
    Imagen: "https://images.unsplash.com/photo-1549608276-5786777e6587?w=500&auto=format&fit=crop&q=60",
    Stock: 2
  },
  {
    Nombre: "Fenc de muntanya amb flors de camamilla Cunipic 500g",
    Categoría: "Mascotas",
    Subcategoría: "Roedores - Alimentación",
    Marca: "Cunipic",
    Precio: 4.80,
    Descripción: "Alt contingut en fibra insoluble essencial per a la motilitat digestiva i el desgast dental de conills.",
    SKU: "CUN-HAY-500",
    Código_de_Barras: "8437007274011",
    Imagen: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=500&auto=format&fit=crop&q=60",
    Stock: 22
  },
  {
    Nombre: "Jaç vegetal biodegradable Chipsi Citrus 3.2kg",
    Categoría: "Mascotas",
    Subcategoría: "Roedores - Higiene",
    Marca: "Chipsi",
    Precio: 5.95,
    Descripción: "Encenall de fusta tova desempolsada amb aroma suau de llimona per a hàmsters i conills.",
    SKU: "CHP-LITT-32",
    Código_de_Barras: "4002973000854",
    Imagen: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&auto=format&fit=crop&q=60",
    Stock: 15
  },
  {
    Nombre: "Roda d'exercici silenciosa de fusta natural 20cm",
    Categoría: "Mascotas",
    Subcategoría: "Roedores - Equipamiento",
    Marca: "Trixie",
    Precio: 16.50,
    Descripción: "Roda rodament de boles extra suau que protegeix la columna vertebral de rosegadors petits.",
    SKU: "TRX-WHEEL-WOOD",
    Código_de_Barras: "4011905609224",
    Imagen: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=500&auto=format&fit=crop&q=60",
    Stock: 7
  },
  {
    Nombre: "TetraMin Flakes Aliment complet peixos tropicals 250ml",
    Categoría: "Mascotas",
    Subcategoría: "Peces - Alimentación",
    Marca: "Tetra",
    Precio: 7.60,
    Descripción: "Fórmula BioActive que reforça el sistema immunitari i la intensitat de color dels peixos d'aquari.",
    SKU: "TET-MIN-250",
    Código_de_Barras: "4004218726581",
    Imagen: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&auto=format&fit=crop&q=60",
    Stock: 11
  },
  {
    Nombre: "Gammarus i estics proteics per a tortugues d'aigua 500ml",
    Categoría: "Mascotas",
    Subcategoría: "Tortugas - Alimentación",
    Marca: "Sera",
    Precio: 8.90,
    Descripción: "Aliment ric en calci i fòsfor que afavoreix el desenvolupament sa i fort de la closca.",
    SKU: "SER-TURT-500",
    Código_de_Barras: "4001942007123",
    Imagen: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=500&auto=format&fit=crop&q=60",
    Stock: 13
  },
  {
    Nombre: "Pinso complet gallines ponedores en farina sac 25kg",
    Categoría: "Mascotas",
    Subcategoría: "Granja - Alimentación",
    Marca: "Nanta",
    Precio: 17.50,
    Descripción: "Barreja equilibrada amb blat de moro partit, soia i carbonat càlcic per a ous de closca forta.",
    SKU: "NAN-PONED-25KG",
    Código_de_Barras: "8410948001019",
    Imagen: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500&auto=format&fit=crop&q=60",
    Stock: 30
  },
  {
    Nombre: "Abeurador automàtic per a aus amb potes 10L Copele",
    Categoría: "Mascotas",
    Subcategoría: "Granja - Equipamiento",
    Marca: "Copele",
    Precio: 15.90,
    Descripción: "Dipòsit de plàstic translúcid d'alta durabilitat que manté l'aigua neta i protegida de brutícia.",
    SKU: "COP-WAT-10L",
    Código_de_Barras: "8431029070512",
    Imagen: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500&auto=format&fit=crop&q=60",
    Stock: 6
  },

  // 2. HUERTO Y JARDÍN
  {
    Nombre: "Tisores de podar professionals bypass forjades Bellota",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Herramientas/Maquinaria",
    Marca: "Bellota",
    Precio: 24.90,
    Descripción: "Fulla d'acer temperat d'alta precisió per a poda de fruiters, vinya i branques verdes fins a 25mm.",
    SKU: "BEL-PRUN-BYPASS",
    Código_de_Barras: "8414299101021",
    Imagen: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop&q=60",
    Stock: 10
  },
  {
    Nombre: "Motoaixada compacta de benzina 4T per a hort domèstic",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Herramientas/Maquinaria",
    Marca: "Honda",
    Precio: 495.00,
    Descripción: "Motor 4 temps fiable i silenciós. Amplada de treball de 50cm per a cavar i preparar la terra.",
    SKU: "HON-MOTO-FG201",
    Código_de_Barras: "8435123456789",
    Imagen: "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=500&auto=format&fit=crop&q=60",
    Stock: 1
  },
  {
    Nombre: "Test de fang terracota artesanal de Quart 35cm",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Macetas - Terracota",
    Marca: "Ceràmica Can Torra",
    Precio: 16.50,
    Descripción: "Terracota porosa tradicional que garanteix una oxigenació òptima de les arrels i evita l'entollament.",
    SKU: "CT-POT-TERRA-35",
    Código_de_Barras: "8401948002016",
    Imagen: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=60",
    Stock: 18
  },
  {
    Nombre: "Jardinera rectangular d'autoreg antracita 60cm Deroma",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Macetas - Plástico",
    Marca: "Deroma",
    Precio: 14.80,
    Descripción: "Polipropilè injectat resistent als raigs UV i a les gelades amb indicador de nivell d'aigua.",
    SKU: "DER-PLANTER-60",
    Código_de_Barras: "8008821034123",
    Imagen: "https://images.unsplash.com/photo-1598880940371-c756e015fea1?w=500&auto=format&fit=crop&q=60",
    Stock: 8
  },
  {
    Nombre: "Test penjant decoratiu amb plat integrat 25cm",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Macetas - Plástico",
    Marca: "Deroma",
    Precio: 7.50,
    Descripción: "Ideal per a plantes aromàtiques i flors de temporada a balcons i terrasses.",
    SKU: "DER-HANG-25",
    Código_de_Barras: "8008821098712",
    Imagen: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=500&auto=format&fit=crop&q=60",
    Stock: 0 // AGOTADO
  },
  {
    Nombre: "Substrat universal ecològic amb guano 50L Compo Sana",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Tierras y Nutrición",
    Marca: "Compo",
    Precio: 12.95,
    Descripción: "Compost amb perlita volcànica i activador d'arrels Agrosil. Retenció hídrica perfecta per a hort i jardí.",
    SKU: "CMP-SANA-50L",
    Código_de_Barras: "8411056024128",
    Imagen: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=60",
    Stock: 40
  },
  {
    Nombre: "Humus de cuc de terra 100% orgànic 20L Flower",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Tierras y Nutrición",
    Marca: "Flower",
    Precio: 9.80,
    Descripción: "Abonament biològic pur que regenera la flora microbiana del sòl i potencia el gust de les hortalisses.",
    SKU: "FLW-HUMUS-20L",
    Código_de_Barras: "8426584501231",
    Imagen: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500&auto=format&fit=crop&q=60",
    Stock: 25
  },
  {
    Nombre: "Sabó potàssic pur insecticida ecològic 1L Flower",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Fitosanitarios - Insecticidas",
    Marca: "Flower",
    Precio: 8.95,
    Descripción: "Netejador de melasses i tractament biodegradable molt eficaç contra pugó, cotxinilla i mosca blanca.",
    SKU: "FLW-SABO-1L",
    Código_de_Barras: "8426584204125",
    Imagen: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=60",
    Stock: 15
  },
  {
    Nombre: "Fungicida ecològic Coure i Sofre polivalent 500g Compo",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Fitosanitarios - Fungicidas",
    Marca: "Compo",
    Precio: 10.50,
    Descripción: "Prevenció i cura del míldiu, oïdi, rovell i abonyegament en fruiters i tomaqueres.",
    SKU: "CMP-FUNG-500",
    Código_de_Barras: "8411056018912",
    Imagen: "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=500&auto=format&fit=crop&q=60",
    Stock: 12
  },
  {
    Nombre: "Herbicida natural d'àcid pelargònic d'acció ràpida 1L",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Fitosanitarios - Herbicidas",
    Marca: "Neudorff",
    Precio: 14.90,
    Descripción: "Elimina males herbes i molsa en camins i vores en menys de 3 hores sense glifosat.",
    SKU: "NEU-HERB-1L",
    Código_de_Barras: "4005240003215",
    Imagen: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=60",
    Stock: 7
  },
  {
    Nombre: "Esquer fresc raticida autoritzat per a interiors i coberts 150g",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Fitosanitarios - Control Roedores",
    Marca: "Massó",
    Precio: 5.60,
    Descripción: "Formatge en pasta d'alta apetència per al control segur de rosegadors en masies i coberts.",
    SKU: "MAS-RAT-150G",
    Código_de_Barras: "8413725008123",
    Imagen: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
    Stock: 10
  },
  {
    Nombre: "Trampes cromàtiques grogues adhesives per a hort (Pack 10)",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Fitosanitarios - Trampas",
    Marca: "Massó",
    Precio: 6.90,
    Descripción: "Monitoratge i captura massiva de mosca blanca, pugó i minador sense químics.",
    SKU: "MAS-TRAP-10",
    Código_de_Barras: "8413725019815",
    Imagen: "https://images.unsplash.com/photo-1584473457406-6240486418e9?w=500&auto=format&fit=crop&q=60",
    Stock: 20
  },
  {
    Nombre: "Kit Professional d'Endoteràpia per a injecció vascular d'arbrat",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Fitosanitarios - Endoterapia",
    Marca: "Fertinyect",
    Precio: 32.00,
    Descripción: "Dispositiu d'injecció a pressió constant per al tractament de processionària i morrut de palmera.",
    SKU: "FERT-ENDO-KIT",
    Código_de_Barras: "8436024410129",
    Imagen: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500&auto=format&fit=crop&q=60",
    Stock: 5
  },
  {
    Nombre: "Llavors de tomàquet Montserrat tradicional Can Torra",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Plantas/Cultivo - Semillas",
    Marca: "Semillas Fitó",
    Precio: 2.20,
    Descripción: "Varietat autòctona catalana de fruit buit, dolç i de pell fina, insubstituïble per a farcir.",
    SKU: "FIT-TOM-MONT",
    Código_de_Barras: "8411985002131",
    Imagen: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60",
    Stock: 35
  },
  {
    Nombre: "Plantel d'enciam llavorós del Vallès (safata 6 uts)",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Plantas/Cultivo - Plantel",
    Marca: "Horta Can Torra",
    Precio: 1.80,
    Descripción: "Brot vigorós arrelat en turba negra, llest per a trasplantar a l'hort o taula de cultiu.",
    SKU: "CT-PLANT-ENC",
    Código_de_Barras: "8401948003013",
    Imagen: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60",
    Stock: 50
  },
  {
    Nombre: "Kit de reg gota a gota amb programador automàtic digital",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Mallas/Riego",
    Marca: "Gardena",
    Precio: 68.50,
    Descripción: "Set complet per a 15 jardineres o solcs d'hort. Estalvia fins a un 70% d'aigua amb màxima eficiència.",
    SKU: "GAR-DRIP-SET",
    Código_de_Barras: "4078500018234",
    Imagen: "https://images.unsplash.com/photo-1515150117381-80b6424f1b04?w=500&auto=format&fit=crop&q=60",
    Stock: 9
  },
  {
    Nombre: "Malla d'ombreig i ocultació verda 90% 2x10m",
    Categoría: "Huerto y Jardín",
    Subcategoría: "Mallas/Riego",
    Marca: "Intermas",
    Precio: 22.00,
    Descripción: "Malla d'alta densitat teixida amb protecció UV per a tanques, porxos i hivernacles.",
    SKU: "INT-NET-2X10",
    Código_de_Barras: "8410782019451",
    Imagen: "https://images.unsplash.com/photo-1584473457406-6240486418e9?w=500&auto=format&fit=crop&q=60",
    Stock: 14
  },

  // 3. ALIMENTACIÓN (Consumo Humano / Proximidad km0)
  {
    Nombre: "Oli d'oliva verge extra arbequina de primera premsada 5L",
    Categoría: "Alimentación",
    Subcategoría: "Consumo Humano/Proximidad",
    Marca: "Molí de Proximitat",
    Precio: 46.50,
    Descripción: "Extracció en fred de collita pròpia. Afruitat intens amb notes de tomaca i ametlla verda.",
    SKU: "ALM-OLI-5L",
    Código_de_Barras: "8401948004010",
    Imagen: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60",
    Stock: 20
  },
  {
    Nombre: "Mel pura de romaní del massís de Sant Llorenç 1kg",
    Categoría: "Alimentación",
    Subcategoría: "Consumo Humano/Proximidad",
    Marca: "Can Torra Mel",
    Precio: 13.90,
    Descripción: "Mel artesana crua, sense pasteuritzar, collida als ruscs del Parc Natural de Sant Llorenç del Munt.",
    SKU: "CT-HONEY-1KG",
    Código_de_Barras: "8401948004027",
    Imagen: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=60",
    Stock: 15
  },
  {
    Nombre: "Mongeta del Ganxet D.O.P. Vallès sac tela 1kg",
    Categoría: "Alimentación",
    Subcategoría: "Consumo Humano/Proximidad",
    Marca: "Pagesia del Vallès",
    Precio: 11.50,
    Descripción: "Llegum tradicional del Vallès de pell imperceptible i textura extremadament cremosa.",
    SKU: "VALL-GANX-1KG",
    Código_de_Barras: "8401948004034",
    Imagen: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60",
    Stock: 0 // AGOTADO
  },

  // 4. MISCELÁNEA
  {
    Nombre: "Bossa 100 taps de suro natural de primera qualitat 44x24",
    Categoría: "Miscelánea",
    Subcategoría: "Tapones de corcho",
    Marca: "Corcho Can Torra",
    Precio: 14.50,
    Descripción: "Suro 100% natural de boscos catalans per a embotellar vi negre, blanc o licors tradicionals.",
    SKU: "COR-CORK-100",
    Código_de_Barras: "8401948005017",
    Imagen: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=60",
    Stock: 30
  },
  {
    Nombre: "Cordill de cànem natural per a entutorar bobina 200m",
    Categoría: "Miscelánea",
    Subcategoría: "Varios",
    Marca: "Can Torra",
    Precio: 4.20,
    Descripción: "Fibra vegetal biodegradable resistent a la intempèrie per a lligar tomaqueres i fruiters.",
    SKU: "CT-ROPE-200M",
    Código_de_Barras: "8401948005024",
    Imagen: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60",
    Stock: 25
  },
  {
    Nombre: "Garrafa de vidre tradicional amb cistella protectora 5L",
    Categoría: "Miscelánea",
    Subcategoría: "Varios",
    Marca: "Garrafes Tradició",
    Precio: 12.80,
    Descripción: "Damasjana de vidre gruixut tradicional per a conservació de vi, oli o licors casolans.",
    SKU: "GAR-GLASS-5L",
    Código_de_Barras: "8401948005031",
    Imagen: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=500&auto=format&fit=crop&q=60",
    Stock: 8
  }
];

/**
 * ==========================================================================
 * Clase controladora principal de Garden Can Torra (PWA)
 * ==========================================================================
 */
class GardenCanTorraApp {
  constructor() {
    this.sheetUrl = (typeof SHEET_URL === 'string') ? SHEET_URL : '';
    this.products = [];
    this.filteredProducts = [];
    this.cart = [];
    
    // Estados de navegación multinivel y filtros
    this.currentLang = 'ca';
    this.activeCategory = 'TODOS';
    this.activeSubcategory = null;       // Nivel 2 (ej. Perro, Gato, Macetas...)
    this.activeChildCategory = null;     // Nivel 3 (ej. Alimentación, Paseo, Terracota...)
    this.activeDeepCategory = null;      // Nivel 4 (ej. Seca, Húmeda, Snacks)
    this.activeBrand = null;             // Filtro de marca
    this.onlyInStockBrands = false;      // Toggle para mostrar solo marcas con stock
    this.searchTerm = '';
    this.deliveryMethod = 'RECOGIDA';

    // Inicializar la aplicación
    this.init();
  }

  async init() {
    // 1. Registro del Service Worker para soporte PWA y modo Offline
    this.registerServiceWorker();

    // 2. Detección de conectividad en tiempo real (Online / Offline)
    this.setupConnectivityListeners();

    // 3. Cargar preferencia de tema claro/oscuro
    this.loadTheme();

    // 4. Vincular eventos del DOM
    this.bindEvents();

    // 5. Cargar catálogo (Google Sheets real o catálogo demo completo)
    await this.loadProductsFromGoogleSheets();
  }

  /**
   * Registra el Service Worker de la PWA garantizando funcionamiento offline
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js', { scope: './' })
          .then((registration) => {
            console.log('[Garden Can Torra PWA] Service Worker registrat correctament amb abast:', registration.scope);
          })
          .catch((error) => {
            console.warn('[Garden Can Torra PWA] Error en registrar el Service Worker:', error);
          });
      });
    }
  }

  /**
   * Monitoriza el estado de conexión para avisar al usuario si está en modo offline
   */
  setupConnectivityListeners() {
    const showOfflineBadge = (isOffline) => {
      let badge = document.getElementById('offlineStatusBadge');
      if (isOffline) {
        if (!badge) {
          badge = document.createElement('div');
          badge.id = 'offlineStatusBadge';
          badge.className = "fixed bottom-4 left-4 z-50 px-3.5 py-1.5 rounded-xl bg-amber-500 text-brand-earth font-black text-xs border-2 border-brand-earth shadow-lg flex items-center gap-2 cartoon-card";
          badge.innerHTML = `<span>📡</span> <span>Mode fora de línia (Offline)</span>`;
          document.body.appendChild(badge);
        }
      } else {
        if (badge) {
          badge.remove();
        }
      }
    };

    window.addEventListener('offline', () => showOfflineBadge(true));
    window.addEventListener('online', () => {
      showOfflineBadge(false);
      this.loadProductsFromGoogleSheets();
    });

    if (!navigator.onLine) {
      showOfflineBadge(true);
    }
  }

  /**
   * ========================================================================
   * 1. CONEXIÓN REAL CON GOOGLE SHEETS USANDO FETCH()
   * ========================================================================
   * Descarga y procesa el CSV publicado de Google Sheets mapeando con precisión
   * las 10 columnas del modelo de datos:
   * Nombre, Categoría, Subcategoría, Marca, Precio, Descripción, SKU,
   * Código de Barras, Imagen y Stock.
   */
  async loadProductsFromGoogleSheets() {
    const productsGrid = document.getElementById('productsGrid');
    const counter = document.getElementById('productCounter');

    // 1. Validar si SHEET_URL está configurada con una URL real
    const currentUrl = (this.sheetUrl || SHEET_URL || '').trim();
    const isUrlConfigured = currentUrl !== '' && 
      !currentUrl.includes("TU_ENLACE_AQUI") && 
      !currentUrl.includes("PLACEHOLDER");

    if (!isUrlConfigured) {
      // Cargamos el catálogo demo para que el árbol y los filtros funcionen de inmediato
      this.products = [...DEMO_PRODUCTS_TREE];
      this.renderPendingSheetConfigBanner();
      this.applyFilters();
      return;
    }

    // 2. Estado de carga visual en el catálogo
    if (productsGrid) {
      productsGrid.innerHTML = `
        <div class="col-span-full py-16 text-center text-zinc-500 dark:text-zinc-400">
          <div class="text-4xl mb-3 animate-spin inline-block">🌱</div>
          <h3 class="text-base font-black text-brand-earth dark:text-zinc-100 mb-1">
            Connectant amb Google Sheets...
          </h3>
          <p class="text-xs text-zinc-400">Descarregant el catàleg en temps real mitjançant fetch().</p>
        </div>`;
    }

    try {
      // 3. Petición HTTP real vía fetch()
      const response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv, text/plain, */*'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }

      const csvText = await response.text();
      const parsedRows = this.parseCSV(csvText);

      if (!parsedRows || parsedRows.length === 0) {
        throw new Error("El document CSV obtingut està buit o no conté files de dades.");
      }

      // 4. Mapeo estricto de las 10 columnas requeridas
      this.products = this.normalizeSheetData(parsedRows);
      console.log(`[Garden Can Torra] S'han carregat amb èxit ${this.products.length} productes des de Google Sheets.`);

      // Retirar el banner de configuración si existía
      document.getElementById('sheetConfigBanner')?.remove();

      // 5. Aplicar filtros y renderizar catálogo
      this.applyFilters();

    } catch (error) {
      console.error("[Garden Can Torra - Error de connexió a Google Sheets]:", error);
      // Cargar el catálogo demo de respaldo e informar del error
      this.products = [...DEMO_PRODUCTS_TREE];
      this.renderSheetConnectionError(error);
      this.applyFilters();
    }
  }

  /**
   * Parsea el texto CSV obtenido vía fetch()
   * Usa PapaParse si está cargado o fallback nativo JavaScript.
   */
  parseCSV(csvText) {
    if (window.Papa && typeof window.Papa.parse === 'function') {
      const parsed = window.Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false
      });
      return parsed.data || [];
    }
    return this.fallbackParseCSV(csvText);
  }

  /**
   * Parser nativo de respaldo para CSV compatible con RFC 4180
   */
  fallbackParseCSV(text) {
    const lines = [];
    let row = [''];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];

      if (c === '"') {
        if (inQuotes && next === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push('');
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') i++;
        if (row.length > 1 || row[0].trim() !== '') {
          lines.push(row);
        }
        row = [''];
      } else {
        row[row.length - 1] += c;
      }
    }
    if (row.length > 1 || row[0].trim() !== '') {
      lines.push(row);
    }

    if (lines.length < 2) return [];

    const headers = lines[0].map(h => h.trim());
    return lines.slice(1).map(lineCols => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = lineCols[idx] !== undefined ? lineCols[idx].trim() : '';
      });
      return obj;
    });
  }

  /**
   * Mapea y normaliza exactamente las 10 columnas obligatorias de Google Sheets:
   * 1. Nombre
   * 2. Categoría
   * 3. Subcategoría
   * 4. Marca
   * 5. Precio
   * 6. Descripción
   * 7. SKU
   * 8. Código de Barras
   * 9. Imagen
   * 10. Stock
   */
  normalizeSheetData(rawData) {
    if (!Array.isArray(rawData)) return [];

    return rawData
      .filter(row => row && typeof row === 'object' && Object.values(row).some(v => v && String(v).trim().length > 0))
      .map((item, index) => {
        const getField = (aliases) => {
          for (const alias of aliases) {
            if (item[alias] !== undefined && item[alias] !== null) {
              const val = String(item[alias]).trim();
              if (val.length > 0) return val;
            }
          }
          const keys = Object.keys(item);
          const clean = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
          for (const alias of aliases) {
            const targetClean = clean(alias);
            const foundKey = keys.find(k => clean(k) === targetClean);
            if (foundKey && item[foundKey] !== undefined && item[foundKey] !== null) {
              const val = String(item[foundKey]).trim();
              if (val.length > 0) return val;
            }
          }
          return "";
        };

        const nombre = getField(["Nombre", "Producte", "Producto", "Name", "Article", "Articulo"]) || `Producte #${index + 1}`;
        const categoria = getField(["Categoría", "Categoria", "Category"]) || "Miscelánea";
        const subcategoria = getField(["Subcategoría", "Subcategoria", "Subcategory"]);
        const marca = getField(["Marca", "Brand", "Fabricant", "Fabricante"]) || "Can Torra";

        const rawPrecio = getField(["Precio", "Preu", "Price", "PVP"]);
        const cleanPrecio = rawPrecio.replace(/[€$]/g, "").replace(",", ".").trim();
        const parsedPrecio = parseFloat(cleanPrecio);
        const precio = (!isNaN(parsedPrecio) && parsedPrecio >= 0) ? parsedPrecio : 0.0;

        const descripcion = getField(["Descripción", "Descripcion", "Descripcio", "Description", "Detall"]);
        const sku = getField(["SKU", "sku", "Referència", "Referencia", "Ref", "Id", "ID"]) || `SKU-${index + 1}`;
        const codigoBarras = getField(["Código de Barras", "Codigo de Barras", "Código_de_Barras", "Codigo_de_Barras", "Codi de barres", "Barcode", "EAN"]) || "--";
        const imagen = getField(["Imagen", "Foto", "Image", "URL", "Url", "Imatge", "Pic"]) || 
          "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=60";

        const rawStock = getField(["Stock", "Estoc", "Existencias", "Quantitat", "Cantidad"]);
        const parsedStock = parseInt(rawStock, 10);
        const stock = (!isNaN(parsedStock) && parsedStock >= 0) ? parsedStock : 0;

        return {
          Nombre: nombre,
          Categoría: categoria,
          Subcategoría: subcategoria,
          Marca: marca,
          Precio: precio,
          Descripción: descripcion,
          SKU: sku,
          Código_de_Barras: codigoBarras,
          Imagen: imagen,
          Stock: stock
        };
      });
  }

  /**
   * Banner de configuración amigable que permite pegar el CSV en caliente
   * mientras se muestra el catálogo de demostración para testear
   */
  renderPendingSheetConfigBanner() {
    let existingBanner = document.getElementById('sheetConfigBanner');
    if (existingBanner) return;

    const catalogMain = document.getElementById('catalogContainer');
    if (!catalogMain) return;

    const banner = document.createElement('div');
    banner.id = 'sheetConfigBanner';
    banner.className = "mb-6 p-4 bg-teal-50 dark:bg-zinc-800 rounded-2xl border-2 border-brand-turquoise cartoon-card shadow-sm";
    banner.innerHTML = `
      <div class="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-brand-turquoise text-white flex items-center justify-center text-xl shrink-0 font-bold">
            📊
          </div>
          <div>
            <h4 class="font-black text-brand-earth dark:text-teal-300">
              Connexió a Google Sheets preparada (Mode Demostració actiu)
            </h4>
            <p class="text-[11px] text-zinc-600 dark:text-zinc-300">
              Estàs veient el catàleg complet de mostra amb totes les categories i marques. Pots enganxar el teu enllaç CSV per carregar dades reals:
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 w-full md:w-auto">
          <input 
            type="url" 
            id="sheetUrlInputQuick" 
            placeholder="Enllaç Google Sheets en format CSV..."
            class="p-2 text-xs border-2 border-brand-earth dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 font-mono flex-1 md:w-72"
          />
          <button 
            type="button" 
            id="btnConnectSheetQuick"
            class="px-3.5 py-2 bg-brand-turquoise hover:bg-brand-turquoiseDark text-white font-black text-xs rounded-xl cartoon-card transition whitespace-nowrap"
          >
            Connectar
          </button>
        </div>
      </div>
    `;

    catalogMain.insertBefore(banner, catalogMain.firstChild);

    document.getElementById('btnConnectSheetQuick')?.addEventListener('click', () => {
      const url = document.getElementById('sheetUrlInputQuick')?.value?.trim();
      if (url) {
        this.sheetUrl = url;
        this.loadProductsFromGoogleSheets();
      } else {
        alert("Si us plau, enganxa un enllaç de Google Sheets publicat com a CSV.");
      }
    });
  }

  /**
   * Notificación de error si la petición fetch() a Google Sheets falla
   */
  renderSheetConnectionError(error) {
    let existingBanner = document.getElementById('sheetConfigBanner');
    if (!existingBanner) {
      this.renderPendingSheetConfigBanner();
      existingBanner = document.getElementById('sheetConfigBanner');
    }

    if (existingBanner) {
      existingBanner.className = "mb-6 p-4 bg-red-50 dark:bg-zinc-800 rounded-2xl border-2 border-red-500 cartoon-card shadow-sm";
      existingBanner.innerHTML = `
        <div class="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3">
            <span class="text-2xl select-none">⚠️</span>
            <div>
              <h4 class="font-black text-red-600 dark:text-red-400">
                No s'ha pogut llegir el Google Sheets (${error?.message || 'Error de xarxa o CORS'})
              </h4>
              <p class="text-[11px] text-zinc-600 dark:text-zinc-300">
                Mostrant catàleg de reserva. Assegura't de que el full estigui publicat com a <strong>Valors separats per comes (.csv)</strong> i sigui públic.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onclick="app.loadProductsFromGoogleSheets()"
            class="px-4 py-1.5 bg-red-600 text-white font-black text-xs rounded-xl cartoon-card transition"
          >
            Reintentar
          </button>
        </div>
      `;
    }
  }

  /**
   * ========================================================================
   * 2. COINCIDENCIA MULTINIVEL DE CATEGORÍAS
   * ========================================================================
   */
  matchesCategory(prod) {
    if (this.activeCategory === 'TODOS') return true;

    const catKey = this.activeCategory;
    const prodCat = (prod.Categoría || '').toLowerCase();
    const prodSub = (prod.Subcategoría || '').toLowerCase();
    const prodNom = (prod.Nombre || '').toLowerCase();
    const prodDesc = (prod.Descripción || '').toLowerCase();

    // 1. Validación Nivel 1 (Categoría Principal)
    let matchLevel1 = false;
    if (catKey === 'MASCOTAS') {
      matchLevel1 = prodCat.includes('mascota') || prodSub.includes('mascota') ||
        ['perro', 'gos', 'gato', 'gat', 'ave', 'ocell', 'roedor', 'rosegador', 'pez', 'peix', 'tortuga', 'granja'].some(k => prodCat.includes(k) || prodSub.includes(k));
    } else if (catKey === 'HUERTO_JARDIN') {
      matchLevel1 = prodCat.includes('huerto') || prodCat.includes('jardin') || prodCat.includes('hort') || prodCat.includes('jardí') ||
        prodSub.includes('huerto') || prodSub.includes('jardin') || prodSub.includes('hort') || prodSub.includes('jardí') ||
        ['herramienta', 'eina', 'maceta', 'test', 'tierra', 'substrat', 'fitosanitari', 'planta', 'semilla', 'llavor', 'malla', 'riego', 'reg'].some(k => prodCat.includes(k) || prodSub.includes(k));
    } else if (catKey === 'ALIMENTACION') {
      matchLevel1 = prodCat.includes('aliment') || prodSub.includes('aliment') || prodCat.includes('consum') || prodSub.includes('consum') || prodCat.includes('km0');
    } else if (catKey === 'MISCELANEA') {
      matchLevel1 = prodCat.includes('miscel') || prodSub.includes('miscel') || prodCat.includes('corcho') || prodSub.includes('corcho') || prodCat.includes('suro') || prodSub.includes('suro');
    }

    if (!matchLevel1) return false;

    // 2. Validación Nivel 2 (Subcategoría)
    if (this.activeSubcategory) {
      const sub = this.activeSubcategory.toLowerCase();
      const cleanSub = sub.replace(/[^a-z0-9]/g, '');
      const inSub = (prod.Subcategoría || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const inCat = (prod.Categoría || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const inNom = prodNom;

      const matchesSub = inSub.includes(cleanSub) || inCat.includes(cleanSub) || 
        (sub.includes('perro') && (inSub.includes('perro') || inSub.includes('gos') || inNom.includes('dog') || inNom.includes('gos') || inNom.includes('perro'))) ||
        (sub.includes('gato') && (inSub.includes('gato') || inSub.includes('gat') || inNom.includes('cat') || inNom.includes('gat') || inNom.includes('gato'))) ||
        (sub.includes('ave') && (inSub.includes('ave') || inSub.includes('ocell') || inNom.includes('canari') || inNom.includes('periquito'))) ||
        (sub.includes('roedor') && (inSub.includes('roedor') || inSub.includes('rosegador') || inNom.includes('conill') || inNom.includes('hamster') || inNom.includes('fenc'))) ||
        (sub.includes('peces') && (inSub.includes('pez') || inSub.includes('peix') || inNom.includes('peix') || inNom.includes('peces'))) ||
        (sub.includes('tortuga') && (inSub.includes('tortuga') || inNom.includes('tortuga'))) ||
        (sub.includes('granja') && (inSub.includes('granja') || inNom.includes('gallina') || inNom.includes('ponedora'))) ||
        (sub.includes('herramienta') && (inSub.includes('herramienta') || inSub.includes('maquinaria') || inSub.includes('eina'))) ||
        (sub.includes('maceta') && (inSub.includes('maceta') || inSub.includes('test') || inSub.includes('jardinera'))) ||
        (sub.includes('tierra') && (inSub.includes('tierra') || inSub.includes('nutric') || inSub.includes('substrat') || inSub.includes('humus') || inSub.includes('adob'))) ||
        (sub.includes('fitosanitario') && (inSub.includes('fitosanit') || inSub.includes('insecticida') || inSub.includes('fungicida') || inSub.includes('endoter'))) ||
        (sub.includes('planta') && (inSub.includes('planta') || inSub.includes('cultiv') || inSub.includes('semilla') || inSub.includes('llavor') || inSub.includes('plantel'))) ||
        (sub.includes('malla') && (inSub.includes('malla') || inSub.includes('riego') || inSub.includes('reg') || inSub.includes('goteo'))) ||
        (sub.includes('consumo') && (inSub.includes('consum') || inSub.includes('proxim') || inCat.includes('aliment'))) ||
        (sub.includes('tapones') && (inSub.includes('tapon') || inSub.includes('tap') || inSub.includes('corcho') || inSub.includes('suro'))) ||
        (sub.includes('varios') && (inSub.includes('vari') || inCat.includes('miscel')));

      if (!matchesSub) return false;
    }

    // 3. Validación Nivel 3 (Subsección profunda)
    if (this.activeChildCategory) {
      const child = this.activeChildCategory.toLowerCase();
      const cleanChild = child.replace(/[^a-z0-9]/g, '');
      const inSub = (prod.Subcategoría || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      const matchesChild = inSub.includes(cleanChild) || prodNom.includes(child) || prodDesc.includes(child) ||
        (child.includes('alimen') && (inSub.includes('alimen') || prodNom.includes('pinso') || prodNom.includes('pienso') || prodNom.includes('comida'))) ||
        (child.includes('paseo') && (inSub.includes('paseo') || inSub.includes('viaje') || prodNom.includes('corretja') || prodNom.includes('arnés') || prodNom.includes('collar'))) ||
        (child.includes('higien') && (inSub.includes('higien') || prodNom.includes('xampú') || prodNom.includes('champú') || prodNom.includes('sorra') || prodNom.includes('arena'))) ||
        (child.includes('descanso') && (inSub.includes('descanso') || prodNom.includes('llit') || prodNom.includes('cama') || prodNom.includes('coixí'))) ||
        (child.includes('comedero') && (inSub.includes('comedero') || prodNom.includes('menjador') || prodNom.includes('abeurador'))) ||
        (child.includes('juguete') && (inSub.includes('juguete') || prodNom.includes('joguina') || prodNom.includes('kong') || prodNom.includes('pelota'))) ||
        (child.includes('rascador') && (inSub.includes('rascador') || prodNom.includes('rascador'))) ||
        (child.includes('jaula') && (inSub.includes('jaula') || inSub.includes('gàbia') || prodNom.includes('gàbia'))) ||
        (child.includes('equipamiento') && (inSub.includes('equip') || prodNom.includes('roda') || prodNom.includes('abeurador'))) ||
        (child.includes('terracota') && (inSub.includes('terracota') || prodNom.includes('fang') || prodNom.includes('barro') || prodNom.includes('terracota'))) ||
        (child.includes('plástico') && (inSub.includes('plastic') || inSub.includes('plàstic') || prodNom.includes('plastico') || prodNom.includes('resina'))) ||
        (child.includes('insecticida') && (inSub.includes('insecticida') || prodNom.includes('sabó potàssic') || prodNom.includes('pulgó'))) ||
        (child.includes('fungicida') && (inSub.includes('fungicida') || prodNom.includes('coure') || prodNom.includes('sofre') || prodNom.includes('oïdi'))) ||
        (child.includes('herbicida') && (inSub.includes('herbicida') || prodNom.includes('herbicida'))) ||
        (child.includes('roedores') && (inSub.includes('roedor') || prodNom.includes('raticida') || prodNom.includes('ratol'))) ||
        (child.includes('trampa') && (inSub.includes('trampa') || prodNom.includes('cromàtica') || prodNom.includes('feromona'))) ||
        (child.includes('endoterapia') && (inSub.includes('endoter') || prodNom.includes('endoter') || prodDesc.includes('endoter'))) ||
        (child.includes('semilla') && (inSub.includes('semilla') || inSub.includes('llavor') || prodNom.includes('llavor') || prodNom.includes('semilla'))) ||
        (child.includes('plantel') && (inSub.includes('plantel') || prodNom.includes('plantel')));

      if (!matchesChild) return false;
    }

    // 4. Validación Nivel 4 (Variedad específica, ej. Seca, Húmeda, Snacks)
    if (this.activeDeepCategory) {
      const deep = this.activeDeepCategory.toLowerCase();
      const inSub = (prod.Subcategoría || '').toLowerCase();

      const matchesDeep = inSub.includes(deep) || prodNom.includes(deep) || prodDesc.includes(deep) ||
        (deep === 'seca' && (inSub.includes('seca') || prodNom.includes('sec') || prodNom.includes('croqueta') || prodNom.includes('adult') || prodNom.includes('puppy'))) ||
        (deep === 'húmeda' && (inSub.includes('húmeda') || inSub.includes('humeda') || prodNom.includes('wet') || prodNom.includes('llauna') || prodNom.includes('lata') || prodNom.includes('paté') || prodNom.includes('sobres'))) ||
        (deep === 'snacks' && (inSub.includes('snack') || prodNom.includes('snack') || prodNom.includes('bites') || prodNom.includes('premis') || prodNom.includes('golosina') || prodNom.includes('dental')));

      if (!matchesDeep) return false;
    }

    return true;
  }

  /**
   * ========================================================================
   * 3. LÓGICA DE FILTRADO GENERAL Y PRODUCTOS
   * ========================================================================
   */
  applyFilters() {
    this.filteredProducts = this.products.filter(prod => {
      // 1. Coincidencia con la jerarquía de categorías
      const matchCategory = this.matchesCategory(prod);

      // 2. Filtro por 'Marca' seleccionada
      const matchBrand = !this.activeBrand || (prod.Marca === this.activeBrand);

      // 3. Filtro por Término de Búsqueda
      const search = this.searchTerm.toLowerCase();
      const matchSearch = !search || 
        prod.Nombre.toLowerCase().includes(search) || 
        (prod.Descripción || '').toLowerCase().includes(search) || 
        (prod.Marca || '').toLowerCase().includes(search) ||
        (prod.SKU || '').toLowerCase().includes(search);

      return matchCategory && matchBrand && matchSearch;
    });

    // Renderizar botones dinámicos de marca y tarjetas del catálogo
    this.renderBrandFilterButtons();
    this.renderProducts();
    this.updateCategoryHeaders();
  }

  /**
   * ========================================================================
   * 4. BOTONES DINÁMICOS DE FILTRADO POR 'MARCA' BASADOS EN EL STOCK
   * ========================================================================
   * - Lee la columna 'Marca' de los productos coincidentes.
   * - Calcula unidades en stock y si la marca tiene stock disponible o está 'Agotado'.
   * - Muestra etiquetas de stock y soporta el filtro "Només marques amb estoc".
   */
  renderBrandFilterButtons() {
    const container = document.getElementById('brandFilterContainer');
    const countBadge = document.getElementById('brandCountBadge');
    if (!container) return;

    container.innerHTML = '';

    // 1. Extraer marcas de los productos de la categoría activa (sin el filtro de marca)
    const categoryProducts = this.products.filter(prod => {
      const matchCat = this.matchesCategory(prod);
      const search = this.searchTerm.toLowerCase();
      const matchSearch = !search || 
        prod.Nombre.toLowerCase().includes(search) || 
        (prod.Descripción || '').toLowerCase().includes(search) || 
        (prod.Marca || '').toLowerCase().includes(search) ||
        (prod.SKU || '').toLowerCase().includes(search);

      return matchCat && matchSearch;
    });

    // 2. Agrupar por Marca y calcular existencias de stock
    const brandStatsMap = new Map();

    categoryProducts.forEach(prod => {
      const brandName = (prod.Marca || 'Can Torra').trim();
      if (!brandName) return;

      if (!brandStatsMap.has(brandName)) {
        brandStatsMap.set(brandName, {
          name: brandName,
          totalStock: 0,
          totalProducts: 0,
          inStockProducts: 0
        });
      }

      const stats = brandStatsMap.get(brandName);
      stats.totalProducts += 1;
      const stockVal = Math.max(0, parseInt(prod.Stock, 10) || 0);
      stats.totalStock += stockVal;
      if (stockVal > 0) {
        stats.inStockProducts += 1;
      }
    });

    let brandList = Array.from(brandStatsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    // Si está marcado el toggle "Només marques amb estoc", excluir marcas con stock = 0
    if (this.onlyInStockBrands) {
      brandList = brandList.filter(b => b.totalStock > 0);
    }

    if (countBadge) {
      const label = brandList.length === 1 ? I18N[this.currentLang].brand_count : I18N[this.currentLang].brands_count;
      countBadge.textContent = `${brandList.length} ${label}`;
    }

    if (brandList.length === 0) {
      container.innerHTML = `<span class="text-xs text-zinc-400 italic">${I18N[this.currentLang].no_brands}</span>`;
      return;
    }

    // 3. Botón "Todas las marcas" / "Totes les marques"
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = `brand-filter-chip ${!this.activeBrand ? 'active' : ''}`;
    allBtn.innerHTML = `
      <span>${I18N[this.currentLang].all_brands}</span>
      <span class="brand-stock-tag">${categoryProducts.length}</span>
    `;
    allBtn.onclick = () => {
      this.activeBrand = null;
      this.applyFilters();
    };
    container.appendChild(allBtn);

    // 4. Botones dinámicos para cada marca con su indicador de stock
    brandList.forEach(b => {
      const chip = document.createElement('button');
      chip.type = 'button';
      const isSelected = (this.activeBrand === b.name);
      const hasStock = (b.totalStock > 0);

      chip.className = `brand-filter-chip ${isSelected ? 'active' : ''} ${!hasStock ? 'out-of-stock-chip' : 'in-stock-chip'}`;
      
      if (hasStock) {
        chip.innerHTML = `
          <span>${b.name}</span>
          <span class="brand-stock-tag" title="${b.totalStock} uts en estoc (${b.inStockProducts} productes)">
            ${b.totalStock} ${I18N[this.currentLang].in_stock_units}
          </span>
        `;
      } else {
        chip.innerHTML = `
          <span>${b.name}</span>
          <span class="brand-out-tag" title="Tots els productes d'aquesta marca estan esgotats">
            🚫 ${I18N[this.currentLang].out_of_stock_tag}
          </span>
        `;
      }

      chip.onclick = () => {
        // Toggle: si ya estaba seleccionada se limpia, si no se activa
        this.activeBrand = (this.activeBrand === b.name) ? null : b.name;
        this.applyFilters();
      };

      container.appendChild(chip);
    });
  }

  clearBrandFilter() {
    this.activeBrand = null;
    this.applyFilters();
  }

  /**
   * ========================================================================
   * 5. RENDERIZADO DEL CATÁLOGO Y VALIDACIÓN DE STOCK = 0 ('AGOTADO')
   * ========================================================================
   */
  renderProducts() {
    const grid = document.getElementById('productsGrid');
    const counter = document.getElementById('productCounter');
    if (!grid) return;

    grid.innerHTML = '';
    const totalCount = this.filteredProducts.length;

    if (counter) {
      counter.textContent = `${totalCount} ${totalCount === 1 ? 'producte' : 'productes'}`;
    }

    if (totalCount === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center text-zinc-400 dark:text-zinc-500">
          <div class="text-6xl mb-3 select-none">🔍</div>
          <h3 class="font-black text-lg text-brand-earth dark:text-zinc-200 mb-1">
            ${I18N[this.currentLang].no_products}
          </h3>
          <p class="text-xs">Prova amb una altra categoria, marca o neteja els filtres.</p>
        </div>
      `;
      return;
    }

    this.filteredProducts.forEach(prod => {
      // VALIDACIÓN DE STOCK = 0: Si el Stock es 0, el botón cambia a 'Agotado'
      const isOutOfStock = (prod.Stock <= 0);
      const stockLabel = isOutOfStock 
        ? I18N[this.currentLang].stock_out 
        : `${prod.Stock} ${I18N[this.currentLang].stock_available}`;

      const card = document.createElement('article');
      card.className = "product-card cartoon-card";

      card.innerHTML = `
        <div>
          <!-- Contenedor de Imagen con Insignia de Stock -->
          <div class="product-image-container">
            <img 
              src="${prod.Imagen}" 
              alt="${prod.Nombre}" 
              class="product-image"
              loading="lazy"
              onerror="this.src='https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=60'"
            />
            
            <!-- Etiqueta de Marca -->
            <span class="absolute bottom-2 left-2 bg-brand-earth/90 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-md border border-white/20">
              ${prod.Marca}
            </span>

            <!-- Badge de Stock (En stock vs Agotado) -->
            <span class="stock-badge ${isOutOfStock ? 'out-of-stock' : 'in-stock'}">
              ${isOutOfStock ? `🚫 ${I18N[this.currentLang].stock_out}` : `✓ ${stockLabel}`}
            </span>

            <!-- Capa visual de Agotado si Stock = 0 -->
            ${isOutOfStock ? `
              <div class="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-2 text-center select-none">
                <span class="text-2xl mb-0.5">🚫</span>
                <span class="font-black text-xs uppercase tracking-widest bg-red-600 px-2 py-1 rounded-md border border-white/30">
                  ${I18N[this.currentLang].stock_out}
                </span>
              </div>
            ` : ''}
          </div>

          <!-- Metadatos de Categoría / Subcategoría -->
          <span class="product-brand">${prod.Subcategoría || prod.Categoría}</span>
          
          <!-- Título del producto -->
          <h3 class="product-title" title="${prod.Nombre}">${prod.Nombre}</h3>
          
          <!-- Descripción -->
          <p class="product-description">${prod.Descripción || 'Sense descripció disponible.'}</p>
        </div>

        <div>
          <!-- Referencias técnicas (SKU y Código de barras) -->
          <div class="product-meta">
            <span>SKU: <strong class="text-zinc-700 dark:text-zinc-300">${prod.SKU}</strong></span>
            <span>Codi: <strong class="text-zinc-700 dark:text-zinc-300">${prod.Código_de_Barras}</strong></span>
          </div>

          <!-- Precio y Botón de Compra con validación de Stock -->
          <div class="flex items-center justify-between gap-3 pt-2">
            <div class="product-price-container">
              <span class="product-price">${prod.Precio.toFixed(2)}</span>
              <span class="product-price-currency">€</span>
            </div>

            <!-- BOTÓN DE COMPRA: Deshabilitado si Stock = 0 ('Agotado') -->
            <button 
              type="button"
              ${isOutOfStock ? 'disabled aria-disabled="true"' : ''}
              data-sku="${prod.SKU}"
              class="product-btn-add ${isOutOfStock ? 'out-of-stock' : ''}"
              title="${isOutOfStock ? I18N[this.currentLang].stock_out : I18N[this.currentLang].stock_add}"
            >
              ${isOutOfStock 
                ? `<span>🚫</span> <span>${I18N[this.currentLang].stock_out}</span>`
                : `<span>🛒</span> <span>${I18N[this.currentLang].stock_add}</span>`
              }
            </button>
          </div>
        </div>
      `;

      if (!isOutOfStock) {
        const btn = card.querySelector('.product-btn-add');
        if (btn) {
          btn.addEventListener('click', () => this.addToCart(prod.SKU));
        }
      }

      grid.appendChild(card);
    });
  }

  /**
   * ========================================================================
   * 6. NAVEGACIÓN JERÁRQUICA DINÁMICA MULTINIVEL
   * ========================================================================
   */
  setCategory(catKey) {
    this.activeCategory = catKey;
    this.activeSubcategory = null;
    this.activeChildCategory = null;
    this.activeDeepCategory = null;
    this.activeBrand = null;

    // Resaltar botón de la navbar principal
    document.querySelectorAll('.nav-category-btn').forEach(btn => {
      const match = (btn.getAttribute('data-category') === catKey);
      btn.classList.toggle('active', match);
    });

    const subnav = document.getElementById('subcategoriesNav');
    const subList = document.getElementById('subcategoriesList');
    const deepNav = document.getElementById('deepSubcategoriesNav');
    const tertiaryNav = document.getElementById('tertiarySubcategoriesNav');
    const endoBanner = document.getElementById('endoQuickBanner');

    if (deepNav) deepNav.classList.add('hidden');
    if (tertiaryNav) tertiaryNav.classList.add('hidden');
    if (endoBanner) endoBanner.classList.add('hidden');

    // Renderizado dinámico del panel de Subcategorías (Nivel 2)
    if (catKey !== 'TODOS' && CATALOG_TREE[catKey]) {
      if (subnav && subList) {
        subnav.classList.remove('hidden');
        subList.innerHTML = '';

        const catData = CATALOG_TREE[catKey];

        // Botón "Tot en aquesta categoria"
        const allBtn = document.createElement('button');
        allBtn.type = 'button';
        allBtn.className = `subcat-pill ${!this.activeSubcategory ? 'active' : ''}`;
        allBtn.innerHTML = `<span>${catData.icon}</span> <span>${I18N[this.currentLang].subcat_all}</span>`;
        allBtn.onclick = () => {
          this.setSubcategory(null);
        };
        subList.appendChild(allBtn);

        // Subcategorías de Nivel 2 (ej. Perro, Gato, Herramientas, Macetas...)
        Object.entries(catData.subcategories).forEach(([subKey, subObj]) => {
          const pill = document.createElement('button');
          pill.type = 'button';
          pill.className = `subcat-pill ${this.activeSubcategory === subKey ? 'active' : ''}`;
          pill.innerHTML = `<span>${subObj.icon || '🏷️'}</span> <span>${subKey}</span>`;
          pill.onclick = () => {
            this.setSubcategory(subKey);
          };
          subList.appendChild(pill);
        });
      }
    } else {
      if (subnav) subnav.classList.add('hidden');
    }

    this.applyFilters();
  }

  setSubcategory(subKey) {
    this.activeSubcategory = subKey;
    this.activeChildCategory = null;
    this.activeDeepCategory = null;
    this.activeBrand = null;

    // Actualizar clase activa en píldoras de Nivel 2
    document.querySelectorAll('#subcategoriesList .subcat-pill').forEach(btn => {
      const text = btn.textContent || '';
      if (!subKey) {
        btn.classList.toggle('active', text.includes(I18N[this.currentLang].subcat_all));
      } else {
        btn.classList.toggle('active', text.includes(subKey));
      }
    });

    const deepNav = document.getElementById('deepSubcategoriesNav');
    const deepList = document.getElementById('deepSubcategoriesList');
    const tertiaryNav = document.getElementById('tertiarySubcategoriesNav');
    const endoBanner = document.getElementById('endoQuickBanner');

    if (tertiaryNav) tertiaryNav.classList.add('hidden');
    if (endoBanner) endoBanner.classList.add('hidden');

    // Renderizado dinámico de Subsecciones de Nivel 3
    if (subKey && this.activeCategory !== 'TODOS') {
      const catData = CATALOG_TREE[this.activeCategory];
      const subObj = catData?.subcategories?.[subKey];

      if (subObj && subObj.items && Object.keys(subObj.items).length > 0) {
        if (deepNav && deepList) {
          deepNav.classList.remove('hidden');
          deepList.innerHTML = '';

          // Botón "Tot a [Subcategoria]"
          const allDeepBtn = document.createElement('button');
          allDeepBtn.type = 'button';
          allDeepBtn.className = `deep-subcat-pill ${!this.activeChildCategory ? 'active' : ''}`;
          allDeepBtn.textContent = `${I18N[this.currentLang].subcat_all_in} ${subKey}`;
          allDeepBtn.onclick = () => {
            this.setChildCategory(null);
          };
          deepList.appendChild(allDeepBtn);

          // Subcategorías de Nivel 3 (ej. Alimentación, Paseo, Terracota, Insecticidas...)
          Object.keys(subObj.items).forEach(childKey => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = `deep-subcat-pill ${this.activeChildCategory === childKey ? 'active' : ''}`;
            pill.textContent = childKey;
            pill.onclick = () => {
              this.setChildCategory(childKey);
            };
            deepList.appendChild(pill);
          });
        }
      } else {
        if (deepNav) deepNav.classList.add('hidden');
      }
    } else {
      if (deepNav) deepNav.classList.add('hidden');
    }

    this.applyFilters();
  }

  setChildCategory(childKey) {
    this.activeChildCategory = childKey;
    this.activeDeepCategory = null;
    this.activeBrand = null;

    // Actualizar clase activa en píldoras de Nivel 3
    document.querySelectorAll('#deepSubcategoriesList .deep-subcat-pill').forEach(btn => {
      const text = btn.textContent || '';
      if (!childKey) {
        btn.classList.toggle('active', text.includes(I18N[this.currentLang].subcat_all_in));
      } else {
        btn.classList.toggle('active', text.trim() === childKey.trim());
      }
    });

    const tertiaryNav = document.getElementById('tertiarySubcategoriesNav');
    const tertiaryList = document.getElementById('tertiarySubcategoriesList');
    const endoBanner = document.getElementById('endoQuickBanner');

    // Banner contextual de Endoterapia
    if (childKey === 'Endoterapia' || (this.activeSubcategory === 'Fitosanitarios' && childKey === 'Endoterapia')) {
      if (endoBanner) endoBanner.classList.remove('hidden');
    } else {
      if (endoBanner) endoBanner.classList.add('hidden');
    }

    // Renderizado dinámico de Variedades de Nivel 4 (ej. Perro > Alimentación > [Seca, Húmeda, Snacks])
    if (childKey && this.activeCategory && this.activeSubcategory) {
      const catData = CATALOG_TREE[this.activeCategory];
      const subObj = catData?.subcategories?.[this.activeSubcategory];
      const deepArray = subObj?.items?.[childKey];

      if (Array.isArray(deepArray) && deepArray.length > 0) {
        if (tertiaryNav && tertiaryList) {
          tertiaryNav.classList.remove('hidden');
          tertiaryList.innerHTML = '';

          // Botón "Tots"
          const allTertiaryBtn = document.createElement('button');
          allTertiaryBtn.type = 'button';
          allTertiaryBtn.className = `tertiary-subcat-pill ${!this.activeDeepCategory ? 'active' : ''}`;
          allTertiaryBtn.textContent = `${I18N[this.currentLang].subcat_all} ${childKey}`;
          allTertiaryBtn.onclick = () => {
            this.setDeepCategory(null);
          };
          tertiaryList.appendChild(allTertiaryBtn);

          deepArray.forEach(deepKey => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = `tertiary-subcat-pill ${this.activeDeepCategory === deepKey ? 'active' : ''}`;
            pill.textContent = deepKey;
            pill.onclick = () => {
              this.setDeepCategory(deepKey);
            };
            tertiaryList.appendChild(pill);
          });
        }
      } else {
        if (tertiaryNav) tertiaryNav.classList.add('hidden');
      }
    } else {
      if (tertiaryNav) tertiaryNav.classList.add('hidden');
    }

    this.applyFilters();
  }

  setDeepCategory(deepKey) {
    this.activeDeepCategory = deepKey;
    this.activeBrand = null;

    // Actualizar clase activa en píldoras de Nivel 4
    document.querySelectorAll('#tertiarySubcategoriesList .tertiary-subcat-pill').forEach(btn => {
      const text = btn.textContent || '';
      if (!deepKey) {
        btn.classList.toggle('active', text.includes(I18N[this.currentLang].subcat_all));
      } else {
        btn.classList.toggle('active', text.trim() === deepKey.trim());
      }
    });

    this.applyFilters();
  }

  /**
   * Actualiza el encabezado del catálogo y construye las migas de pan interactivas
   */
  updateCategoryHeaders() {
    const titleEl = document.getElementById('currentCategoryViewTitle');
    const breadcrumbsContainer = document.getElementById('catalogBreadcrumbs');

    let currentTitle = I18N[this.currentLang].nav_all;

    // Migas de pan interactivas
    if (breadcrumbsContainer) {
      breadcrumbsContainer.innerHTML = '';

      // 1. Raíz: Catàleg General
      const rootLink = document.createElement('span');
      rootLink.className = "breadcrumb-link";
      rootLink.textContent = I18N[this.currentLang].breadcrumb_catalog;
      rootLink.onclick = () => this.setCategory('TODOS');
      breadcrumbsContainer.appendChild(rootLink);

      // 2. Nivel 1: Categoría Principal
      if (this.activeCategory !== 'TODOS') {
        const catConfig = CATALOG_TREE[this.activeCategory];
        const localizedCat = catConfig ? (this.currentLang === 'ca' ? catConfig.title_ca : catConfig.title_es) : this.activeCategory;
        currentTitle = localizedCat;

        const sep1 = document.createElement('span');
        sep1.className = "text-zinc-400";
        sep1.textContent = "›";
        breadcrumbsContainer.appendChild(sep1);

        const catLink = document.createElement('span');
        catLink.className = "breadcrumb-link";
        catLink.textContent = localizedCat;
        catLink.onclick = () => this.setCategory(this.activeCategory);
        breadcrumbsContainer.appendChild(catLink);

        // 3. Nivel 2: Subcategoría
        if (this.activeSubcategory) {
          currentTitle = `${this.activeSubcategory} (${localizedCat})`;

          const sep2 = document.createElement('span');
          sep2.className = "text-zinc-400";
          sep2.textContent = "›";
          breadcrumbsContainer.appendChild(sep2);

          const subLink = document.createElement('span');
          subLink.className = "breadcrumb-link";
          subLink.textContent = this.activeSubcategory;
          subLink.onclick = () => this.setSubcategory(this.activeSubcategory);
          breadcrumbsContainer.appendChild(subLink);

          // 4. Nivel 3: Subsección profunda
          if (this.activeChildCategory) {
            currentTitle = `${this.activeChildCategory} - ${this.activeSubcategory}`;

            const sep3 = document.createElement('span');
            sep3.className = "text-zinc-400";
            sep3.textContent = "›";
            breadcrumbsContainer.appendChild(sep3);

            const childLink = document.createElement('span');
            childLink.className = "breadcrumb-link";
            childLink.textContent = this.activeChildCategory;
            childLink.onclick = () => this.setChildCategory(this.activeChildCategory);
            breadcrumbsContainer.appendChild(childLink);

            // 5. Nivel 4: Variedad
            if (this.activeDeepCategory) {
              currentTitle = `${this.activeDeepCategory} (${this.activeChildCategory})`;

              const sep4 = document.createElement('span');
              sep4.className = "text-zinc-400";
              sep4.textContent = "›";
              breadcrumbsContainer.appendChild(sep4);

              const deepSpan = document.createElement('span');
              deepSpan.className = "text-brand-earth dark:text-zinc-200 font-bold";
              deepSpan.textContent = this.activeDeepCategory;
              breadcrumbsContainer.appendChild(deepSpan);
            }
          }
        }
      }

      // Si hay filtro de marca activo
      if (this.activeBrand) {
        currentTitle += ` • ${this.activeBrand}`;
        const brandBadge = document.createElement('span');
        brandBadge.className = "ml-1 px-1.5 py-0.5 bg-brand-turquoise text-white text-[10px] rounded-md";
        brandBadge.textContent = this.activeBrand;
        breadcrumbsContainer.appendChild(brandBadge);
      }
    }

    if (titleEl) titleEl.textContent = currentTitle;
  }

  /**
   * ========================================================================
   * 7. CARRITO DE COMPRA Y REGLAS DE REPARTO A DOMICILIO (48h)
   * ========================================================================
   */
  addToCart(sku) {
    const product = this.products.find(p => p.SKU === sku);
    
    // Validación estricta: No permitir compra de productos agotados
    if (!product || product.Stock <= 0) {
      alert(this.currentLang === 'ca' ? "Aquest producte està esgotat." : "Este producto está agotado.");
      return;
    }

    const existing = this.cart.find(item => item.SKU === sku);
    if (existing) {
      if (existing.qty >= product.Stock) {
        alert(this.currentLang === 'ca' 
          ? `Estoc màxim assolit (${product.Stock} uts disponibles).` 
          : `Stock máximo alcanzado (${product.Stock} uds disponibles).`);
        return;
      }
      existing.qty += 1;
    } else {
      this.cart.push({ ...product, qty: 1 });
    }

    this.updateCartUI();
    // this.toggleCartModal(true);

  }

  changeQty(sku, delta) {
    const item = this.cart.find(c => c.SKU === sku);
    if (!item) return;

    const originalProduct = this.products.find(p => p.SKU === sku);
    const maxStock = originalProduct ? originalProduct.Stock : item.Stock;

    if (delta > 0 && item.qty >= maxStock) {
      alert(this.currentLang === 'ca' 
        ? `No hi ha més unitats en estoc (Màxim: ${maxStock}).` 
        : `No hay más unidades en stock (Máximo: ${maxStock}).`);
      return;
    }

    item.qty += delta;
    if (item.qty <= 0) {
      this.cart = this.cart.filter(c => c.SKU !== sku);
    }

    this.updateCartUI();
  }

  removeFromCart(sku) {
    this.cart = this.cart.filter(c => c.SKU !== sku);
    this.updateCartUI();
  }

  updateCartUI() {
    const badge = document.getElementById('cartCountBadge');
    const list = document.getElementById('cartItemsList');
    const subtotalEl = document.getElementById('cartSubtotalText');
    const shippingEl = document.getElementById('cartShippingCostText');
    const totalEl = document.getElementById('cartTotalText');
    const progressTrack = document.getElementById('shippingProgressBar');
    const progressText = document.getElementById('shippingProgressText');
    const progressAmount = document.getElementById('shippingProgressAmount');

    const totalUnits = this.cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = this.cart.reduce((sum, item) => sum + (item.qty * item.Precio), 0);

    if (badge) badge.textContent = totalUnits;


    // Reglas de Envío para Terrassa (3,99€) y comarca (5,99€)
    const FREE_SHIPPING_LIMIT = 100.00;
    const selectedTown = document.getElementById('checkoutTown')?.value || 'Terrassa';

    let shippingFee = 0.00;
    if (this.deliveryMethod === 'DOMICILIO') {
      if (subtotal >= FREE_SHIPPING_LIMIT) {
        shippingFee = 0.00;
      } else if (selectedTown === 'Otra') {
        shippingFee = 0.00; // Fuera de zona / Recogida
      } else if (selectedTown === 'Terrassa') {
        shippingFee = 3.99;
      } else {
        shippingFee = 5.99; // Viladecavalls, Vacarisses, Rubí, Sabadell, etc.
      }
    }

    const finalTotal = subtotal + shippingFee;

    if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)}€`;
    if (shippingEl) {
      if (this.deliveryMethod === 'RECOGIDA' || shippingFee === 0) {
        shippingEl.textContent = 'Gratis';
        shippingEl.className = "font-black text-emerald-600 dark:text-emerald-400";
      } else {
        shippingEl.textContent = `${shippingFee.toFixed(2)}€`;
        shippingEl.className = "font-bold text-zinc-700 dark:text-zinc-300";
      }
    }
    if (totalEl) totalEl.textContent = `${finalTotal.toFixed(2)}€`;

    // Barra de progreso hacia envío gratis
    if (progressTrack && progressText && progressAmount) {
      const percentage = Math.min(100, Math.round((subtotal / FREE_SHIPPING_LIMIT) * 100));
      progressTrack.style.width = `${percentage}%`;
      progressAmount.textContent = `${subtotal.toFixed(2)}€ / ${FREE_SHIPPING_LIMIT.toFixed(2)}€`;

      if (subtotal >= FREE_SHIPPING_LIMIT) {
        progressText.textContent = this.currentLang === 'ca' 
          ? "✓ Tens enviament GRATUÏT a domicili (48h)!" 
          : "✓ ¡Tienes envío GRATUITO a domicilio (48h)!";
      } else {
        const remaining = (FREE_SHIPPING_LIMIT - subtotal).toFixed(2);
        progressText.textContent = this.currentLang === 'ca'
          ? `Afegeix ${remaining}€ per a enviament GRATUÏT a domicili`
          : `Añade ${remaining}€ para envío GRATUITO a domicilio`;
      }
    }

    if (!list) return;

    if (this.cart.length === 0) {
      list.innerHTML = `
        <div class="py-8 text-center text-zinc-400">
          <span class="text-3xl block mb-1">🛒</span>
          <p class="font-bold text-xs">${I18N[this.currentLang].cart_empty}</p>
        </div>`;
      return;
    }

    list.innerHTML = '';
    this.cart.forEach(item => {
      const originalProduct = this.products.find(p => p.SKU === item.SKU);
      const isMax = originalProduct && item.qty >= originalProduct.Stock;

      const row = document.createElement('div');
      row.className = "py-3 flex items-center justify-between gap-3";
      row.innerHTML = `
        <div class="flex items-center gap-2.5 flex-1 min-w-0">
          <img 
            src="${item.Imagen}" 
            alt="${item.Nombre}" 
            class="w-12 h-12 object-cover rounded-xl border border-brand-earth/20 shrink-0" 
            onerror="this.src='https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=60'"
          />
          <div class="min-w-0">
            <h4 class="font-bold text-xs truncate text-brand-earth dark:text-zinc-200" title="${item.Nombre}">
              ${item.Nombre}
            </h4>
            <div class="flex items-center gap-2 text-[11px]">
              <span class="text-brand-turquoise font-black">${item.Precio.toFixed(2)}€</span>
              <span class="text-zinc-400">Total: ${(item.Precio * item.qty).toFixed(2)}€</span>
            </div>
            ${isMax ? `<span class="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">Màxim en estoc assolit</span>` : ''}
          </div>
        </div>
        
        <div class="flex items-center gap-2 shrink-0">
          <div class="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-300 dark:border-zinc-700">
            <button type="button" class="w-6 h-6 rounded-md bg-white dark:bg-zinc-700 text-brand-earth dark:text-zinc-100 font-bold flex items-center justify-center hover:bg-zinc-200 transition" data-action="dec" data-sku="${item.SKU}">-</button>
            <span class="text-xs font-black w-5 text-center">${item.qty}</span>
            <button type="button" class="w-6 h-6 rounded-md bg-white dark:bg-zinc-700 text-brand-earth dark:text-zinc-100 font-bold flex items-center justify-center hover:bg-zinc-200 transition ${isMax ? 'opacity-40 cursor-not-allowed' : ''}" data-action="inc" data-sku="${item.SKU}">+</button>
          </div>
          
          <button type="button" class="text-zinc-400 hover:text-red-500 p-1 transition" data-action="remove" data-sku="${item.SKU}" title="Eliminar producte">
            🗑️
          </button>
        </div>
      `;

      row.querySelector('[data-action="dec"]').onclick = () => this.changeQty(item.SKU, -1);
      row.querySelector('[data-action="inc"]').onclick = () => this.changeQty(item.SKU, 1);
      row.querySelector('[data-action="remove"]').onclick = () => this.removeFromCart(item.SKU);
      list.appendChild(row);
    });
  }

  toggleCartModal(forceOpen = null) {
    const modal = document.getElementById('cartModal');
    if (!modal) return;
    
    if (forceOpen === true) {
      modal.classList.remove('hidden');
    } else if (forceOpen === false) {
      modal.classList.add('hidden');
    } else {
      modal.classList.toggle('hidden');
    }
  }

  setDeliveryMethod(method) {
    this.deliveryMethod = method;
    const btnP = document.getElementById('btnPickup');
    const btnD = document.getElementById('btnDelivery');
    const fields = document.getElementById('deliveryFields');

    if (method === 'RECOGIDA') {
      btnP?.classList.add('selected');
      btnD?.classList.remove('selected');
      fields?.classList.add('hidden');
    } else {
      btnD?.classList.add('selected');
      btnP?.classList.remove('selected');
      fields?.classList.remove('hidden');
    }

    this.updateCartUI();
  }

  setPaymentMethod(methodName) {
    this.selectedPaymentMethod = methodName;
    document.querySelectorAll('#paymentOptionsContainer .payment-option-card').forEach(card => {
      const match = (card.getAttribute('data-payment') === methodName);
      card.classList.toggle('selected', match);
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = match;
    });
  }

  async submitOrder() {
    if (!this.cart || this.cart.length === 0) {
      alert(this.currentLang === 'ca' ? "La cistella està buida!" : "¡La cesta está vacía!");
      return;
    }

    const name = document.getElementById('checkoutName')?.value?.trim();
    const phone = document.getElementById('checkoutPhone')?.value?.trim();
    const email = document.getElementById('checkoutEmail')?.value?.trim();

    if (!name || !phone || !email) {
      alert(this.currentLang === 'ca'
      ? "Si us plau, omple les dades de contacte (Nom, Telèfon i Email)."
      : "Por favor, completa los datos de contacto (Nombre, Teléfono y Email).");
      return;
    }

    let town = "Terrassa";
    let addr = "Recollida a botiga";
    let notes = document.getElementById('checkoutDeliveryNotes')?.value?.trim() || "";

    if (this.deliveryMethod === 'DOMICILIO') {
      town = document.getElementById('checkoutTown')?.value || "Terrassa";
      addr = document.getElementById('checkoutAddress')?.value?.trim();

      if (!addr) {
        alert(this.currentLang === 'ca'
        ? "Si us plau, indica l'adreça completa per al lliurament a domicili."
        : "Por favor, indica la dirección completa para la entrega a domicilio.");
        return;
      }
    }

    // Calcular subtotal y gastos de envío
    const subtotal = this.cart.reduce((sum, item) => sum + ((parseFloat(item.Precio) || 0) * (item.quantity || 1)), 0);
    let shippingCost = 0;

    if (this.deliveryMethod === 'DOMICILIO' && subtotal < 100) {
      shippingCost = (town === 'Terrassa') ? 3.99 : 5.99;
    }

    const totalCalculated = (subtotal + shippingCost).toFixed(2);

    // Resumen de productos comprados
    const itemsSummary = this.cart.map(item => {
      const qty = item.quantity || item.qty || item.cantidad || 1;
      const rawPrice = item.Precio || item.Preu || item.precio || item.price || 0;
      const cleanPrice = parseFloat(String(rawPrice).replace(',', '.').replace(/[^0-9.]/g, '')) || 0;
      const itemTotal = (cleanPrice * qty).toFixed(2);
      return `• ${item.Nombre || item.Nom || 'Producte'} (x${qty}) - ${itemTotal}€`;
    }).join('\n');


    // Preparar el paquete de datos para Apps Script
    const orderData = {
      orderId: "CT-" + Date.now().toString().slice(-6),
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      deliveryMethod: this.deliveryMethod === 'DOMICILIO' ? 'Repartiment a domicili (48h)' : 'Recollida a botiga',
      deliveryTown: town,
      deliveryAddress: addr,
      itemsSummary: itemsSummary,
      subtotal: subtotal.toFixed(2),         // 👈 Añadido
      shippingCost: shippingCost.toFixed(2), // 👈 Añadido
      totalPrice: totalCalculated,
      notes: notes
    };


    // Deshabilitar botón durante el envío
    const submitBtn = document.getElementById('btnCheckoutSubmit');
    if (submitBtn) submitBtn.disabled = true;

    try {
      // Envío de la comanda a Google Apps Script
      await fetch(ORDER_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      alert(this.currentLang === 'ca'
      ? "¡Comanda enviada amb èxit! Rebràs un correu de confirmació."
      : "¡Pedido enviado con éxito! Recibirás un correo de confirmación.");

      // Vaciar carrito y cerrar modal
      this.cart = [];
      if (typeof this.saveCart === 'function') this.saveCart();
      if (typeof this.updateCartUI === 'function') this.updateCartUI();
      if (typeof this.closeCartModal === 'function') this.closeCartModal();

      // Resetear los campos de texto del comprador
      ['checkoutName', 'checkoutPhone', 'checkoutEmail', 'checkoutAddress', 'checkoutDeliveryNotes'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
      });


    } catch (error) {
      console.error("Error enviant la comanda:", error);
      alert(this.currentLang === 'ca'
      ? "Error en enviar la comanda. Torna-ho a intentar."
      : "Error al enviar el pedido. Inténtalo de nuevo.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }



  resetCartView() {
    const activeView = document.getElementById('cartActiveView');
    const successView = document.getElementById('cartSuccessView');
    if (activeView && successView) {
      activeView.classList.remove('hidden');
      successView.classList.add('hidden');
    }
    this.updateCartUI();
  }

  /**
   * ========================================================================
   * 8. FORMULARIO INTERACTIVO DE ENDOTERAPIA (SKILL.md punto 27)
   * ========================================================================
   */
  initEndoterapia() {
    const form = document.getElementById('formEndoterapia');
    const qtyInput = document.getElementById('endoQuantity');
    const btnInc = document.getElementById('btnIncEndoQty');
    const btnDec = document.getElementById('btnDecEndoQty');
    const treePills = document.getElementById('endoTreePills');
    const treeTypeInput = document.getElementById('endoTreeType');
    const dropzone = document.getElementById('endoDropzone');
    const photoInput = document.getElementById('endoPhoto');
    const previewContainer = document.getElementById('endoPhotoPreviewContainer');
    const previewImg = document.getElementById('endoPhotoPreviewImg');
    const promptBox = document.getElementById('endoUploadPrompt');
    const btnRemovePhoto = document.getElementById('btnRemoveEndoPhoto');
    const photoNameEl = document.getElementById('endoPhotoName');
    const photoSizeEl = document.getElementById('endoPhotoSize');
    const successView = document.getElementById('endoSuccessView');
    const btnCloseSuccess = document.getElementById('btnCloseEndoSuccess');

    // Contenedor dinámico de perímetros
    const perimetersContainer = document.getElementById('endoPerimetersContainer');

    // Función para dibujar una casilla por cada árbol
    const updatePerimeters = () => {
      if (!perimetersContainer || !qtyInput) return;
      const count = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      let html = '';
      for (let i = 1; i <= count; i++) {
        html += `
        <div>
        <label class="block text-[11px] text-stone-400 mb-1">Àrbol ${i} (cm)</label>
        <input type="number" class="endo-perimeter-input w-full p-2.5 rounded-xl border text-sm dark:bg-zinc-900" placeholder="Ex: 75" required>
        </div>
        `;
      }
      perimetersContainer.innerHTML = html;
    };

    // Actualizar casillas al inicio y al cambiar la cantidad
    updatePerimeters();

    btnInc?.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = val + 1;
      updatePerimeters(); // <--- Añadir esta línea
    });

    btnDec?.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) qtyInput.value = val - 1;
      updatePerimeters(); // <--- Añadir esta línea
    });

    qtyInput?.addEventListener('input', updatePerimeters);


    btnInc?.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      qtyInput.value = val + 1;
    });

    btnDec?.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) qtyInput.value = val - 1;
    });

    treePills?.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const tree = btn.getAttribute('data-tree');
        if (treeTypeInput && tree) {
          treeTypeInput.value = tree;
          treeTypeInput.focus();
        }
      });
    });

    dropzone?.addEventListener('click', (e) => {
      if (e.target !== btnRemovePhoto && !btnRemovePhoto?.contains(e.target)) {
        photoInput?.click();
      }
    });

    dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('border-brand-turquoiseDark', 'bg-teal-100');
    });

    dropzone?.addEventListener('dragleave', () => {
      dropzone.classList.remove('border-brand-turquoiseDark', 'bg-teal-100');
    });

    dropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-brand-turquoiseDark', 'bg-teal-100');
      if (e.dataTransfer?.files?.length > 0) {
        photoInput.files = e.dataTransfer.files;
        handlePhotoFile(e.dataTransfer.files[0]);
      }
    });

    const handlePhotoFile = (file) => {
      if (!file || !file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        if (previewImg) previewImg.src = evt.target.result;
        if (photoNameEl) photoNameEl.textContent = file.name;
        if (photoSizeEl) photoSizeEl.textContent = `${(file.size / 1024).toFixed(1)} KB`;
        
        promptBox?.classList.add('hidden');
        previewContainer?.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    };

    photoInput?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handlePhotoFile(e.target.files[0]);
      }
    });

    btnRemovePhoto?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (photoInput) photoInput.value = '';
      if (previewImg) previewImg.src = '';
      previewContainer?.classList.add('hidden');
      promptBox?.classList.remove('hidden');
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const treeType = treeTypeInput?.value.trim() || 'No especificado';
      const quantity = qtyInput?.value || '1';
      const name = document.getElementById('endoName')?.value.trim() || '';
      const address = document.getElementById('endoAddress')?.value.trim() || '';
      const phone = document.getElementById('endoPhone')?.value.trim() || '';

      // Obtener las medidas de cada árbol
      const perimeterInputs = document.querySelectorAll('.endo-perimeter-input');
      const perimetersList = Array.from(perimeterInputs)
      .map((input, idx) => `Árbol ${idx + 1}: ${input.value || 0} cm`)
      .join(', ');

      // Redactar mensaje de correo
      const mailSubject = encodeURIComponent(`Solicitud Endoterapia - ${name}`);
      const mailBody = encodeURIComponent(
        `Solicitud de Tratamiento de Endoterapia:\n\n` +
        `Especie/Tipo: ${treeType}\n` +
        `Cantidad de árboles: ${quantity}\n` +
        `Perímetros: ${perimetersList}\n` +
        `Contacto: ${name}\n` +
        `Teléfono: ${phone}\n` +
        `Dirección/Finca: ${address}\n\n` +
        `* Recuerda adjuntar la foto del árbol/plaga en este correo si dispones de ella.`
      );

      // Abrir cliente de correo hacia gardencantorra@yahoo.es
      window.location.href = `mailto:gardencantorra@yahoo.es?subject=${mailSubject}&body=${mailBody}`;

      // Mostrar la pantalla de éxito
      if (successView && form) {
        document.getElementById('endoSuccessRef').textContent = `EXP-${Date.now().toString().slice(-6)}`;
        document.getElementById('endoSuccessTree').textContent = treeType;
        document.getElementById('endoSuccessQty').textContent = `${quantity} árbol(es)`;
        document.getElementById('endoSuccessPerimeter').textContent = perimetersList;
        document.getElementById('endoSuccessContact').textContent = `${name} (${phone})`;

        form.classList.add('hidden');
        successView.classList.remove('hidden');
      }
    });


    btnCloseSuccess?.addEventListener('click', () => {
      form?.reset();
      btnRemovePhoto?.click();
      form?.classList.remove('hidden');
      successView?.classList.add('hidden');
      this.closeModal('modalEndoterapia');
    });
  }

  /**
   * ========================================================================
   * 9. IDIOMA, TEMA Y MODALES
   * ========================================================================
   */
  changeLanguage(lang) {
    if (!I18N[lang]) return;
    this.currentLang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (I18N[lang][key]) {
        el.textContent = I18N[lang][key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (I18N[lang][key]) {
        el.placeholder = I18N[lang][key];
      }
    });

    // Actualizar submenús dinámicos en el nuevo idioma
    this.setCategory(this.activeCategory);
    this.updateCartUI();
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('canTorra_theme', isDark ? 'dark' : 'light');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
  }

  loadTheme() {
    const saved = localStorage.getItem('canTorra_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = (saved === 'dark') || (!saved && prefersDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
      const icon = document.getElementById('themeIcon');
      if (icon) icon.textContent = '☀️';
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  /**
   * ========================================================================
   * 10. VINCULACIÓN DE EVENTOS DEL DOM
   * ========================================================================
   */
  bindEvents() {
    // Inicializar lógica de Endoterapia
    this.initEndoterapia();

    // Vincular clics de las tarjetas de categorías principales
    document.querySelectorAll('#mainCategoriesNav .category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const catKey = btn.getAttribute('data-category');
        if (catKey) {
          this.setCategory(catKey);

          // Actualizar estilo activo visual en las tarjetas
          document.querySelectorAll('#mainCategoriesNav .category-btn').forEach(b => {
            b.classList.remove('active', 'border-brand-turquoise', 'bg-teal-50');
          });
          btn.classList.add('active', 'border-brand-turquoise', 'bg-teal-50');
        }
      });
    });


    // Logo interactivo
    document.getElementById('brandLogo')?.addEventListener('click', () => {
      this.setCategory('TODOS');
    });

    // Búsqueda en vivo
    const handleSearch = (val) => {
      this.searchTerm = val.trim();
      this.applyFilters();
    };

    document.getElementById('searchInput')?.addEventListener('input', (e) => handleSearch(e.target.value));
    document.getElementById('searchInputMobile')?.addEventListener('input', (e) => handleSearch(e.target.value));

    // Idioma
    document.getElementById('langSelect')?.addEventListener('change', (e) => {
      this.changeLanguage(e.target.value);
    });

    // Tema
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Carrito
    document.getElementById('cartBtn')?.addEventListener('click', () => {
      this.resetCartView();
      this.toggleCartModal(true);
    });
    document.getElementById('btnCloseCartModal')?.addEventListener('click', () => this.toggleCartModal(false));
    document.getElementById('btnPickup')?.addEventListener('click', () => this.setDeliveryMethod('RECOGIDA'));
    document.getElementById('btnDelivery')?.addEventListener('click', () => this.setDeliveryMethod('DOMICILIO'));
    document.getElementById('checkoutTown')?.addEventListener('change', () => this.updateCartUI());
    document.getElementById('btnCheckoutSubmit')?.addEventListener('click', () => this.submitOrder());
    document.getElementById('btnContinueShopping')?.addEventListener('click', () => {
      this.resetCartView();
      this.toggleCartModal(false);
    });

    // Formas de pago
    document.querySelectorAll('#paymentOptionsContainer .payment-option-card').forEach(card => {
      card.addEventListener('click', () => {
        const payment = card.getAttribute('data-payment');
        if (payment) this.setPaymentMethod(payment);
      });
    });

    // Categorías principales de la Navbar
    document.getElementById('navCategoryAll')?.addEventListener('click', () => this.setCategory('TODOS'));
    document.getElementById('navCategoryMascotas')?.addEventListener('click', () => this.setCategory('MASCOTAS'));
    document.getElementById('navCategoryHuerto')?.addEventListener('click', () => this.setCategory('HUERTO_JARDIN'));
    document.getElementById('navCategoryAlimentacion')?.addEventListener('click', () => this.setCategory('ALIMENTACION'));
    document.getElementById('navCategoryMiscelanea')?.addEventListener('click', () => this.setCategory('MISCELANEA'));

    // Botón cerrar submenús
    document.getElementById('btnCloseSubcategories')?.addEventListener('click', () => {
      document.getElementById('subcategoriesNav')?.classList.add('hidden');
    });

    // Toggle de marcas con stock
    const stockToggle = document.getElementById('toggleOnlyInStockBrands');
    stockToggle?.addEventListener('change', (e) => {
      this.onlyInStockBrands = Boolean(e.target.checked);
      this.renderBrandFilterButtons();
    });

    // Limpiar filtro de marcas
    document.getElementById('clearBrandFilterBtn')?.addEventListener('click', () => {
      this.clearBrandFilter();
    });

    // Botón directo desde el banner de Endoterapia
    document.getElementById('btnOpenEndoFromBanner')?.addEventListener('click', () => {
      this.openModal('modalEndoterapia');
    });

    // Asesoramiento Agrícola y Endoterapia
    document.getElementById('btnNavAsesoramiento')?.addEventListener('click', () => this.openModal('modalAsesoramiento'));
    document.getElementById('heroAdviceBtn')?.addEventListener('click', () => this.openModal('modalAsesoramiento'));
    document.getElementById('btnCloseAsesoramientoModal')?.addEventListener('click', () => this.closeModal('modalAsesoramiento'));

    document.getElementById('btnNavEndoterapia')?.addEventListener('click', () => this.openModal('modalEndoterapia'));
    document.getElementById('btnCloseEndoterapiaModal')?.addEventListener('click', () => this.closeModal('modalEndoterapia'));
  }
}

// Iniciar Singleton global al cargar el DOM
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new GardenCanTorraApp();
});
