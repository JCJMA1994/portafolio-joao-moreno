/**
 * Trayectoria como changelog con versionado semántico.
 *
 *   major → cambio de rol o de empresa
 *   minor → nueva capacidad técnica
 *   patch → certificación puntual
 *
 * El nivel controla el peso tipográfico: la jerarquía visual ES la
 * jerarquía semántica. No pongas un patch como major para que se vea
 * más grande — rompe lo único que hace honesto a este componente.
 */
export type Level = 'major' | 'minor' | 'patch';

export interface Entry {
  /** Formato pubspec.yaml: x.y.z o x.y.z+build */
  version: string;
  level: Level;
  date: string;
  role: string;
  org?: string;
  /** Qué añadiste al asumir el rol */
  added?: string[];
  /** Qué dejó de pasar. Esto comunica criterio, no solo tareas. */
  removed?: string[];
  chips?: string[];
  /** false → va dentro del <details> de historial completo */
  featured?: boolean;
}

export type EmploymentId = 'inclub' | 'freelance' | 'wmind';

export interface Employment {
  id: EmploymentId;
  company: 'INCLUB' | 'Freelance' | 'WMIND';
  role: string;
  period: string;
  context: string;
}

/** Hechos laborales canónicos; el changelog y el CV son proyecciones editoriales. */
export const employment = [
  {
    id: 'inclub',
    company: 'INCLUB',
    role: 'Flutter Developer',
    period: '2025—actualidad',
    context: 'Fintech · Remoto',
  },
  {
    id: 'freelance',
    company: 'Freelance',
    role: 'Flutter Developer',
    period: '2024—2025',
    context: 'Productos móviles · Remoto',
  },
  {
    id: 'wmind',
    company: 'WMIND',
    role: 'Flutter Developer',
    period: '2023—2024',
    context: 'Software móvil · Remoto',
  },
] as const satisfies readonly Employment[];

const employmentById = (id: EmploymentId) => {
  const item = employment.find((entry) => entry.id === id);
  if (!item) throw new Error(`Missing canonical employment: ${id}`);
  return item;
};

const inclub = employmentById('inclub');
const freelance = employmentById('freelance');
const wmind = employmentById('wmind');

export const changelog: Entry[] = [
  {
    version: '3.1.0+247',
    level: 'major',
    date: inclub.period,
    role: inclub.role,
    org: `${inclub.company} · Keola Networks`,
    added: [
      'Más de 30 pantallas en Flutter/Dart desde Figma para App Store y Play Store',
      'Clean Architecture con BLoC/Cubit, GoRouter e inyección GetIt',
      'Verificación biométrica KYC y escaneo de DNI con dni_peru_ocr en pub.dev',
      'Actualizaciones OTA con Shorebird y CI/CD con GitHub Actions y Xcode Cloud',
      'Monitoreo con Sentry y 99.5% de sesiones crash-free',
    ],
    removed: ['Estado disperso en widgets', 'Dependencia total de conexión'],
    chips: ['Flutter', 'Dart', 'BLoC/Cubit', 'dni_peru_ocr', 'Shorebird', 'Sentry', 'CI/CD'],
    featured: true,
  },
  {
    version: '3.0.0',
    level: 'major',
    date: freelance.period,
    role: freelance.role,
    org: `${freelance.company} · LATAM`,
    added: [
      'Portal de Proveedores Go Nexa (SaaS multi-tenant: Next.js, NestJS, PostgreSQL)',
      'Impulsa SaaS para micro-negocios peruanos (Flutter + NestJS)',
      'MVP de Nuppi (POS con IA conversacional: Kotlin, Compose, Gemini) y Web SEL',
    ],
    chips: ['Flutter', 'NestJS', 'Next.js', 'Kotlin', 'Jetpack Compose', 'Gemini'],
    featured: true,
  },
  {
    version: '2.1.0',
    level: 'minor',
    date: 'ene 2024',
    role: 'Android con Jetpack Compose y Kotlin',
    org: 'Udemy · Certificación',
    chips: ['Kotlin', 'Jetpack Compose'],
    featured: true,
  },
  {
    version: '2.0.0',
    level: 'major',
    date: wmind.period,
    role: wmind.role,
    org: `${wmind.company} · Remoto`,
    added: [
      'Clean Architecture + BLoC e interfaces de alto rendimiento en Flutter',
      'Almacenamiento local con SQLite para funcionamiento offline y sincronización',
      'Desarrollo backend con Java y Spring Boot: 10 APIs REST llevadas a producción',
      'Spring Security con roles, permisos por endpoint y políticas CORS',
      'Integración con Firebase (Auth, Firestore, Remote Config)',
      'Releases en Google Play Console, Jira (Scrum) y Git (Bitbucket)',
    ],
    chips: ['Flutter', 'SQLite', 'Java', 'Spring Boot', 'Spring Security', 'Firebase'],
    featured: true,
  },
  {
    version: '1.2.0',
    level: 'minor',
    date: 'dic 2022',
    role: 'Microsoft Certified: Azure Fundamentals (AZ-900)',
    org: 'Microsoft · ID I511-9834',
  },
  {
    version: '1.1.1',
    level: 'patch',
    date: 'dic 2022',
    role: 'SCRUM Foundation Professional Certificate (SFPC)',
    org: 'CertiProf · ID 81669863',
  },
  {
    version: '1.1.0',
    level: 'patch',
    date: 'ene 2022',
    role: 'Google Cloud Fundamentals: Core Infrastructure',
    org: 'Coursera',
  },
  {
    version: '1.0.0',
    level: 'major',
    date: '2018 — 2023',
    role: 'Ingeniería de Sistemas e Informática',
    org: 'Universidad Nacional del Santa',
  },
];

export const versionLegend: { level: Level; meaning: string }[] = [
  { level: 'major', meaning: 'cambio de rol o empresa' },
  { level: 'minor', meaning: 'nueva capacidad técnica' },
  { level: 'patch', meaning: 'certificación puntual' },
];

/** Ordena por versión semántica descendente. Usado y testeado. */
export function parseVersion(version: string): [number, number, number] {
  const core = version.split('+')[0] ?? '0.0.0';
  const parts = core.split('.').map((n) => Number.parseInt(n, 10) || 0);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

export function compareVersionsDesc(a: string, b: string): number {
  const va = parseVersion(a);
  const vb = parseVersion(b);
  for (let i = 0; i < 3; i++) {
    const diff = (vb[i] ?? 0) - (va[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export const featured = changelog.filter((e) => e.featured);
export const archive = changelog.filter((e) => !e.featured);
