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

export const changelog: Entry[] = [
  {
    version: '3.0.0+247',
    level: 'major',
    date: 'jun 2025 — presente',
    role: 'Flutter Developer',
    org: 'INCLUB · Remoto',
    added: [
      'Persistencia offline con SQLite y sincronización al reconectar',
      'Clean Architecture: datos / dominio / presentación',
      'Estado predecible con BLoC y Cubit en flujos complejos',
      'Perfilado: tiempos de carga, animaciones, memoria',
    ],
    removed: ['Estado disperso en widgets', 'Dependencia total de conexión'],
    chips: ['Flutter', 'Dart', 'SQLite', 'BLoC', 'REST', 'Figma'],
    featured: true,
  },
  {
    version: '2.1.0',
    level: 'minor',
    date: 'ene 2024',
    role: 'Android nativo con Compose',
    org: 'Udemy · certificación',
    chips: ['Kotlin', 'Jetpack Compose'],
    featured: true,
  },
  {
    version: '2.0.0',
    level: 'major',
    date: 'ene 2023 — dic 2024',
    role: 'Flutter Developer',
    org: 'WMIND · Remoto',
    added: [
      'Firebase: Auth, Firestore y Remote Config',
      'Releases en Google Play Console',
      'Scrum con Jira y Git sobre Bitbucket',
    ],
    chips: ['Flutter', 'Firebase', 'Firestore', 'Bitbucket', 'Jira'],
    featured: true,
  },
  {
    version: '1.2.0',
    level: 'minor',
    date: 'dic 2022',
    role: 'Azure Fundamentals · AZ-900',
    org: 'Microsoft · ID I511-9834',
  },
  {
    version: '1.1.1',
    level: 'patch',
    date: 'dic 2022',
    role: 'Scrum Foundation Professional · CertiProf',
  },
  {
    version: '1.1.0',
    level: 'patch',
    date: 'ene 2022',
    role: 'Google Cloud Fundamentals · Coursera',
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
