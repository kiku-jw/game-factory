// Game Factory - TemplateShelf Widget
// Browse curated game templates

import React, { useState } from 'react';
import type { TemplateDisplay } from './types.js';

interface TemplateShelfProps {
  // From _meta
  templateDetails: TemplateDisplay[];
  total: number;

  // Callbacks
  onSelectTemplate: (templateId: string) => void;
  onBack: () => void;
}

const GENRE_ICONS: Record<string, string> = {
  'fantasy': '🏰',
  'sci-fi': '🚀',
  'mystery': '🔍',
  'horror-lite': '🌙',
};

const GENRE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'fantasy', label: '🏰 Fantasy' },
  { id: 'sci-fi', label: '🚀 Sci-Fi' },
  { id: 'mystery', label: '🔍 Mystery' },
  { id: 'horror-lite', label: '🌙 Horror' },
];

export function TemplateShelf({
  templateDetails,
  total,
  onSelectTemplate,
  onBack,
}: TemplateShelfProps) {
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const filteredTemplates = filter === 'all'
    ? templateDetails
    : templateDetails.filter(t => t.genre === filter);

  const featuredTemplates = filteredTemplates.filter(t => t.featured);
  const otherTemplates = filteredTemplates.filter(t => !t.featured);

  const handleSelectTemplate = async (templateId: string) => {
    setLoading(true);
    try {
      await onSelectTemplate(templateId);
    } finally {
      setLoading(false);
    }
  };

  const TemplateCard = ({ template }: { template: TemplateDisplay }) => (
    <button
      onClick={() => handleSelectTemplate(template.id)}
      disabled={loading}
      className="bg-surface-secondary hover:bg-surface-tertiary border border-default rounded-lg p-3 text-left transition-colors disabled:opacity-50"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{GENRE_ICONS[template.genre] || '🎮'}</span>
          <span className="font-medium">{template.name}</span>
        </div>
        {template.featured && (
          <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded">
            ⭐ Featured
          </span>
        )}
      </div>

      <p className="text-sm text-secondary mb-2 line-clamp-2">
        {template.description}
      </p>

      <div className="flex items-center gap-2 text-xs text-secondary">
        <span className="capitalize">{template.difficulty}</span>
        <span>•</span>
        <span>{template.atmosphere}</span>
      </div>

      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {template.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-surface rounded text-xs text-secondary">
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );

  return (
    <div className="bg-surface border border-default rounded-lg overflow-hidden max-w-2xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-default">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">📚 Template Shelf</h2>
            <p className="text-sm text-secondary">{total} adventures available</p>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1 text-sm text-secondary hover:text-primary"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Genre Filters */}
      <div className="px-4 py-2 border-b border-default overflow-x-auto">
        <div className="flex gap-2">
          {GENRE_FILTERS.map(g => (
            <button
              key={g.id}
              onClick={() => setFilter(g.id)}
              className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
                filter === g.id
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary hover:bg-surface-tertiary'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 max-h-96 overflow-y-auto">
        {/* Featured Section */}
        {featuredTemplates.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-secondary mb-2">⭐ Staff Picks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featuredTemplates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        )}

        {/* Other Templates */}
        {otherTemplates.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-secondary mb-2">More Adventures</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {otherTemplates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-secondary">
            No templates found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateShelf;
