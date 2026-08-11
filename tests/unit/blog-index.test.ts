import { describe, expect, it } from 'vitest';
import { assertBlogIndex } from '@/lib/blog-index';

describe('índice editorial del blog', () => {
  const posts = [
    { id: 'uno', data: { number: 41, featured: false } },
    { id: 'dos', data: { number: 42, featured: true } },
  ];

  it('acepta números únicos y exactamente un destacado', () => {
    expect(assertBlogIndex(posts)).toBeUndefined();
  });

  it('rechaza números repetidos', () => {
    expect(() =>
      assertBlogIndex([...posts, { id: 'tres', data: { number: 41, featured: false } }]),
    ).toThrow(/número/i);
  });

  it('requiere exactamente un artículo destacado', () => {
    expect(() =>
      assertBlogIndex(posts.map((post) => ({ ...post, data: { ...post.data, featured: false } }))),
    ).toThrow(/destacado/i);
  });
});
