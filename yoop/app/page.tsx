import RandomCarousel from "@/components/RandomCarousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="grid items-center gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-accent">
            Находим людей по вашим интересам
          </h1>
          <p className="text-neutral-300">
            Опишите, кого вы ищете, а мы с ML-помощником подберём подходящих.
            Свайпайте карточки, чтобы лайкнуть или пропустить.
          </p>
          <div className="flex gap-3">
            <Button asChild className="bg-primary text-primary-foreground">
              <a href="/find">Найти людей</a>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-border text-foreground hover:bg-secondary"
            >
              <a href="#random">Случайные профили</a>
            </Button>
          </div>
        </div>
        <Card className="aspect-video overflow-hidden">
          <CardContent className="h-full w-full bg-neutral-200" />
        </Card>
      </section>

      <section id="random" className="space-y-4">
        <h2 className="text-2xl font-semibold">Случайные профили</h2>
        <RandomCarousel />
      </section>
    </div>
  );
}
