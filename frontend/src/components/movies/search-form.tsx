'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';

interface SearchFormProps {
  onSearch: (title: string, year?: string) => void;
  onClear?: () => void;
  isLoading: boolean;
  initialTitle?: string;
  initialYear?: string;
}

const quickSearches = ['Matrix', 'Star Wars', 'Inception', 'Avengers', 'Batman'];

export function SearchForm({ onSearch, onClear, isLoading, initialTitle = '', initialYear = '' }: SearchFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [year, setYear] = useState(initialYear);

  useEffect(() => {
    setTitle(initialTitle);
    setYear(initialYear);
  }, [initialTitle, initialYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSearch(title.trim(), year.trim() || undefined);
    }
  };

  const handleClear = () => {
    setTitle('');
    setYear('');
    onClear?.();
  };

  const handleQuickSearch = (query: string) => {
    setTitle(query);
    onSearch(query);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="title">Movie Title</Label>
            <Input
              id="title"
              placeholder="Search for movies..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="w-full sm:w-32 space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              placeholder="e.g. 2023"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading || !title.trim()}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          {(title || year) && (
            <Button type="button" variant="outline" onClick={handleClear}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </form>
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">Quick search:</span>
        {quickSearches.map((query) => (
          <Badge
            key={query}
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80"
            onClick={() => handleQuickSearch(query)}
          >
            {query}
          </Badge>
        ))}
      </div>
    </div>
  );
}
