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

/** Rellena esto con lo tuyo. Son las tres líneas más humanas de la web. */
export const icebreakers = [
  {
    term: 'Fuera del editor',
    def: 'Rellena con lo tuyo: deporte, música, cocina, lo que sea real.',
  },
  { term: 'Lo que sigo ahora', def: 'Un libro, una serie o un anime que estés viendo.' },
  {
    term: 'Manía profesional',
    def: 'Algo concreto: «no subo un PR sin pasar el analizador de Dart».',
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
    items: 'Flutter SDK, Dart, BLoC/Cubit, Clean Architecture, Jetpack Compose, Kotlin',
  },
  {
    id: 'databases',
    group: 'Bases de datos',
    items: 'SQL Server (SSMS), MySQL, SQLite (persistencia offline), Firestore',
  },
  {
    id: 'integration',
    group: 'Integración',
    items: 'APIs REST (JSON), Firebase (Auth, Firestore, Remote Config)',
  },
  { id: 'cloud', group: 'Cloud', items: 'Google Cloud Platform, Microsoft Azure (AZ-900)' },
  {
    id: 'tools',
    group: 'Herramientas',
    items: 'Git (Bitbucket), Jira, VS Code, Android Studio, Google Play Console, Figma',
  },
] as const;
