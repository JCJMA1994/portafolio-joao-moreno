interface IndexedPost {
  id: string;
  data: {
    number: number;
    featured: boolean;
  };
}

/** Valida las invariantes editoriales que el esquema de un post aislado no puede comprobar. */
export function assertBlogIndex(posts: IndexedPost[]): void {
  const numbers = posts.map((post) => post.data.number);
  if (new Set(numbers).size !== numbers.length) {
    throw new Error('Cada artículo debe tener un número editorial único.');
  }

  const featuredCount = posts.filter((post) => post.data.featured).length;
  if (featuredCount !== 1) {
    throw new Error('El blog debe declarar exactamente un artículo destacado.');
  }
}
