import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Article } from '@/types';

interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  tags: string;
  author: string;
  readTime: number;
  status: 'draft' | 'published';
  imageUrl: string;
}

interface ArticleFormProps {
  formData: ArticleFormData;
  setFormData: (data: ArticleFormData) => void;
  editingArticle: Article | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  formData,
  setFormData,
  editingArticle,
  onSubmit,
  onCancel
}) => {
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
    
    // Convert HTML to markdown-style formatting
    let formattedText = pastedText
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
        const items = content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
        return '\n' + items + '\n';
      })
      .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
        let counter = 1;
        const items = content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`);
        return '\n' + items + '\n';
      })
      .replace(/&rsquo;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
      // Clean up bold formatting in headings
      .replace(/###\s*\*\*(.*?)\*\*/g, '### $1')
      .replace(/####\s*\*\*(.*?)\*\*/g, '#### $1')
      .replace(/##\s*\*\*(.*?)\*\*/g, '## $1')
      .replace(/#\s*\*\*(.*?)\*\*/g, '# $1')
      // Fix spacing around headings - ensure proper breaks
      .replace(/([a-z.,!?])\s*(#{1,6})\s*([A-Z])/g, '$1\n\n$2 $3')
      // Normalize whitespace but preserve structure
      .replace(/[ \t]+/g, ' ') // Multiple spaces/tabs to single space
      .replace(/\n[ \t]+/g, '\n') // Remove spaces after newlines
      .replace(/[ \t]+\n/g, '\n') // Remove spaces before newlines
      .replace(/\n{3,}/g, '\n\n') // Limit to max 2 newlines
      // Fix list spacing - ensure lists have proper breaks but not excessive
      .replace(/\n\n-/g, '\n\n-') // Keep double newline before lists
      .replace(/\n\n(\d+\.)/g, '\n\n$1') // Keep double newline before numbered lists
      .trim();

    const currentContent = formData.content;
    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newContent = currentContent.substring(0, start) + formattedText + currentContent.substring(end);
    setFormData({ ...formData, content: newContent });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>
          {editingArticle ? 'Edit Article' : 'Create New Article'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Author</label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Read Time (minutes)</label>
              <Input
                type="number"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={formData.status} onValueChange={(value: 'draft' | 'published') => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Excerpt</label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Brief description of the article..."
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Featured Image URL (Optional)</label>
            <Input
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg or photo-1649972904349-6e44c42644a7"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use placeholder IDs like: photo-1649972904349-6e44c42644a7, photo-1488590528505-98d2b5aba04b
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Tags (comma-separated)</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="advertising, marketing, tips"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              onPaste={handlePaste}
              placeholder="Write your article content here. You can paste rich text and it will be converted to proper formatting."
              className="min-h-[300px]"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supports: # Headings, **bold**, *italic*, - bullet lists, 1. numbered lists
            </p>
          </div>

          <div className="flex gap-4">
            <Button type="submit">
              {editingArticle ? 'Update Article' : 'Create Article'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ArticleForm;