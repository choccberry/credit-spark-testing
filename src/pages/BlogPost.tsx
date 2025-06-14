import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import AdSenseAd from '@/components/AdSenseAd';
import { Article } from '@/types';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedArticles = localStorage.getItem('blogArticles');
    if (savedArticles) {
      const articles: Article[] = JSON.parse(savedArticles);
      const foundArticle = articles.find(
        a => a.slug === slug && a.status === 'published'
      );
      setArticle(foundArticle || null);
    }
    setLoading(false);
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">{article.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{article.readTime} min read</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <article className="lg:col-span-3 prose prose-gray dark:prose-invert max-w-none">
            {article.imageUrl && (
              <div className="mb-8">
                <img 
                  src={article.imageUrl.startsWith('photo-') 
                    ? `https://images.unsplash.com/${article.imageUrl}?w=800&h=400&fit=crop&auto=format`
                    : article.imageUrl
                  }
                  alt={article.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            <div className="text-xl text-muted-foreground mb-8">
              {article.excerpt}
            </div>
            <div className="space-y-6 whitespace-pre-wrap leading-relaxed">
              {article.content.split('\n').map((paragraph, index) => (
                paragraph.trim() ? (
                  <p key={index} className="mb-4">
                    {paragraph.trim()}
                  </p>
                ) : (
                  <br key={index} />
                )
              ))}
            </div>
          </article>

          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <AdSenseAd adType="sidebar" />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BlogPost;