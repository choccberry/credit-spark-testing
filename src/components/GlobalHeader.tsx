
import React from 'react';
import { Globe } from 'lucide-react';
import CountrySelector from './CountrySelector';
import { useCountryData } from '@/hooks/useCountryData';

interface GlobalHeaderProps {
  showCountrySelector?: boolean;
  className?: string;
}

const GlobalHeader = ({ showCountrySelector = true, className }: GlobalHeaderProps) => {
  const { userCountry } = useCountryData();

  return (
    <div className={`border-b border-border bg-card/50 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Globe className="h-4 w-4" />
          <span>Global Ad Exchange</span>
          {userCountry && (
            <span className="text-primary font-medium">
              • {userCountry.name}
            </span>
          )}
        </div>
        {showCountrySelector && (
          <CountrySelector 
            showLabel={false} 
            className="w-48"
          />
        )}
      </div>
    </div>
  );
};

export default GlobalHeader;
