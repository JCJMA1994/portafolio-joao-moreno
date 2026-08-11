import { describe, expect, it } from 'vitest';
import { cv, cvAvailability } from '@/data/cv';
import { certifications, education, profile, skillGroups } from '@/data/profile';
import { employment } from '@/data/changelog';

describe('datos del CV dirigido', () => {
  it('comparte la identidad canónica del perfil', () => {
    expect(cv.name).toBe(profile.name);
    expect(cv.email).toBe(profile.email);
    expect(cv.phone).toBe(profile.phone);
  });

  it('declara exactamente tres métricas únicas', () => {
    expect(cv.metrics).toHaveLength(3);
    expect(new Set(cv.metrics.map((metric) => metric.value)).size).toBe(3);
    expect(cv.metrics.map((metric) => metric.value)).toEqual(['99.5%', '30+', '10']);
  });

  it('modela explícitamente las tres experiencias seleccionadas', () => {
    expect(cv.experience.map((job) => job.company)).toEqual(['INCLUB', 'Freelance', 'WMIND']);
    expect(cv.experience.map((job) => job.period)).toEqual([
      '2025—actualidad',
      '2024—2025',
      '2023—2024',
    ]);
    cv.experience.forEach((job, index) => {
      expect(job).toMatchObject(employment[index] ?? {});
      expect(job.achievements.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('deriva la disponibilidad del estado canónico', () => {
    expect(cv.availability).toEqual({
      available: true,
      label: profile.availableLabel,
      detail: `Remoto · ${profile.utcOffset} · Español nativo`,
    });
    expect(
      cvAvailability({ available: false, availableLabel: 'Disponible', utcOffset: 'UTC−5' }),
    ).toEqual({
      available: false,
      label: 'No disponible actualmente',
      detail: 'Remoto · UTC−5 · Español nativo',
    });
  });

  it('proyecta formación y habilidades desde el perfil canónico', () => {
    expect(cv.education[0]).toEqual({ title: education[0]?.title, detail: education[0]?.org });
    expect(cv.education.slice(1).map((item) => item.title)).toEqual(
      certifications
        .filter((item) => cv.education.some((entry) => entry.title === item.title))
        .map((item) => item.title),
    );
    expect(cv.stack.map((group) => group.items)).toEqual(skillGroups.map((group) => group.items));
  });
});
