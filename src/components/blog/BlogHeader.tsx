import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus } from 'lucide-react';

interface BlogHeaderProps {
  publishedCount: number;
  onCreateNew: () => void;
}

const BlogHeader: React.FC<BlogHeaderProps> = ({ publishedCount, onCreateNew }) => {
  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Blog Management</h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="default">
            {publishedCount} Published Articles
          </Badge>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </div>
      </div>
    </header>
  );
};

export default BlogHeader;