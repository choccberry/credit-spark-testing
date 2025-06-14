import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { Article } from '@/types';

const Blog = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const savedArticles = localStorage.getItem('blogArticles');
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    }
  }, []);

  const publishedArticles = articles.filter(article => article.status === 'published');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Publicdiscus Ad Exchange Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Insights, tips, and updates about digital advertising and credit-based marketing
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {publishedArticles.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <h3 className="text-xl font-semibold mb-4">No Articles Yet</h3>
              <p className="text-muted-foreground mb-6">
                Check back soon for valuable insights about digital advertising and marketing strategies.
              </p>
              <Button asChild>
                <Link to="/">Return to Home</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedArticles.map((article) => (
              <Card key={article.id} className="h-fit">
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <Clock className="h-4 w-4" />
                    <span>{article.readTime} min read</span>
                  </div>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{article.author}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground line-clamp-3">{article.excerpt}</p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild className="w-full">
                    <Link to={`/blog/${article.slug}`}>
                      Read More
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;