import React from 'react';
import { Alert, AlertDescription } from './alert';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary - Componente reutilizável para capturar erros em componentes filhos
 * 
 * @example
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * @example Com fallback customizado
 * <ErrorBoundary fallback={<div>Erro personalizado</div>}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log do erro (pode ser enviado para um serviço de monitoramento)
    console.error('ErrorBoundary capturou um erro:', error, info);
    
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      // Renderiza fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Fallback padrão
      return (
        <Alert variant="destructive" className="m-4">
          <AlertDescription>
            Ocorreu um erro ao carregar este componente. Por favor, tente novamente.
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
