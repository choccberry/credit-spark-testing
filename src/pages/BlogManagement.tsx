import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Article } from '@/types';
import ArticleForm from '@/components/blog/ArticleForm';
import ArticleList from '@/components/blog/ArticleList';
import BlogHeader from '@/components/blog/BlogHeader';
import AccessDenied from '@/components/blog/AccessDenied';

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

const BlogManagement = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    author: authState.user?.email || 'Admin',
    readTime: 5,
    status: 'draft',
    imageUrl: ''
  });

  if (!authState.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (authState.user) {
      checkAdminRole();
    }
  }, [authState.user]);

  const checkAdminRole = async () => {
    if (!authState.user) return;
    
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: authState.user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data || false);
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDenied />;
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
      publishedAt: formData.status === 'published' ? new Date().toISOString() : undefined,
      imageUrl: formData.imageUrl || undefined
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
      author: authState.user?.email || 'Admin',
      readTime: 5,
      status: 'draft',
      imageUrl: ''
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
      status: article.status,
      imageUrl: article.imageUrl || ''
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

  const handleCreateNew = () => {
    setShowForm(true);
  };

  const publishedCount = articles.filter(a => a.status === 'published').length;

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader publishedCount={publishedCount} onCreateNew={handleCreateNew} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {showForm && (
          <ArticleForm
            formData={formData}
            setFormData={setFormData}
            editingArticle={editingArticle}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        )}

        <ArticleList
          articles={articles}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateNew={handleCreateNew}
        />
      </main>
    </div>
  );
};

export default BlogManagement;
