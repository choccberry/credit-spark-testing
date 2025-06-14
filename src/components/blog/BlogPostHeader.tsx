import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import { Article } from '@/types';

interface BlogPostHeaderProps {
  article: Article;
}

const BlogPostHeader: React.FC<BlogPostHeaderProps> = ({ article }) => {
  return (
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
  );
};

export default BlogPostHeader;