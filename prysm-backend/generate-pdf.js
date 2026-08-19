const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Register Handlebars helpers
Handlebars.registerHelper('eq', (a, b) => a === b);

Handlebars.registerHelper('colorName', (hex) => {
  // Generate a descriptive color name based on hex
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Determine color family
  const isWarm = g > b || (r > 150 && g > 100);
  const isCool = b > g || (r < 150 && b > 100);
  const isNeutral = Math.abs(r - g) < 30 && Math.abs(g - b) < 30;

  let prefix = '';
  let suffix = '';

  // Determine lightness
  const brightness = (r + g + b) / 3;
  if (brightness > 180) prefix = 'Claro';
  else if (brightness < 80) prefix = 'Oscuro';
  else prefix = 'Medio';

  // Determine base color
  if (r > g && r > b) {
    if (g > 100) suffix = 'coral';
    else suffix = 'rojo';
  } else if (g > r && g > b) {
    suffix = 'verde';
  } else if (b > r && b > g) {
    suffix = 'azul';
  } else if (r > 150 && g > 100 && b < 100) {
    suffix = 'ocre';
  } else if (r > 100 && g > 60 && b < 60) {
    suffix = 'marrón';
  } else if (r === g && g === b) {
    suffix = 'gris';
  } else {
    suffix = 'neutro';
  }

  return `${prefix} ${suffix}`.trim();
});

Handlebars.registerHelper('hairColorName', (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (r > 100 && g > 60 && b < 50) {
    return 'Castaño cálido';
  } else if (r > 120 && g > 80 && b < 60) {
    return 'Cobre';
  } else if (r < 80 && g < 60 && b < 60) {
    return 'Negro';
  } else if (r > 180 && g > 160 && b > 140) {
    return 'Rubio';
  } else if (r > 100 && g > 50 && b < 80) {
    return 'Rojo oscuro';
  } else if (g > r && g > b) {
    return 'Castaño verdoso';
  } else {
    return 'Castaño';
  }
});

Handlebars.registerHelper('fabricColor', (index) => {
  const colors = ['#8B7355', '#D4C4B0', '#6B5B4F', '#A89078', '#C8B8A8'];
  return colors[index % colors.length];
});

Handlebars.registerHelper('fabricDesc', (fabric) => {
  const descriptions = {
    'Seda natural': 'Caída elegante y brillo sutil',
    'Algodón premium': 'Transpirable y estructurado',
    'Cuero suave': 'Lujoso y duradero',
    'Punto pesado': 'Forma y define la silueta',
    'Lino de calidad': 'Natural y sofisticado',
    'Gamuza': 'Suave al tacto, aspecto cálido',
    'Chenille': 'Acaricia la piel, muy cozy',
    'Velvet': 'Brillo sutil, ultra elegante'
  };
  return descriptions[fabric] || 'Texture y acabado premium';
});

/**
 * Generate a PDF report from analysis data
 * @param {Object} data - The analysis data
 * @param {string} outputPath - Path to save the PDF
 * @returns {Promise<string>} - Path to the generated PDF
 */
async function generatePDF(data, outputPath) {
  // Read the HTML template
  const templatePath = path.join(__dirname, 'pdf-template.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf8');

  // Prepare data with defaults and computed values
  const currentDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const clientName = data.name || 'Clienta PRYSM';
  const initials = clientName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const templateData = {
    ...data,
    clientName,
    currentDate,
    initials,
    season: {
      name: data.season?.name || 'No disponible',
      name_en: data.season?.name_en || 'Not available',
      temperature: data.season?.temperature || 'neutral',
      depth: data.season?.depth || 'medium',
      description: data.season?.description || 'Tu temporada de color personalizada.'
    },
    palette: {
      protagonist: data.palette?.protagonist || ['#888888'],
      secondary: data.palette?.secondary || ['#666666'],
      neutral: data.palette?.neutral || ['#999999'],
      accent: data.palette?.accent || ['#777777'],
      avoid: data.palette?.avoid || ['#cccccc']
    },
    silhouette: data.silhouette || 'No disponible',
    silhouette_tips: {
      do: data.silhouette_tips?.do || ['Silueta favorecedora'],
      dont: data.silhouette_tips?.dont || ['Evitar siluetas desfavorecedoras']
    },
    fabrics: data.fabrics || ['Algodón premium'],
    hair_colors: data.hair_colors || ['#4A2810'],
    hair_cuts: data.hair_cuts || ['Corte clásico'],
    face_shape: data.face_shape || 'Ovalada',
    outfits: {
      casual: data.outfits?.casual || { name: 'Día a día', pieces: ['Prenda básica'], colors: ['#888888'] },
      office: data.outfits?.office || { name: 'Oficina', pieces: ['Prenda formal'], colors: ['#666666'] },
      date: data.outfits?.date || { name: 'Citas', pieces: ['Prenda elegante'], colors: ['#999999'] },
      travel: data.outfits?.travel || { name: 'Viajes', pieces: ['Prenda cómoda'], colors: ['#777777'] }
    },
    jewelry: {
      metal: data.jewelry?.metal || 'Dorado',
      tones: data.jewelry?.tones || ['Oro'],
      tonesString: (data.jewelry?.tones || ['Oro']).join(', '),
      avoid: data.jewelry?.avoid || ['Plata'],
      avoidString: (data.jewelry?.avoid || ['Plata']).join(', '),
      styles: data.jewelry?.styles || ['Clásico']
    },
    bags: data.bags || ['Tote clásico'],
    prysmScore: data.prysmScore || '8.5',
    skin: {
      undertone: data.skin?.undertone || 'neutral',
      depth: data.skin?.depth || 'medium',
      contrast: data.skin?.contrast || 'medium'
    }
  };

  // Compile and render the template
  const compileTemplate = Handlebars.compile(templateHtml);
  const html = compileTemplate(templateData);

  // Launch browser
  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  // Set content and wait for fonts to load
  await page.setContent(html, {
    waitUntil: 'networkidle'
  });

  // Wait a bit more for any async rendering
  await page.waitForTimeout(1000);

  // Generate PDF
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });

  await browser.close();

  return outputPath;
}

// Export for use as module
module.exports = { generatePDF };

// If run directly, generate sample PDF
if (require.main === module) {
  const sampleData = {
    name: "Valentina García",
    season: {
      name: "Otoño Profundo",
      name_en: "Deep Autumn",
      temperature: "warm",
      depth: "deep",
      description: "Los tonos cálidos y profundos del otoño se reflejan en tu paleta, con colores como el ocre, terracota y verde musgo que te hacen brillar."
    },
    palette: {
      protagonist: ["#B5691B", "#6E2C00", "#E07B39"],
      secondary: ["#2F4F1E", "#A0522D"],
      neutral: ["#8B4513", "#567568"],
      accent: ["#C68642", "#C0392B"],
      avoid: ["#ADD8E6", "#FFB6C1", "#E6E6FA", "#87CEEB"]
    },
    silhouette: "Reloj de arena · Curvilínea",
    silhouette_tips: {
      do: [
        "Cintura definida",
        "Escotes V y palabra de honor",
        "Mangas que marquen el hombro",
        "Faldas Midi y Maxi"
      ],
      dont: [
        "Ropa totalmente recta sin forma",
        "Cintura alta",
        "Escote alto rígido",
        "Tejidos muy fluidos"
      ]
    },
    fabrics: [
      "Seda natural",
      "Algodón premium",
      "Cuero suave",
      "Punto pesado",
      "Lino de calidad"
    ],
    hair_colors: ["#4A2810", "#7B3F00", "#C68642"],
    hair_cuts: [
      "Largo medios",
      "Corte en V",
      "Bucle suave",
      "Flequillo lateral"
    ],
    face_shape: "Ovalada",
    outfits: {
      casual: {
        name: "Día a día",
        pieces: ["Camisa seda ocre", "Pantalón palazzo camel", "Sneakers blancas"],
        colors: ["#B5691B", "#C68642", "#f5f0e8"]
      },
      office: {
        name: "Oficina",
        pieces: ["Blazer café oscuro", "Blusa seda beige", "Pantalón slim navy"],
        colors: ["#6E2C00", "#A0522D", "#f5f0e8"]
      },
      date: {
        name: "Citas",
        pieces: ["Vestido slip ocre", "Tacón bloque dorado", "Pendientes aro"],
        colors: ["#E07B39", "#B5691B", "#D4A473"]
      },
      travel: {
        name: "Viajes",
        pieces: ["Vestido midi verde musgo", "Denim oscuro", "Gaban camel"],
        colors: ["#2F4F1E", "#C68642", "#d4c8b8"]
      }
    },
    jewelry: {
      metal: "Oro cálido",
      tones: ["Oro", "Bronce", "Cobre"],
      avoid: ["Plata", "Acero"],
      styles: ["Aros colgantes", "Collares en V"]
    },
    bags: [
      "Tote de cuero suave",
      "Crossbody pequeña",
      "Clutch estructurada"
    ],
    prysmScore: "9.2",
    skin: {
      undertone: "warm",
      depth: "deep",
      contrast: "medium"
    },
    photoUrl: null
  };

  const outputPath = path.join(__dirname, 'sample-report.pdf');

  console.log('Generando PDF de muestra...');

  generatePDF(sampleData, outputPath)
    .then(path => {
      console.log(`PDF generado exitosamente: ${path}`);
    })
    .catch(err => {
      console.error('Error al generar PDF:', err);
      process.exit(1);
    });
}
