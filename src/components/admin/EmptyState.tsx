
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

const EmptyState = () => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <Check className="h-16 w-16 mx-auto mb-4 text-green-500" />
        <h3 className="text-xl font-semibold mb-4">All Caught Up!</h3>
        <p className="text-muted-foreground">
          There are no campaigns pending approval at this time.
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
