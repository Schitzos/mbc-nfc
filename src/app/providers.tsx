import React from 'react';

type Props = {
  children: React.ReactNode;
};

export function AppProviders({ children }: Props): React.JSX.Element {
  return <>{children}</>;
}
