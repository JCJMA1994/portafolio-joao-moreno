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
    'Desarrollo flujos transaccionales y componentes reutilizables con Flutter, BLoC y arquitectura por capas.',
    'Integro servicios financieros y estados resilientes para operaciones críticas con conectividad variable.',
    'Implementé el flujo KYC con dni_peru_ocr y reforcé la entrega continua con Shorebird, CI/CD y monitoreo en Sentry.',
  ],
  freelance: [
    'Entregué Go Nexa e Impulsa de extremo a extremo: autenticación, persistencia local, consumo de servicios y publicación en tiendas.',
    'Implementé automatización CI/CD y observabilidad para acelerar releases y mantener estabilidad en producción.',
    'Desarrollé Nuppi-Web SEL y adapté interfaces y flujos a necesidades operativas de cada producto.',
  ],
  wmind: [
    'Construí flujos móviles completos con manejo consistente de errores, carga y estados vacíos.',
    'Mejoré la estabilidad mediante análisis, corrección y seguimiento sistemático de fallos.',
    'Implementé persistencia offline con SQLite e integraciones con Spring Boot, Spring Security y Firebase.',
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
