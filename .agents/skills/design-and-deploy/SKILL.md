Revisa el archivo HTML existente en la carpeta como referencia y organiza la PWA en archivos modulares separados (index.html, styles-css, app.js, y manifest.json).
Actúa como un desarrollador web experto. Crea la estructura completa y el código frontend de una tienda online (PWA) llamada 'Garden Can Torra' (fundada en 1948).
​1. Diseño visual y Ajustes:
​Colores: Principal Azul turquesa corporativo; Fondo Blanco; Texto Marrón tierra/Gris oscuro.
​Iconos: Estilo caricatura, divertidos.
​Ajustes: Interruptor de Tema Claro/Oscuro y selector de Idioma (Español/Catalán).
​2. Base de Datos (Google Sheets):
​La app consumirá datos de un Google Sheets con las columnas: Nombre, Categoría, Subcategoría, Marca, Precio, Descripción, SKU, Código de Barras, Imagen (URL) y Stock.
​Lógica de Stock: Si el Stock es 0, el botón de compra cambia a 'Agotado'.
​Lógica de Filtros: En las vistas de categoría, genera dinámicamente botones de filtrado leyendo la columna 'Marca' (ej. Advance, Brekkies, Pro Plan).
​3. Catálogo y Árbol de Navegación (Estricto):
Implementa exactamente esta jerarquía para los menús:
​1. MASCOTAS:
​1.1 Perro (Alimentación [Seca, Húmeda, Snacks], Paseo y Viaje, Higiene, Descanso, Comederos, Juguetes, Varios)
​1.2 Gato (Alimentación, Rascadores, Higiene y Arenas, Paseo, Juguetes, Varios)
​1.3 Aves (Alimentación, Jaulas y Cuidado)
​1.4 Roedores (Alimentación, Higiene, Equipamiento)
​1.5 Peces (Alimentación)
​1.6 Tortugas (Alimentación)
​1.7 Granja (Alimentación, Equipamiento)
​2. HUERTO Y JARDÍN:
​Herramientas/Maquinaria, Macetas (Terracota, Plástico), Tierras y Nutrición, Fitosanitarios (Insecticidas, Fungicidas, Herbicidas, Control Roedores, Trampas, Endoterapia), Plantas/Cultivo (Semillas, Plantel), Mallas/Riego.
​3. ALIMENTACIÓN: Consumo Humano/Proximidad.
​4. MISCELÁNEA: Tapones de corcho, Varios.
​4. Funciones Especiales:
​Asesoramiento Agrícola: Sección puramente informativa invitando a la tienda física.
​Endoterapia: Formulario de solicitud (tipo de árbol, cantidad, perímetro, nombre, dirección, teléfono, botón para subir fotos). Texto indicando que el presupuesto se cierra por llamada.
​5. Carrito y Checkout:
​Entrega: 'Recogida en tienda' y 'Reparto a domicilio' (Zonas: Terrassa, Viladecavalls, Vacarisses, Ullastrell, Matadepera, Rubí, Sabadell). Plazo máximo de entrega: 48 horas.
​Pago: Tarjeta (Visa/Mastercard), Efectivo a la entrega, Datáfono a la entrega.
​Emails: Preparar lógica para notificaciones de pedido.
