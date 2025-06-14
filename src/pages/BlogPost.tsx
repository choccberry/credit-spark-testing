import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Article } from '@/types';
import BlogPostHeader from '@/components/blog/BlogPostHeader';
import BlogPostContent from '@/components/blog/BlogPostContent';
import BlogPostSidebar from '@/components/blog/BlogPostSidebar';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedArticles = localStorage.getItem('blogArticles');
      if (savedArticles) {
        const articles: Article[] = JSON.parse(savedArticles);
        const foundArticle = articles.find(
          a => a.slug === slug && a.status === 'published'
        );
        setArticle(foundArticle || null);
      }
    } catch (error) {
      console.error('Error loading article:', error);
      setArticle(null);
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
      <BlogPostHeader article={article} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <BlogPostContent article={article} />
          <BlogPostSidebar />
        </div>
      </main>
    </div>
  );
};

export default BlogPost;