import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Post } from '../lib/supabase'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function BlogPost() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPost() {
      if (!id) return

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', parseInt(id))
        .single()

      if (error) {
        setError(error.message)
      } else {
        setPost(data)
      }
      setLoading(false)
    }

    fetchPost()
  }, [id])

  if (loading) {
    return <div className="loading">loading...</div>
  }

  if (error || !post) {
    return (
      <div className="error">
        <p>post not found</p>
        <Link to="/" className="back-link">← back to posts</Link>
      </div>
    )
  }

  return (
    <article className="blog-post">
      <Link to="/" className="back-link">← back to posts</Link>
      
      <header className="post-header">
        <h1>{post.title}</h1>
        <time>{formatDate(post.created_at)}</time>
      </header>

      <div className="post-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ src, alt }) => (
              <figure className="content-image">
                <img src={src} alt={alt || ''} loading="lazy" />
                {alt && <figcaption>{alt}</figcaption>}
              </figure>
            ),
            a: ({ href, children }) => {
              // Check if it's a mermaid diagram link
              if (href?.includes('mermaid.ink/svg/') || href?.includes('mermaid.ink/img/')) {
                return (
                  <figure className="mermaid-diagram">
                    <img src={href} alt={String(children) || 'Diagram'} loading="lazy" />
                  </figure>
                )
              }
              return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
            },
            code: ({ className, children, ...props }) => {
              const isInline = !className
              if (isInline) {
                return <code className="inline-code" {...props}>{children}</code>
              }
              return (
                <pre className="code-block">
                  <code className={className} {...props}>{children}</code>
                </pre>
              )
            },
            h1: ({ children }) => <h2 className="content-h1">{children}</h2>,
            h2: ({ children }) => <h3 className="content-h2">{children}</h3>,
            h3: ({ children }) => <h4 className="content-h3">{children}</h4>,
            blockquote: ({ children }) => <blockquote className="content-quote">{children}</blockquote>,
            ul: ({ children }) => <ul className="content-list">{children}</ul>,
            ol: ({ children }) => <ol className="content-list ordered">{children}</ol>,
          }}
        >
          {cleanContent(post.content)}
        </ReactMarkdown>
      </div>

      {post.audio_url && (
        <div className="audio-section">
          <h3>listen</h3>
          <audio controls src={post.audio_url}>
            your browser does not support the audio element.
          </audio>
        </div>
      )}
    </article>
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

function cleanContent(content: string): string {
  let cleaned = content

  // Remove JSON/Python-like metadata blocks anywhere in text
  // Pattern: [{'type': 'text', 'text': '...URL...', 'id': '...'}]
  cleaned = cleaned.replace(/\[\{['"]type['"]:\s*['"]text['"],\s*['"]text['"]:\s*['"][^'"]*['"],\s*['"]id['"]:\s*['"][^'"]*['"]\}\]/g, '')
  
  // More aggressive: remove any line that starts with [{'type': and ends with }]
  cleaned = cleaned.replace(/^.*\[\{.*type.*text.*id.*\}\].*$/gm, '')
  
  // Remove "I have written the blog" line at the end
  cleaned = cleaned.replace(/\n*I have written the blog\.?\s*$/i, '')
  
  return cleaned.trim()
}
