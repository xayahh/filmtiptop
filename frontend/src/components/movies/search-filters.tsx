'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, Star, TrendingUp, Heart } from 'lucide-react';

export type SortOption = 'default' | 'rating' | 'popularity' | 'favorites';

interface SearchFiltersProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  showFavoritesFilter: boolean;
}

export function SearchFilters({ sortBy, onSortChange, showFavoritesFilter }: SearchFiltersProps) {
  const sortLabels: Record<SortOption, { label: string; icon: React.ReactNode }> = {
    default: { label: 'Default', icon: <ArrowUpDown className="h-4 w-4" /> },
    rating: { label: 'IMDb Rating', icon: <Star className="h-4 w-4" /> },
    popularity: { label: 'Popularity', icon: <TrendingUp className="h-4 w-4" /> },
    favorites: { label: 'My Favorites First', icon: <Heart className="h-4 w-4" /> },
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {sortLabels[sortBy].icon}
            <span className="ml-2">Sort: {sortLabels[sortBy].label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
            <DropdownMenuRadioItem value="default">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Default
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="rating">
              <Star className="h-4 w-4 mr-2" />
              IMDb Rating (High to Low)
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="popularity">
              <TrendingUp className="h-4 w-4 mr-2" />
              Popularity (Most Votes)
            </DropdownMenuRadioItem>
            {showFavoritesFilter && (
              <DropdownMenuRadioItem value="favorites">
                <Heart className="h-4 w-4 mr-2" />
                My Favorites First
              </DropdownMenuRadioItem>
            )}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
