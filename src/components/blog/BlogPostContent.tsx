import React from 'react';
import { Article } from '@/types';

interface BlogPostContentProps {
  article: Article;
}

const BlogPostContent: React.FC<BlogPostContentProps> = ({ article }) => {
  const renderContent = () => {
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
          // Format text with bold/italic support
          const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
          listItems.push(
            <li key={index} value={parseInt(number)} dangerouslySetInnerHTML={{ __html: formattedText }} />
          );
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
  };

  return (
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
        {renderContent()}
      </div>
    </article>
  );
};

export default BlogPostContent;