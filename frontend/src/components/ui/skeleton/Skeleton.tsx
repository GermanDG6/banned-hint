import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  const skeletonClass = className ? `${styles.root} ${className}` : styles.root;

  return <div aria-hidden="true" className={skeletonClass} style={style} />;
}

