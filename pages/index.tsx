import React from 'react';
import { getPosts } from '@/utils/supabase-client';

// @ts-ignore
export default function Home({ posts }) {
  console.log(posts);
  return (
    <div>
      <p>Posts from Supabase: {posts.length}</p>
    </div>
  );
}

export async function getStaticProps() {
  const posts = await getPosts();

  return {
    props: {
      posts,
    },
  };
}
