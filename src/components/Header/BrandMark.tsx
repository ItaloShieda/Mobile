import React from 'react';
import { BrandLogo } from '../brand/BrandLogo';

/** Logo "Stock4event" para cabeçalhos com fundo escuro. */
export function BrandMark({ size = 20 }: { size?: number }) {
  return <BrandLogo variant="branco" height={Math.round(size * 1.6)} />;
}
