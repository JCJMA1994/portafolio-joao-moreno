/**
 * Fuente canónica de identidad, contacto, formación y habilidades.
 * El CV reutiliza estos datos, pero mantiene copy y experiencia dirigidos a vacantes Flutter.
 */
export const profile = {
  name: 'Jose Carlos Moreno Alemán',
  firstLine: 'Jose Carlos',
  secondLine: 'Moreno Alemán',
  initials: 'JM',
  role: 'Desarrollador Flutter',
  tagline: 'Construyo apps que siguen funcionando sin señal.',
  city: 'Chimbote',
  region: 'Áncash',
  country: 'Perú',
  countryCode: 'PE',
  timezone: 'America/Lima',
  utcOffset: 'UTC−5',
  email: 'joao.moreno.aleman@gmail.com',
  phone: '+51937073781',
  phoneDisplay: '+51 937 073 781',
  available: true,
  availableLabel: 'Disponible para proyectos',
  yearsExperience: 3,
  seoDescription:
    'Desarrollador Flutter con más de 3 años construyendo apps móviles con Dart, BLoC y Clean Architecture. Especializado en persistencia offline con SQLite y sincronización.',
  bio: [
    'Empecé en Ingeniería de Sistemas en la Universidad Nacional del Santa y acabé en Flutter porque me interesaba la parte que el usuario toca de verdad. Llevo tres años en eso.',
    'Trabajo en remoto desde Chimbote. Casi todo lo que he aprendido tiene que ver con hacer que una app se comporte bien cuando la red no colabora: colas de sincronización, estados de carga honestos, datos que sobreviven a un cierre forzado.',
  ],
  seeking: 'un equipo donde el móvil sea el producto',
  seekingRest: ', no un añadido al final del roadmap.',
} as const;

export interface Social {
  label: string;
  url: string;
  /** rel="me" vincula tu identidad entre perfiles. Úsalo solo en los tuyos. */
  me?: boolean;
}

export const socials: Social[] = [
  { label: 'GitHub', url: 'https://github.com/JCJMA1994', me: true },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/jcjma1994/', me: true },
];

export const icebreakers = [
  {
    term: 'Fuera del editor',
    def: 'Explorando nuevas tecnologías móviles, running y café de especialidad.',
  },
  {
    term: 'Lo que sigo ahora',
    def: 'Patrones avanzados de Clean Architecture en Dart y optimizaciones de renderizado a 120 FPS.',
  },
  {
    term: 'Manía profesional',
    def: 'No mergeo un PR sin tests unitarios de estados BLoC y análisis estático estricto.',
  },
];

/**
 * Herramientas como árbol de widgets de Flutter.
 * `indent` es la profundidad; `last` cierra la rama con └─ en vez de ├─.
 */
export interface StackNode {
  indent: number;
  widget: string;
  why: string;
  root?: boolean;
  last?: boolean;
}

export const stack: StackNode[] = [
  {
    indent: 0,
    widget: 'MaterialApp',
    why: 'Flutter + Dart: una base, 60 fps en las dos plataformas',
    root: true,
  },
  { indent: 1, widget: 'MultiBlocProvider', why: 'estado predecible y testeable', last: true },
  { indent: 2, widget: 'Scaffold', why: 'Clean Architecture por capas', last: true },
  { indent: 3, widget: 'SyncQueue', why: 'SQLite: la app sirve en un ascensor' },
  { indent: 3, widget: 'OrderRepository', why: 'APIs REST bajo contrato' },
  {
    indent: 3,
    widget: 'ConnectivityBanner',
    why: 'Firebase cuando el backend propio no aporta',
    last: true,
  },
];

export interface StackSkill {
  name: string;
  icon: string;
  highlight?: boolean;
}

export interface StackLayer {
  layer: string;
  badge: string;
  description: string;
  skills: StackSkill[];
}

export const stackLayers: StackLayer[] = [
  {
    layer: 'Capa 01 · Móvil & UI Reactiva',
    badge: 'Presentation',
    description:
      'Interfaces declarativas a 60/120 FPS, componentes reutilizables desde Figma y gestión de estado predecible.',
    skills: [
      { name: 'Flutter', icon: 'flutter', highlight: true },
      { name: 'Dart', icon: 'dart', highlight: true },
      { name: 'BLoC / Cubit', icon: 'bloc', highlight: true },
      { name: 'Jetpack Compose', icon: 'compose' },
      { name: 'Kotlin', icon: 'kotlin' },
      { name: 'GoRouter', icon: 'router' },
    ],
  },
  {
    layer: 'Capa 02 · Dominio & Arquitectura',
    badge: 'Domain',
    description:
      'Separación estricta de reglas de negocio, inyección de dependencias y validación biométrica con OCR.',
    skills: [
      { name: 'Clean Architecture', icon: 'architecture', highlight: true },
      { name: 'dni_peru_ocr (pub.dev)', icon: 'ocr', highlight: true },
      { name: 'GetIt (DI)', icon: 'di' },
      { name: 'Unit Testing', icon: 'test', highlight: true },
      { name: 'Clean Code', icon: 'code' },
    ],
  },
  {
    layer: 'Capa 03 · Persistencia & Offline-First',
    badge: 'Data Layer',
    description:
      'Bases de datos locales, colas de sincronización bidireccional y consumo robusto de APIs REST bajo contrato.',
    skills: [
      { name: 'SQLite (Offline-first)', icon: 'sqlite', highlight: true },
      { name: 'APIs REST (JSON)', icon: 'api', highlight: true },
      { name: 'Colas de Sync', icon: 'sync', highlight: true },
      { name: 'SQL Server / MySQL', icon: 'sql' },
      { name: 'Firestore', icon: 'firestore' },
    ],
  },
  {
    layer: 'Capa 04 · Backend & Servicios Cloud',
    badge: 'Cloud & Services',
    description:
      'Construcción de microservicios con Java/Spring Boot, seguridad por roles/CORS y feature flags en la nube.',
    skills: [
      { name: 'Java', icon: 'java', highlight: true },
      { name: 'Spring Boot', icon: 'spring', highlight: true },
      { name: 'Spring Security', icon: 'security' },
      { name: 'Firebase (Remote Config & Auth)', icon: 'firebase', highlight: true },
      { name: 'GCP & Azure (AZ-900)', icon: 'cloud' },
    ],
  },
  {
    layer: 'Capa 05 · DevOps, Calidad & Tiendas',
    badge: 'DevOps & Release',
    description:
      'Actualizaciones en caliente sin revisión de tiendas, observabilidad de errores y publicación automatizada.',
    skills: [
      { name: 'Shorebird (OTA Hotfixes)', icon: 'shorebird', highlight: true },
      { name: 'Sentry (Crash Free 99.5%)', icon: 'sentry', highlight: true },
      { name: 'GitHub Actions', icon: 'github' },
      { name: 'Xcode Cloud', icon: 'apple' },
      { name: 'Google Play & App Store', icon: 'stores' },
    ],
  },
];

export const alsoKnows =
  'Kotlin, Jetpack Compose, SQL Server, MySQL, Python, GCP, Azure (AZ-900), Figma, Jira, Bitbucket';

/** Datos del CV imprimible en /cv */
export const education = [
  {
    title: 'Ingeniería de Sistemas e Informática',
    org: 'Universidad Nacional del Santa',
    date: '2018 — 2023',
  },
];

export const certifications = [
  {
    id: 'compose',
    title: 'Desarrollo de apps para Android con Jetpack Compose y Kotlin',
    org: 'Udemy',
    date: 'ene 2024',
  },
  {
    id: 'azure',
    title: 'Microsoft Certified: Azure Fundamentals (AZ-900)',
    org: 'Microsoft · ID I511-9834',
    date: 'dic 2022',
  },
  {
    id: 'scrum',
    title: 'SCRUM Foundation Professional Certificate (SFPC)',
    org: 'CertiProf · ID 81669863',
    date: 'dic 2022',
  },
  {
    id: 'gcp',
    title: 'Google Cloud Fundamentals: Core Infrastructure',
    org: 'Coursera',
    date: 'ene 2022',
  },
] as const;

export const languages = [
  { name: 'Español', level: 'nativo' },
  { name: 'Inglés', level: 'básico, lectura técnica' },
];

export const skillGroups = [
  {
    id: 'mobile',
    group: 'Mobile',
    items:
      'Flutter SDK, Dart, BLoC/Cubit, Clean Architecture, GoRouter, GetIt, Jetpack Compose, Kotlin',
  },
  {
    id: 'databases',
    group: 'Bases de datos',
    items: 'SQL Server (SSMS), MySQL, SQLite (offline), Firestore — optimización de consultas',
  },
  {
    id: 'integration',
    group: 'Integración y backend',
    items: 'APIs REST (JSON), Java, Spring Boot, Spring Security (roles, CORS), Firebase',
  },
  {
    id: 'cloud',
    group: 'Cloud y DevOps',
    items: 'GCP, Azure (AZ-900), CI/CD (GitHub Actions, Xcode Cloud), Shorebird (OTA)',
  },
  {
    id: 'tools',
    group: 'Herramientas',
    items:
      'Git (Bitbucket), Jira, Sentry, Android Studio, Google Play Console, App Store Connect, Figma',
  },
] as const;
