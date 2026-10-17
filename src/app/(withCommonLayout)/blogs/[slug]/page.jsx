import { redirect } from 'next/navigation';

export default async function BlogSlugRedirect({ params }) {
  const { slug } = await params;
  redirect(`/blog/${slug}`);
}
