
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Users, BookOpen, Globe, Settings } from 'lucide-react';

const AdminHeader = () => {
  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link to="/admin/users">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/blog">
              <BookOpen className="h-4 w-4 mr-2" />
              Blog Management
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/pages">
              <Globe className="h-4 w-4 mr-2" />
              Page Management
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/adsense">
              <Settings className="h-4 w-4 mr-2" />
              AdSense Settings
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
