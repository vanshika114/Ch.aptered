/* This file defines a highly reusable compound Card component system with consistent layout, focus states, and styling. */
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement | HTMLAnchorElement | HTMLButtonElement> {
  href?: string;
  onClick?: React.MouseEventHandler;
  className?: string;
}

export const CardRoot: React.FC<CardProps> = ({
  href,
  onClick,
  className = '',
  children,
  ...props
}) => {
  const isInteractive = !!(href || onClick);
  
  const baseClasses = `
    bg-card border border-border rounded-[14px] overflow-hidden shadow-[0_4px_24px_rgba(26,18,8,0.08)] 
    transition-all duration-200 text-left flex flex-col
  `;
  
  const hoverClasses = isInteractive 
    ? 'hover:-translate-y-1.5 hover:shadow-[0_12px_48px_rgba(26,18,8,0.14)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber' 
    : '';

  const classes = `${baseClasses} ${hoverClasses} ${className}`.trim().replace(/\s+/g, ' ');

  if (href) {
    return (
      <a 
        href={href} 
        className={classes} 
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>} 
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  if (onClick) {
    return (
      <button 
        type="button" 
        className={classes} 
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>} 
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  className = '',
  ...props
}) => {
  return (
    <div className={`p-4 pb-2 ${className}`} {...props}>
      <h3 className="font-serif text-base font-bold text-ink-soft leading-snug">{title}</h3>
      {subtitle && <p className="text-muted text-[11px] font-semibold mt-0.5">{subtitle}</p>}
    </div>
  );
};

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`p-4 pt-1 flex-1 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`p-4 pt-2 border-t border-border/40 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: string;
  fallbackText?: string;
  bgColor?: string;
}

export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt = '',
  aspectRatio = 'aspect-[2/3]',
  fallbackText,
  bgColor,
  className = '',
  ...props
}) => {
  const style = bgColor ? { background: `linear-gradient(145deg, ${bgColor} 0%, ${bgColor}bb 100%)` } : undefined;

  return (
    <div className={`w-full ${aspectRatio} relative overflow-hidden flex items-end ${bgColor ? '' : 'bg-warm-deep/30'} ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" {...props} />
      ) : (
        <div style={style} className="w-full h-full flex flex-col justify-end p-4 z-10 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span className="font-serif text-sm font-bold text-white/95 leading-snug relative z-10 break-words">
            {fallbackText || alt}
          </span>
        </div>
      )}
    </div>
  );
};

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Image: CardImage,
});
