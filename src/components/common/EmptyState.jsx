import React from 'react';
import { Heart } from 'lucide-react';

export function EmptyState({
  title = "No profiles found",
  description = "Try adjusting your search filters or broadening your age, location, and community criteria.",
  icon: CustomIcon,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction
}) {
  const IconComponent = CustomIcon || Heart;

  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        backgroundColor: '#FFFFFF',
        borderRadius: '1.25rem',
        border: '1px solid var(--border-light)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        maxWidth: '580px',
        margin: '2rem auto'
      }}
    >
      {/* Icon with ambient halo */}
      <div
        style={{
          position: 'relative',
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(144, 27, 44, 0.08) 0%, rgba(201, 154, 58, 0.15) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(144, 27, 44, 0.08)',
          border: '1px solid rgba(201, 154, 58, 0.25)'
        }}
      >
        <IconComponent size={36} className="text-burgundy" style={{ color: 'var(--primary-700, #901B2C)' }} />
      </div>


      <div style={{ maxWidth: '440px' }}>
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary, #29252A)',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-heading, serif)'
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '0.925rem',
            color: 'var(--text-muted, #6B6368)',
            lineHeight: 1.6,
            margin: 0
          }}
        >
          {description}
        </p>
      </div>

      {/* Action buttons */}
      {(actionText || secondaryActionText) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {actionText && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="btn btn-primary btn-sm"
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: 'var(--radius-full, 9999px)',
                fontWeight: 600
              }}
            >
              {actionText}
            </button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: 'var(--radius-full, 9999px)',
                fontWeight: 600
              }}
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;

