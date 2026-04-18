import { useApp } from '@/contexts/AppContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BookOpen, Sparkles } from 'lucide-react';

type Term = {
  hebrew: string;
  script: string; // Hebraico
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
    pt: '"Instrução, Lei". Os 5 livros de Moisés (Pentateuco): Bereshit, Shemot, Vayikrá, Bamidbar, Devarim. No sentido amplo, inclui Torá Escrita + Torá Oral (Talmud). Coração da revelação judaica.',
    en: '"Instruction, Law". The 5 books of Moses (Pentateuch): Bereshit, Shemot, Vayikra, Bamidbar, Devarim. In the broad sense, includes Written Torah + Oral Torah (Talmud). Heart of Jewish revelation.',
    es: '"Instrucción, Ley". Los 5 libros de Moisés (Pentateuco): Bereshit, Shemot, Vayikrá, Bamidbar, Devarim. En sentido amplio, incluye Torá Escrita + Torá Oral (Talmud). Corazón de la revelación judía.',
  },
  {
    hebrew: 'Talmud',
    script: 'תַּלְמוּד',
    emoji: '📚',
    pt: '"Estudo, aprendizado". Compilação monumental da Torá Oral: Mishná (séc. III) + Guemará (séc. V–VI). Existem duas versões: Babilônico (mais autoritativo) e Jerusalmita. Discussões rabínicas sobre lei, ética e história.',
    en: '"Study, learning". Monumental compilation of the Oral Torah: Mishnah (3rd c.) + Gemara (5th–6th c.). Two versions exist: Babylonian (more authoritative) and Jerusalem. Rabbinic discussions on law, ethics, and history.',
    es: '"Estudio, aprendizaje". Compilación monumental de la Torá Oral: Mishná (s. III) + Guemará (s. V–VI). Existen dos versiones: Babilónico (más autoritativo) y Jerosolimitano. Discusiones rabínicas sobre ley, ética e historia.',
  },
  {
    hebrew: 'Mitsvá',
    script: 'מִצְוָה',
    emoji: '✡️',
    pt: '"Mandamento". A tradição enumera 613 mitsvot na Torá: 248 positivas ("farás") e 365 negativas ("não farás"). Cumprir uma mitsvá santifica o cotidiano e conecta o judeu à Aliança.',
    en: '"Commandment". Tradition enumerates 613 mitzvot in the Torah: 248 positive ("you shall do") and 365 negative ("you shall not"). Fulfilling a mitzvah sanctifies daily life and connects the Jew to the Covenant.',
    es: '"Mandamiento". La tradición enumera 613 mitzvot en la Torá: 248 positivas ("harás") y 365 negativas ("no harás"). Cumplir una mitzvá santifica lo cotidiano y conecta al judío con la Alianza.',
  },
  {
    hebrew: 'Tikun Olam',
    script: 'תִּקּוּן עוֹלָם',
    emoji: '🌍',
    pt: '"Reparo do mundo". Originalmente conceito cabalístico (Isaac Luria, séc. XVI): reunir as faíscas divinas dispersas. Hoje, tornou-se central no judaísmo Reformista e Conservador como justiça social ativa.',
    en: '"Repair of the world". Originally a Kabbalistic concept (Isaac Luria, 16th c.): gathering the scattered divine sparks. Today, it has become central in Reform and Conservative Judaism as active social justice.',
    es: '"Reparación del mundo". Originalmente concepto cabalístico (Isaac Luria, s. XVI): reunir las chispas divinas dispersas. Hoy se ha vuelto central en el judaísmo Reformista y Conservador como justicia social activa.',
  },
  {
    hebrew: 'Shabat',
    script: 'שַׁבָּת',
    emoji: '🕯️',
    pt: '"Repouso". Sétimo dia (sexta ao pôr do sol até sábado à noite). Imitação do descanso divino na Criação. Acendem-se velas, recita-se Kidush, e abstém-se de 39 categorias de trabalho. "Mais que Israel guardou o Shabat, o Shabat guardou Israel" (Ahad Ha\'am).',
    en: '"Rest". Seventh day (Friday at sunset to Saturday night). Imitation of divine rest in Creation. Candles are lit, Kiddush recited, and 39 categories of work avoided. "More than Israel has kept the Sabbath, the Sabbath has kept Israel" (Ahad Ha\'am).',
    es: '"Descanso". Séptimo día (viernes al atardecer hasta sábado por la noche). Imitación del descanso divino en la Creación. Se encienden velas, se recita Kidush, y se evitan 39 categorías de trabajo. "Más que Israel guardó el Shabat, el Shabat guardó a Israel" (Ahad Ha\'am).',
  },
  {
    hebrew: 'Kashrut',
    script: 'כַּשְׁרוּת',
    emoji: '🍽️',
    pt: '"Adequação". Leis dietéticas: o que é kasher (apto). Não misturar carne e leite, animais permitidos (sem porco, frutos do mar etc.), abate ritual (shechita). Disciplina espiritual cotidiana.',
    en: '"Fitness". Dietary laws: what is kosher (fit). No mixing meat and milk, only permitted animals (no pork, shellfish, etc.), ritual slaughter (shechita). Daily spiritual discipline.',
    es: '"Aptitud". Leyes dietéticas: lo que es kasher (apto). No mezclar carne y leche, animales permitidos (sin cerdo, mariscos, etc.), sacrificio ritual (shejitá). Disciplina espiritual cotidiana.',
  },
  {
    hebrew: 'Tzedaká',
    script: 'צְדָקָה',
    emoji: '🤲',
    pt: '"Justiça" (não "caridade"). Doar não é favor, é obrigação. Maimônides classificou 8 níveis: o mais alto é dar emprego/parceria para que o pobre se sustente. 10% da renda é referência tradicional.',
    en: '"Justice" (not "charity"). Giving is not a favor, it is an obligation. Maimonides classified 8 levels: the highest is giving employment/partnership so the poor sustain themselves. 10% of income is the traditional reference.',
    es: '"Justicia" (no "caridad"). Dar no es un favor, es una obligación. Maimónides clasificó 8 niveles: el más alto es dar empleo/sociedad para que el pobre se sostenga. El 10% de los ingresos es la referencia tradicional.',
  },
  {
    hebrew: 'Bar/Bat Mitsvá',
    script: 'בַּר/בַּת מִצְוָה',
    emoji: '🎓',
    pt: '"Filho/Filha do Mandamento". Maioridade religiosa: 13 anos (meninos) e 12 (meninas, em ramos não-ortodoxos celebrado aos 13). A partir daí, o jovem é responsável por suas próprias mitsvot. Marca-se com leitura pública da Torá.',
    en: '"Son/Daughter of the Commandment". Religious adulthood: 13 (boys) and 12 (girls, in non-Orthodox branches celebrated at 13). From then on, the youth is responsible for their own mitzvot. Marked by public Torah reading.',
    es: '"Hijo/Hija del Mandamiento". Mayoría de edad religiosa: 13 (niños) y 12 (niñas, en ramas no ortodoxas celebrado a los 13). A partir de ahí, el joven es responsable de sus propias mitzvot. Se marca con lectura pública de la Torá.',
  },
  {
    hebrew: 'Tefilá',
    script: 'תְּפִלָּה',
    emoji: '🙏',
    pt: '"Oração" (raiz: julgar-se a si mesmo). Três serviços diários: Shacharit (manhã), Mincha (tarde), Maariv (noite). Coração: a Amidá ("Em pé"), 18 bênçãos. Idealmente em minyan (10 adultos).',
    en: '"Prayer" (root: to judge oneself). Three daily services: Shacharit (morning), Mincha (afternoon), Maariv (evening). Heart: the Amidah ("Standing"), 18 blessings. Ideally in minyan (10 adults).',
    es: '"Oración" (raíz: juzgarse a sí mismo). Tres servicios diarios: Shajarit (mañana), Minjá (tarde), Maariv (noche). Corazón: la Amidá ("De pie"), 18 bendiciones. Idealmente en minyán (10 adultos).',
  },
  {
    hebrew: 'Kavaná',
    script: 'כַּוָּנָה',
    emoji: '💭',
    pt: '"Intenção, direção da mente". Qualidade essencial da oração e da prática: não basta cumprir o ritual, é preciso estar presente de coração. Para os místicos hassídicos, sem kavaná, a mitsvá é corpo sem alma.',
    en: '"Intention, direction of mind". Essential quality of prayer and practice: it is not enough to perform the ritual, one must be wholeheartedly present. For Hasidic mystics, without kavanah, the mitzvah is a body without soul.',
    es: '"Intención, dirección de la mente". Cualidad esencial de la oración y la práctica: no basta con cumplir el ritual, hay que estar presente de corazón. Para los místicos jasídicos, sin kavaná, la mitzvá es cuerpo sin alma.',
  },
  {
    hebrew: 'Shechiná',
    script: 'שְׁכִינָה',
    emoji: '🕊️',
    pt: '"Presença Divina (que habita)". Aspecto imanente de Deus que habita o mundo, o Templo, a comunidade orante. Na Cabala, é o aspecto feminino do divino, em exílio com Israel até a redenção messiânica.',
    en: '"Divine Presence (that dwells)". Immanent aspect of God that dwells in the world, the Temple, the praying community. In Kabbalah, it is the feminine aspect of the divine, in exile with Israel until messianic redemption.',
    es: '"Presencia Divina (que habita)". Aspecto inmanente de Dios que habita el mundo, el Templo, la comunidad orante. En la Cábala, es el aspecto femenino de lo divino, en exilio con Israel hasta la redención mesiánica.',
  },
  {
    hebrew: 'Olam Habá',
    script: 'עוֹלָם הַבָּא',
    emoji: '✨',
    pt: '"Mundo Vindouro". Visão judaica do "depois": pode significar a era messiânica na terra, a vida da alma após a morte, ou a ressurreição. O Judaísmo enfatiza muito mais o Olam HaZé (este mundo) que o "céu".',
    en: '"World to Come". Jewish vision of the "afterwards": can mean the messianic era on earth, the soul\'s life after death, or resurrection. Judaism emphasizes much more Olam HaZeh (this world) than "heaven".',
    es: '"Mundo Venidero". Visión judía del "después": puede significar la era mesiánica en la tierra, la vida del alma tras la muerte, o la resurrección. El Judaísmo enfatiza mucho más el Olam HaZé (este mundo) que el "cielo".',
  },
];

export default function HebrewGlossary({ compact = false }: { compact?: boolean }) {
  const { language } = useApp();
  const lang = (language as 'pt' | 'en' | 'es') || 'pt';

  const headerLabel =
    lang === 'en'
      ? 'Key Jewish terms'
      : lang === 'es'
        ? 'Términos judíos clave'
        : 'Termos judaicos essenciais';

  const subLabel =
    lang === 'en'
      ? 'Tap a term to see its meaning'
      : lang === 'es'
        ? 'Toca un término para ver su significado'
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
            return (
              <Tooltip key={term.hebrew}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="group flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left active:scale-[0.98]"
                  >
                    <span className="text-lg shrink-0">{term.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-foreground group-hover:text-primary leading-tight truncate">
                        {term.hebrew}
                      </span>
                      <span className="block text-[10px] text-muted-foreground font-serif leading-tight truncate" dir="rtl">
                        {term.script}
                      </span>
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-[280px] text-xs leading-relaxed bg-popover text-popover-foreground border border-border shadow-lg"
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
    </section>
  );
}

function cnLocal(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
