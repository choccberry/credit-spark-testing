import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit, Trash2, ArrowLeft, Shield, Globe } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const PageManagement = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: ''
  });

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (authState.user?.id !== 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access the page management panel.
            </p>
            <Button asChild>
              <Link to="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    const savedPages = localStorage.getItem('customPages');
    if (savedPages) {
      setPages(JSON.parse(savedPages));
    }
  }, []);

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const savePages = (newPages: Page[]) => {
    setPages(newPages);
    localStorage.setItem('customPages', JSON.stringify(newPages));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const pageData: Page = {
      id: editingPage?.id || Date.now().toString(),
      title: formData.title,
      slug: formData.slug || generateSlug(formData.title),
      content: formData.content,
      createdAt: editingPage?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let newPages;
    if (editingPage) {
      newPages = pages.map(page => 
        page.id === editingPage.id ? pageData : page
      );
      toast({
        title: 'Page updated',
        description: 'Your page has been updated successfully.',
      });
    } else {
      newPages = [...pages, pageData];
      toast({
        title: 'Page created',
        description: 'Your page has been created successfully.',
      });
    }

    savePages(newPages);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: ''
    });
    setEditingPage(null);
    setShowForm(false);
  };

  const handleEdit = (page: Page) => {
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content
    });
    setEditingPage(page);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const newPages = pages.filter(page => page.id !== id);
    savePages(newPages);
    toast({
      title: 'Page deleted',
      description: 'Page has been deleted successfully.',
    });
  };

  const predefinedPages = [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms of Service', path: '/terms-of-service' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

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
            <h1 className="text-2xl font-bold">Page Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Page
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingPage ? 'Edit Page' : 'Create New Page'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Page Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL Slug</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="auto-generated from title"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Page Content</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your page content here..."
                    className="min-h-[400px]"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit">
                    {editingPage ? 'Update Page' : 'Create Page'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Predefined Pages</h2>
            <div className="grid grid-cols-1 gap-4">
              {predefinedPages.map((page) => (
                <Card key={page.path}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{page.name}</h3>
                      <p className="text-muted-foreground text-sm">{page.path}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={page.path}>
                          <Globe className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`${page.path}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Content
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Custom Pages</h2>
            <div className="grid grid-cols-1 gap-4">
              {pages.map((page) => (
                <Card key={page.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{page.title}</h3>
                      <p className="text-muted-foreground text-sm">/{page.slug}</p>
                      <p className="text-muted-foreground text-xs">
                        Updated: {new Date(page.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(page)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(page.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {pages.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-xl font-semibold mb-4">No Custom Pages Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create custom pages for additional content on your site.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Page
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default PageManagement;