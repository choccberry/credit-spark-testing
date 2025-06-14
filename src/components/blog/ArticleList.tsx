import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';
import { Article } from '@/types';

interface ArticleListProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
}

const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  onEdit,
  onDelete,
  onCreateNew
}) => {
  if (articles.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-xl font-semibold mb-4">No Articles Yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first article to start building content for AdSense approval.
          </p>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Article
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {articles.map((article) => (
        <Card key={article.id}>
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h3 className="text-lg font-semibold">{article.title}</h3>
                <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                  {article.status}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mb-2">{article.excerpt}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>By {article.author}</span>
                <span>{article.readTime} min read</span>
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {article.status === 'published' && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/blog/${article.slug}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => onEdit(article)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(article.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ArticleList;