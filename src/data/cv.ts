import { certifications, education, profile, skillGroups, socials } from '@/data/profile';
import { employment, type EmploymentId } from '@/data/changelog';

export interface CvMetric {
  value: string;
  label: string;
}

export interface CvExperience {
  company: 'INCLUB' | 'Freelance' | 'WMIND';
  role: string;
  period: string;
  context: string;
  achievements: readonly string[];
}

export interface CvStackGroup {
  label: string;
  items: string;
}

const socialUrl = (label: string) => socials.find((social) => social.label === label)?.url ?? '';
type SkillGroupId = (typeof skillGroups)[number]['id'];
type CertificationId = (typeof certifications)[number]['id'];

const required = <T>(items: readonly T[], predicate: (item: T) => boolean, label: string): T => {
  const item = items.find(predicate);
  if (!item) throw new Error(`Missing canonical CV data: ${label}`);
  return item;
};

const selectedSkills = [
  'mobile',
  'databases',
  'integration',
  'cloud',
  'tools',
] as const satisfies readonly SkillGroupId[];
const selectedCertifications = [
  'compose',
  'azure',
  'scrum',
] as const satisfies readonly CertificationId[];
const selectedEmployment = [
  'inclub',
  'freelance',
  'wmind',
] as const satisfies readonly EmploymentId[];

const directedAchievements: Record<EmploymentId, readonly string[]> = {
  inclub: [
    'Desarrollé más de 30 pantallas fluidas y responsivas en Flutter/Dart desde diseño Figma para app fintech (iOS y Android) en App Store y Play Store.',
    'Integré APIs REST bajo Clean Architecture con Cubit/BLoC, navegación con GoRouter e inyección de dependencias con GetIt.',
    'Colaboré en la verificación de identidad (KYC) con escaneo de DNI peruano: aporté al desarrollo y pruebas de dni_peru_ocr (ML Kit, MRZ ICAO 9303) en pub.dev.',
    'Apliqué actualizaciones OTA con Shorebird (hotfixes en minutos) y automaticé CI/CD con GitHub Actions (Android) y Xcode Cloud (iOS).',
    'Monitoreé errores con Sentry y resolví cuellos de botella, contribuyendo al 99.5% de crash-free de la app.',
  ],
  freelance: [
    'Colaboré en el Portal de Proveedores de Go Nexa, SaaS multi-tenant: homologación, órdenes de compra y facturación (Next.js, NestJS, PostgreSQL).',
    'Colaboré en Impulsa, SaaS para micro-negocios peruanos (citas, POS, inventario, facturación electrónica), aportando en la app Flutter con backend NestJS.',
    'Colaboré en el MVP de Nuppi, POS con IA conversacional (Kotlin, Jetpack Compose, Firebase, Gemini), y en Web SEL (React 19, TypeScript, Tailwind).',
  ],
  wmind: [
    'Implementé interfaces en Flutter aplicando Clean Architecture + BLoC y principios de Clean Code.',
    'Implementé almacenamiento local con SQLite para funcionamiento offline, con sincronización al recuperar la red.',
    'Desarrollé el backend con Java y Spring Boot: analicé y construí 10 APIs REST desde el diagrama hasta su implementación en producción.',
    'Configuré Spring Security con roles y permisos por endpoint, y políticas CORS para el consumo seguro desde la app móvil.',
    'Integré Firebase (Auth, Firestore, Remote Config) y gestioné releases en Google Play Console.',
  ],
};

// La experiencia y su copy son una proyección editorial dirigida a puestos Flutter.
// Identidad, formación y habilidades permanecen ancladas al perfil canónico.
const directedEducation = [
  ...education.map((item) => ({ title: item.title, detail: item.org })),
  ...selectedCertifications.map((id) => {
    const item = required(certifications, (certification) => certification.id === id, id);
    return { title: item.title, detail: item.org };
  }),
];

interface AvailabilitySource {
  available: boolean;
  availableLabel: string;
  utcOffset: string;
}

export const cvAvailability = ({ available, availableLabel, utcOffset }: AvailabilitySource) => ({
  available,
  label: available ? availableLabel : 'No disponible actualmente',
  detail: `Remoto · ${utcOffset} · Español nativo`,
});

export const cv = {
  name: profile.name,
  email: profile.email,
  phone: profile.phone,
  phoneDisplay: profile.phoneDisplay,
  location: `${profile.city}, ${profile.region} · ${profile.country}`,
  linkedin: socialUrl('LinkedIn'),
  github: socialUrl('GitHub'),
  role: 'Flutter Engineer · Offline-first · Fintech',
  summary:
    'Flutter Engineer con más de 3 años construyendo aplicaciones móviles confiables con Dart, BLoC y Clean Architecture. Especializado en persistencia local, sincronización offline-first e integraciones financieras, desde la definición técnica hasta la publicación en App Store y Google Play.',
  metrics: [
    { value: '99.5%', label: 'sesiones crash-free en producción' },
    { value: '30+', label: 'pantallas Flutter entregadas' },
    { value: '10', label: 'APIs integradas en productos reales' },
  ] satisfies CvMetric[],
  experience: selectedEmployment.map((id) => ({
    ...required(employment, (job) => job.id === id, id),
    achievements: directedAchievements[id],
  })) satisfies CvExperience[],
  stack: selectedSkills.map((id) => {
    const group = required(skillGroups, (item) => item.id === id, id);
    return { label: group.group, items: group.items };
  }) satisfies CvStackGroup[],
  education: directedEducation,
  availability: cvAvailability(profile),
} as const;
