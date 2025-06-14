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
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {(() => {
                const lines = article.content.split('\n');
                const elements: JSX.Element[] = [];
                let listItems: JSX.Element[] = [];
                let listType: 'ul' | 'ol' | null = null;
                
                const flushList = () => {
                  if (listItems.length > 0) {
                    if (listType === 'ul') {
                      elements.push(<ul key={`list-${elements.length}`} className="list-disc ml-6 space-y-2 mb-4">{listItems}</ul>);
                    } else if (listType === 'ol') {
                      elements.push(<ol key={`list-${elements.length}`} className="list-decimal ml-6 space-y-2 mb-4">{listItems}</ol>);
                    }
                    listItems = [];
                    listType = null;
                  }
                };
                
                lines.forEach((line, index) => {
                  const trimmedLine = line.trim();
                  
                  if (!trimmedLine) {
                    flushList();
                    elements.push(<br key={index} />);
                    return;
                  }
                  
                  // Handle headings - check for multiple heading levels
                  if (trimmedLine.startsWith('#### ')) {
                    flushList();
                    elements.push(<h4 key={index} className="text-lg font-semibold mt-6 mb-3">{trimmedLine.slice(5)}</h4>);
                    return;
                  }
                  if (trimmedLine.startsWith('### ')) {
                    flushList();
                    elements.push(<h3 key={index} className="text-xl font-semibold mt-8 mb-4">{trimmedLine.slice(4)}</h3>);
                    return;
                  }
                  if (trimmedLine.startsWith('## ')) {
                    flushList();
                    elements.push(<h2 key={index} className="text-2xl font-bold mt-8 mb-4">{trimmedLine.slice(3)}</h2>);
                    return;
                  }
                  if (trimmedLine.startsWith('# ')) {
                    flushList();
                    elements.push(<h1 key={index} className="text-3xl font-bold mt-8 mb-4">{trimmedLine.slice(2)}</h1>);
                    return;
                  }
                  
                  // Handle unordered lists
                  if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                    if (listType !== 'ul') {
                      flushList();
                      listType = 'ul';
                    }
                    listItems.push(<li key={index}>{trimmedLine.slice(2)}</li>);
                    return;
                  }
                  
                  // Handle ordered lists - preserve original numbering
                  if (/^\d+\.\s/.test(trimmedLine)) {
                    if (listType !== 'ol') {
                      flushList();
                      listType = 'ol';
                    }
                    const match = trimmedLine.match(/^(\d+)\.\s(.*)$/);
                    if (match) {
                      const number = match[1];
                      const text = match[2];
                      listItems.push(<li key={index} value={parseInt(number)}>{text}</li>);
                    }
                    return;
                  }
                  
                  // Regular paragraphs (flush lists first)
                  flushList();
                  
                  // Handle bold and italic text
                  let formattedText = trimmedLine
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>');
                  
                  elements.push(
                    <p 
                      key={index} 
                      className="mb-4 leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: formattedText }}
                    />
                  );
                });
                
                // Flush any remaining list items
                flushList();
                
                return elements;
              })()}
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