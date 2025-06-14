import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Article } from '@/types';
import { Plus, Edit, Trash2, ArrowLeft, Eye } from 'lucide-react';

const BlogManagement = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    author: authState.user?.username || 'Admin',
    readTime: 5,
    status: 'draft' as 'draft' | 'published'
  });

  if (!authState.isAuthenticated || authState.user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const savedArticles = localStorage.getItem('blogArticles');
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    }
  }, []);

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const saveArticles = (newArticles: Article[]) => {
    setArticles(newArticles);
    localStorage.setItem('blogArticles', JSON.stringify(newArticles));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const articleData: Article = {
      id: editingArticle?.id || Date.now().toString(),
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      author: formData.author,
      readTime: formData.readTime,
      status: formData.status,
      slug: editingArticle?.slug || generateSlug(formData.title),
      createdAt: editingArticle?.createdAt || new Date().toISOString(),
      publishedAt: formData.status === 'published' ? new Date().toISOString() : undefined
    };

    let newArticles;
    if (editingArticle) {
      newArticles = articles.map(article => 
        article.id === editingArticle.id ? articleData : article
      );
      toast({
        title: 'Article updated',
        description: 'Your article has been updated successfully.',
      });
    } else {
      newArticles = [...articles, articleData];
      toast({
        title: 'Article created',
        description: 'Your article has been created successfully.',
      });
    }

    saveArticles(newArticles);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      tags: '',
      author: authState.user?.username || 'Admin',
      readTime: 5,
      status: 'draft'
    });
    setEditingArticle(null);
    setShowForm(false);
  };

  const handleEdit = (article: Article) => {
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      tags: article.tags.join(', '),
      author: article.author,
      readTime: article.readTime,
      status: article.status
    });
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const newArticles = articles.filter(article => article.id !== id);
    saveArticles(newArticles);
    toast({
      title: 'Article deleted',
      description: 'Article has been deleted successfully.',
    });
  };

  const publishedCount = articles.filter(a => a.status === 'published').length;

  return (
    <div className="min-h-screen bg-background">
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
            <Badge variant={publishedCount >= 30 ? "default" : "secondary"}>
              {publishedCount}/30 Published Articles
            </Badge>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingArticle ? 'Edit Article' : 'Create New Article'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Write your article content here..."
                    className="min-h-[300px]"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit">
                    {editingArticle ? 'Update Article' : 'Create Article'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

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
                  <Button variant="outline" size="sm" onClick={() => handleEdit(article)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(article.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {articles.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-xl font-semibold mb-4">No Articles Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first article to start building content for AdSense approval.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Article
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default BlogManagement;