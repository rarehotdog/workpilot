import * as React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from './utils';
import { Button } from './button';

export type CarouselApi = {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
};

type CarouselContextProps = {
  orientation: 'horizontal' | 'vertical';
  viewportRef: React.MutableRefObject<HTMLDivElement | null>;
  api: CarouselApi;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error('Carousel components must be used within <Carousel>.');
  }
  return context;
}

export function Carousel({
  orientation = 'horizontal',
  setApi,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
  opts?: unknown;
  plugins?: unknown;
}) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const updateScrollState = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (orientation === 'horizontal') {
      setCanScrollPrev(viewport.scrollLeft > 0);
      setCanScrollNext(viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 1);
    } else {
      setCanScrollPrev(viewport.scrollTop > 0);
      setCanScrollNext(viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1);
    }
  }, [orientation]);

  const scrollPrev = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const amount = orientation === 'horizontal' ? viewport.clientWidth : viewport.clientHeight;
    viewport.scrollBy({ left: orientation === 'horizontal' ? -amount : 0, top: orientation === 'vertical' ? -amount : 0, behavior: 'smooth' });
  }, [orientation]);

  const scrollNext = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const amount = orientation === 'horizontal' ? viewport.clientWidth : viewport.clientHeight;
    viewport.scrollBy({ left: orientation === 'horizontal' ? amount : 0, top: orientation === 'vertical' ? amount : 0, behavior: 'smooth' });
  }, [orientation]);

  const api = React.useMemo<CarouselApi>(() => ({
    scrollPrev,
    scrollNext,
    canScrollPrev: () => canScrollPrev,
    canScrollNext: () => canScrollNext,
  }), [scrollPrev, scrollNext, canScrollPrev, canScrollNext]);

  React.useEffect(() => {
    setApi?.(api);
  }, [api, setApi]);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    updateScrollState();
    viewport.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      viewport.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  return (
    <CarouselContext.Provider value={{ orientation, viewportRef, api, canScrollPrev, canScrollNext }}>
      <div data-slot="carousel" className={cn('relative', className)} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { orientation, viewportRef } = useCarousel();

  return (
    <div ref={viewportRef} data-slot="carousel-content" className="overflow-hidden">
      <div
        className={cn('flex', orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col', className)}
        {...props}
      />
    </div>
  );
}

export function CarouselItem({ className, ...props }: React.ComponentProps<'div'>) {
  const { orientation } = useCarousel();

  return (
    <div
      data-slot="carousel-item"
      role="group"
      aria-roledescription="slide"
      className={cn('min-w-0 shrink-0 grow-0 basis-full', orientation === 'horizontal' ? 'pl-4' : 'pt-4', className)}
      {...props}
    />
  );
}

export function CarouselPrevious({ className, variant = 'outline', size = 'icon', ...props }: React.ComponentProps<typeof Button>) {
  const { orientation, api, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn('absolute h-8 w-8 rounded-full', orientation === 'horizontal' ? 'left-2 top-1/2 -translate-y-1/2' : 'left-1/2 top-2 -translate-x-1/2 rotate-90', className)}
      disabled={!canScrollPrev}
      onClick={api.scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

export function CarouselNext({ className, variant = 'outline', size = 'icon', ...props }: React.ComponentProps<typeof Button>) {
  const { orientation, api, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn('absolute h-8 w-8 rounded-full', orientation === 'horizontal' ? 'right-2 top-1/2 -translate-y-1/2' : 'bottom-2 left-1/2 -translate-x-1/2 rotate-90', className)}
      disabled={!canScrollNext}
      onClick={api.scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}
