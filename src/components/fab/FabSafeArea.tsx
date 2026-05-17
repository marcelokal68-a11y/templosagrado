import { forwardRef, type ElementType, type HTMLAttributes } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FAB_SAFE_PADDING, isFabRoute } from './fabConfig';

type FabSafeAreaProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  /** Força o padding mesmo fora das rotas registradas. */
  force?: boolean;
};

/**
 * Wrapper que aplica automaticamente o padding-bottom de segurança
 * do FAB quando a rota atual exibe o botão "Voltar ao Chat".
 *
 * Uso:
 *   <FabSafeArea className="flex-1 container max-w-2xl px-4 pt-6">
 *     ...conteúdo...
 *   </FabSafeArea>
 *
 * Em vez de hardcodar `pb-40 md:pb-24` em cada página.
 */
const FabSafeArea = forwardRef<HTMLElement, FabSafeAreaProps>(
  ({ as: Tag = 'div', className, force, children, ...rest }, ref) => {
    const { pathname } = useLocation();
    const shouldPad = force || isFabRoute(pathname);

    return (
      <Tag
        ref={ref as never}
        className={cn(shouldPad && FAB_SAFE_PADDING, className)}
        {...rest}
      >
        {children}
      </Tag>
    );
  }
);

FabSafeArea.displayName = 'FabSafeArea';

export default FabSafeArea;
