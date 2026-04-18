import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BookOpen, Sparkles, X } from 'lucide-react';

type Term = {
  hebrew: string;
  script: string;
  pt: string;
  en: string;
  es: string;
  emoji: string;
};

const TERMS: Term[] = [
  {
    hebrew: 'Torá',
    script: 'תּוֹרָה',
    emoji: '📜',
    pt: 'Os cinco livros de Moisés (Pentateuco) — fundamento da fé judaica. "Ensinamento" ou "instrução". Lida semanalmente em sinagogas, contém 613 mitsvot (mandamentos).',
    en: 'The Five Books of Moses (Pentateuch) — foundation of Jewish faith. Means "teaching" or "instruction". Read weekly in synagogues, contains 613 mitzvot (commandments).',
    es: 'Los cinco libros de Moisés (Pentateuco) — fundamento de la fe judía. Significa "enseñanza" o "instrucción". Se lee semanalmente en sinagogas, contiene 613 mitzvot (mandamientos).',
  },
  {
    hebrew: 'Talmud',
    script: 'תַּלְמוּד',
    emoji: '📚',
    pt: 'A Lei Oral compilada — vasto comentário rabínico sobre a Torá. Composto pela Mishná (200 EC) e Guemará (500 EC). Base da jurisprudência (Halachá) e do pensamento judaico.',
    en: 'The compiled Oral Law — vast rabbinic commentary on the Torah. Composed of Mishnah (200 CE) and Gemara (500 CE). Foundation of Jewish jurisprudence (Halakha) and thought.',
    es: 'La Ley Oral compilada — vasto comentario rabínico sobre la Torá. Compuesto por Mishná (200 EC) y Guemará (500 EC). Base de la jurisprudencia (Halajá) y pensamiento judío.',
  },
  {
    hebrew: 'Mitsvá',
    script: 'מִצְוָה',
    emoji: '✨',
    pt: 'Mandamento divino ou boa ação. Há 613 mitsvot na Torá (248 positivas, 365 negativas). Cumprir uma mitsvá é santificar o cotidiano e aproximar-se de D-us.',
    en: 'Divine commandment or good deed. There are 613 mitzvot in the Torah (248 positive, 365 negative). Fulfilling a mitzvah sanctifies daily life and brings one closer to G-d.',
    es: 'Mandamiento divino o buena acción. Hay 613 mitzvot en la Torá (248 positivas, 365 negativas). Cumplir una mitzvá santifica lo cotidiano y acerca a D-os.',
  },
  {
    hebrew: 'Tikun Olam',
    script: 'תִּקּוּן עוֹלָם',
    emoji: '🌍',
    pt: '"Reparo do mundo". Conceito central: cada ato ético contribui para consertar o mundo quebrado. Inspira justiça social, ecologia e responsabilidade humana coletiva.',
    en: '"Repair of the world". Central concept: each ethical act contributes to mending the broken world. Inspires social justice, ecology, and collective human responsibility.',
    es: '"Reparación del mundo". Concepto central: cada acto ético contribuye a reparar el mundo roto. Inspira justicia social, ecología y responsabilidad humana colectiva.',
  },
  {
    hebrew: 'Shabat',
    script: 'שַׁבָּת',
    emoji: '🕯️',
    pt: 'O dia sagrado de descanso, do pôr do sol de sexta ao sábado à noite. Imitação do descanso divino na Criação. Acende-se velas, recita Kidush, evita-se trabalho criativo (39 melachot).',
    en: 'The sacred day of rest, from Friday sunset to Saturday night. Imitation of divine rest in Creation. Candles are lit, Kiddush recited, creative work (39 melakhot) avoided.',
    es: 'El día sagrado de descanso, del atardecer del viernes a la noche del sábado. Imitación del descanso divino en la Creación. Se encienden velas, se recita Kidush, se evita trabajo creativo (39 melajot).',
  },
  {
    hebrew: 'Kashrut',
    script: 'כַּשְׁרוּת',
    emoji: '🍇',
    pt: 'Leis dietéticas judaicas. Define o que é "kasher" (apto): separação de carne e leite, animais permitidos (sem porco/marisco), abate ritual (shechitá). Disciplina que santifica o ato de comer.',
    en: 'Jewish dietary laws. Defines what is "kosher" (fit): separation of meat and dairy, permitted animals (no pork/shellfish), ritual slaughter (shechita). A discipline that sanctifies eating.',
    es: 'Leyes dietéticas judías. Define lo "kasher" (apto): separación de carne y leche, animales permitidos (sin cerdo/mariscos), sacrificio ritual (shejitá). Disciplina que santifica el comer.',
  },
  {
    hebrew: 'Tzedaká',
    script: 'צְדָקָה',
    emoji: '🤲',
    pt: 'Justiça social através da caridade. Não é "esmola" — é dever (da raiz "tzedek", justiça). Maimônides definiu 8 níveis, sendo o mais alto ajudar alguém a se sustentar sozinho.',
    en: 'Social justice through charity. Not "alms" — it is duty (from root "tzedek", justice). Maimonides defined 8 levels, the highest being helping someone become self-sufficient.',
    es: 'Justicia social a través de la caridad. No es "limosna" — es deber (de la raíz "tzedek", justicia). Maimónides definió 8 niveles, siendo el más alto ayudar a alguien a sostenerse solo.',
  },
  {
    hebrew: 'Bar/Bat Mitsvá',
    script: 'בַּר מִצְוָה',
    emoji: '📖',
    pt: 'Maioridade religiosa: meninos aos 13, meninas aos 12 (ortodoxo) ou 13 (reformista). Tornam-se responsáveis pelas mitsvot. Marca-se com leitura pública da Torá e celebração comunitária.',
    en: 'Religious coming of age: boys at 13, girls at 12 (Orthodox) or 13 (Reform). They become responsible for the mitzvot. Marked by public Torah reading and community celebration.',
    es: 'Mayoría religiosa: varones a los 13, niñas a los 12 (ortodoxo) o 13 (reformista). Se vuelven responsables de las mitzvot. Se marca con lectura pública de la Torá y celebración comunitaria.',
  },
  {
    hebrew: 'Tefilá',
    script: 'תְּפִלָּה',
    emoji: '🙏',
    pt: 'Oração — "auto-julgamento" (raiz hebraica). Três rezas diárias: Shacharit (manhã), Mincha (tarde), Maariv (noite). A Amidá ("oração em pé") é o coração de cada serviço.',
    en: 'Prayer — "self-judgment" (Hebrew root). Three daily prayers: Shacharit (morning), Mincha (afternoon), Maariv (evening). The Amidah ("standing prayer") is the heart of each service.',
    es: 'Oración — "autojuicio" (raíz hebrea). Tres rezos diarios: Shajarit (mañana), Minjá (tarde), Maariv (noche). La Amidá ("oración de pie") es el corazón de cada servicio.',
  },
  {
    hebrew: 'Kavaná',
    script: 'כַּוָּנָה',
    emoji: '💗',
    pt: 'Intenção e consciência espiritual. Sem kavaná, a oração é mecânica. É a presença plena do coração no momento sagrado — o oposto da rotina automática.',
    en: 'Intention and spiritual awareness. Without kavanah, prayer is mechanical. It is full presence of the heart in the sacred moment — the opposite of automatic routine.',
    es: 'Intención y conciencia espiritual. Sin kavaná, la oración es mecánica. Es la presencia plena del corazón en el momento sagrado — lo opuesto a la rutina automática.',
  },
  {
    hebrew: 'Shechiná',
    script: 'שְׁכִינָה',
    emoji: '🔥',
    pt: 'A Presença divina que habita entre o povo. Aspecto feminino e imanente de D-us. Diz-se que a Shechiná repousa onde há estudo, oração ou justiça praticada com amor.',
    en: 'The divine Presence that dwells among the people. Feminine and immanent aspect of G-d. The Shekhinah is said to rest where study, prayer, or justice is practiced with love.',
    es: 'La Presencia divina que habita entre el pueblo. Aspecto femenino e inmanente de D-os. Se dice que la Shejiná reposa donde hay estudio, oración o justicia practicada con amor.',
  },
  {
    hebrew: 'Olam Habá',
    script: 'עוֹלָם הַבָּא',
    emoji: '🌅',
    pt: '"O Mundo Vindouro". A vida após esta — pode significar a era messiânica, a ressurreição dos mortos, ou o paraíso espiritual das almas. Foco menor que no cristianismo: o judaísmo enfatiza este mundo.',
    en: '"The World to Come". The afterlife — may mean the messianic age, resurrection of the dead, or the spiritual paradise of souls. Less emphasis than in Christianity: Judaism focuses on this world.',
    es: '"El Mundo Venidero". La vida después de esta — puede significar la era mesiánica, resurrección de los muertos, o el paraíso espiritual de las almas. Menos énfasis que en el cristianismo: el judaísmo se centra en este mundo.',
  },
];

export default function HebrewGlossary({ compact = false }: { compact?: boolean }) {
  const { language } = useApp();
  const lang = (language as 'pt' | 'en' | 'es') || 'pt';
  const [selected, setSelected] = useState<Term | null>(null);

  const headerLabel =
    lang === 'en' ? 'Key Hebrew terms' : lang === 'es' ? 'Términos clave en hebreo' : 'Termos hebraicos essenciais';

  const subLabel =
    lang === 'en' ? 'Tap a term to see its meaning'
      : lang === 'es' ? 'Toca un término para ver su significado'
        : 'Toque um termo para ver o significado';

  return (
    <section
      className={cnLocal(
        'rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-amber-500/5 p-4 sm:p-5',
        compact ? '' : 'shadow-sm',
      )}
    >
      <div className="flex items-center gap-2.5 mb-1">
        <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            {headerLabel}
            <Sparkles className="h-3 w-3 text-primary/70" />
          </h3>
          <p className="text-[11px] text-muted-foreground">{subLabel}</p>
        </div>
      </div>

      <TooltipProvider delayDuration={150}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
          {TERMS.map((term) => {
            const meaning = term[lang] ?? term.pt;
            const isActive = selected?.hebrew === term.hebrew;
            return (
              <Tooltip key={term.hebrew}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setSelected(isActive ? null : term)}
                    className={cnLocal(
                      'group flex items-center gap-2 px-2.5 py-2 rounded-lg border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left active:scale-[0.98]',
                      isActive ? 'border-primary/60 bg-primary/10' : 'border-border/60',
                    )}
                  >
                    <span className="text-lg shrink-0">{term.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className={cnLocal('block text-xs font-semibold leading-tight truncate', isActive ? 'text-primary' : 'text-foreground group-hover:text-primary')}>
                        {term.hebrew}
                      </span>
                      <span
                        className="block text-[10px] text-muted-foreground font-serif leading-tight truncate"
                        dir="rtl"
                      >
                        {term.script}
                      </span>
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="hidden md:block max-w-[280px] text-xs leading-relaxed bg-popover text-popover-foreground border border-border shadow-lg"
                >
                  <p className="font-semibold mb-1 text-primary">
                    {term.hebrew} <span className="font-normal text-muted-foreground" dir="rtl">· {term.script}</span>
                  </p>
                  <p>{meaning}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {selected && (
        <div className="mt-3 rounded-xl border border-primary/30 bg-card p-3 animate-fade-in relative">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
            aria-label="Fechar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="text-sm font-semibold text-primary mb-1 pr-6">
            {selected.emoji} {selected.hebrew}
            <span className="font-normal text-muted-foreground ml-1.5 font-serif" dir="rtl">· {selected.script}</span>
          </p>
          <p className="text-xs text-foreground/85 leading-relaxed">{selected[lang] ?? selected.pt}</p>
        </div>
      )}
    </section>
  );
}

function cnLocal(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
