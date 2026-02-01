import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Post } from '../lib/supabase'
import { Link } from 'react-router-dom'

export function BlogList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setPosts(data || [])
      }
      setLoading(false)
    }

    fetchPosts()
  }, [])

  if (loading) {
    return <div className="loading">loading...</div>
  }

  if (error) {
    return <div className="error">error: {error}</div>
  }

  return (
    <div className="blog-list">
      <header className="site-header">
        <h1>blog</h1>
        <p className="tagline">thoughts on backend, ai, and building things</p>
      </header>

      <main className="posts">
        {posts.length === 0 ? (
          <p className="no-posts">no posts yet</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="post-preview">
              <Link to={`/post/${post.id}`}>
                <h2>{post.title}</h2>
                <time>{formatDate(post.created_at)}</time>
                <p className="excerpt">
                  {post.content.slice(0, 200)}
                  {post.content.length > 200 ? '...' : ''}
                </p>
              </Link>
            </article>
          ))
        )}
      </main>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
