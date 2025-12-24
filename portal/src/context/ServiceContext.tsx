import { createContext, ReactNode, useContext } from 'react';
import { ServiceRegistry, services } from '../services';

const ServiceContext = createContext<ServiceRegistry>(services);

export function ServiceProvider({ children }: { children: ReactNode }) {
  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  return useContext(ServiceContext);
}
