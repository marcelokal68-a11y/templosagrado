import { useApp } from '@/contexts/AppContext';

type Lang = 'pt-BR' | 'en' | 'es';

type Darshana = {
  key: string;
  emoji: string;
  color: string;
  name: Record<Lang, string>;
  founder: Record<Lang, string>;
  focus: Record<Lang, string>;
  text: Record<Lang, string>;
  brahman: Record<Lang, string>;
};

const DARSHANAS: Darshana[] = [
  {
    key: 'nyaya',
    emoji: '⚖️',
    color: 'border-sky-500/40 bg-sky-500/5',
    name: { 'pt-BR': 'Nyaya', en: 'Nyaya', es: 'Nyaya' },
    founder: { 'pt-BR': 'Gautama (Akṣapāda), séc. II AEC', en: 'Gautama (Akṣapāda), 2nd c. BCE', es: 'Gautama (Akṣapāda), s. II a.C.' },
    focus: {
      'pt-BR': 'Lógica e epistemologia — método de prova válida (pramāṇa) para conhecer a realidade',
      en: 'Logic and epistemology — method of valid proof (pramāṇa) to know reality',
      es: 'Lógica y epistemología — método de prueba válida (pramāṇa) para conocer la realidad',
    },
    text: { 'pt-BR': 'Nyāya Sūtras', en: 'Nyāya Sūtras', es: 'Nyāya Sūtras' },
    brahman: {
      'pt-BR': 'Atman é distinto do corpo; libertação = cessar a ignorância pela razão correta',
      en: 'Atman is distinct from the body; liberation = ending ignorance through correct reasoning',
      es: 'Atman es distinto del cuerpo; liberación = cesar la ignorancia por el razonamiento correcto',
    },
  },
  {
    key: 'vaisheshika',
    emoji: '⚛️',
    color: 'border-teal-500/40 bg-teal-500/5',
    name: { 'pt-BR': 'Vaisheshika', en: 'Vaisheshika', es: 'Vaisheshika' },
    founder: { 'pt-BR': 'Kanāda, séc. VI–II AEC', en: 'Kanāda, 6th–2nd c. BCE', es: 'Kanāda, s. VI–II a.C.' },
    focus: {
      'pt-BR': 'Atomismo e categorias (padārtha) — tudo se reduz a átomos eternos e 6 categorias',
      en: 'Atomism and categories (padārtha) — all reduces to eternal atoms and 6 categories',
      es: 'Atomismo y categorías (padārtha) — todo se reduce a átomos eternos y 6 categorías',
    },
    text: { 'pt-BR': 'Vaiśeṣika Sūtras', en: 'Vaiśeṣika Sūtras', es: 'Vaiśeṣika Sūtras' },
    brahman: {
      'pt-BR': 'Almas (atman) infinitas e eternas; Īśvara organiza os átomos. Não-dualismo ausente',
      en: 'Infinite eternal souls (atman); Īśvara organizes the atoms. No non-dualism',
      es: 'Almas (atman) infinitas y eternas; Īśvara organiza los átomos. Sin no-dualismo',
    },
  },
  {
    key: 'samkhya',
    emoji: '🌗',
    color: 'border-indigo-500/40 bg-indigo-500/5',
    name: { 'pt-BR': 'Samkhya', en: 'Samkhya', es: 'Samkhya' },
    founder: { 'pt-BR': 'Kapila, séc. VII AEC', en: 'Kapila, 7th c. BCE', es: 'Kapila, s. VII a.C.' },
    focus: {
      'pt-BR': 'Dualismo Puruṣa (consciência) × Prakṛti (matéria) — base teórica do Yoga',
      en: 'Dualism Puruṣa (consciousness) × Prakṛti (matter) — theoretical basis of Yoga',
      es: 'Dualismo Puruṣa (conciencia) × Prakṛti (materia) — base teórica del Yoga',
    },
    text: { 'pt-BR': 'Sāṃkhya Kārikā (Īśvarakṛṣṇa)', en: 'Sāṃkhya Kārikā (Īśvarakṛṣṇa)', es: 'Sāṃkhya Kārikā (Īśvarakṛṣṇa)' },
    brahman: {
      'pt-BR': 'Ateísta clássico — não admite Brahman único; libertação = isolar Puruṣa de Prakṛti',
      en: 'Classically atheistic — no single Brahman; liberation = isolating Puruṣa from Prakṛti',
      es: 'Clásicamente ateo — sin Brahman único; liberación = aislar Puruṣa de Prakṛti',
    },
  },
  {
    key: 'yoga',
    emoji: '🧘',
    color: 'border-emerald-500/40 bg-emerald-500/5',
    name: { 'pt-BR': 'Yoga', en: 'Yoga', es: 'Yoga' },
    founder: { 'pt-BR': 'Patañjali, séc. II AEC – IV EC', en: 'Patañjali, 2nd c. BCE – 4th c. CE', es: 'Patañjali, s. II a.C. – IV d.C.' },
    focus: {
      'pt-BR': 'Prática meditativa — 8 membros (Aṣṭāṅga) para aquietar a mente e realizar Puruṣa',
      en: 'Meditative practice — 8 limbs (Aṣṭāṅga) to still the mind and realize Puruṣa',
      es: 'Práctica meditativa — 8 miembros (Aṣṭāṅga) para aquietar la mente y realizar Puruṣa',
    },
    text: { 'pt-BR': 'Yoga Sūtras de Patañjali', en: 'Patañjali\'s Yoga Sūtras', es: 'Yoga Sūtras de Patañjali' },
    brahman: {
      'pt-BR': 'Aceita Īśvara como objeto de devoção; meta = kaivalya (isolamento absoluto da consciência)',
      en: 'Accepts Īśvara as object of devotion; goal = kaivalya (absolute isolation of consciousness)',
      es: 'Acepta Īśvara como objeto de devoción; meta = kaivalya (aislamiento absoluto de la conciencia)',
    },
  },
  {
    key: 'mimamsa',
    emoji: '📿',
    color: 'border-amber-500/40 bg-amber-500/5',
    name: { 'pt-BR': 'Mimamsa', en: 'Mimamsa', es: 'Mimamsa' },
    founder: { 'pt-BR': 'Jaimini, séc. III AEC', en: 'Jaimini, 3rd c. BCE', es: 'Jaimini, s. III a.C.' },
    focus: {
      'pt-BR': 'Hermenêutica védica e ritual (dharma) — interpretação correta dos Vedas e ações sagradas',
      en: 'Vedic hermeneutics and ritual (dharma) — correct interpretation of Vedas and sacred action',
      es: 'Hermenéutica védica y ritual (dharma) — interpretación correcta de los Vedas y acción sagrada',
    },
    text: { 'pt-BR': 'Mīmāṃsā Sūtras', en: 'Mīmāṃsā Sūtras', es: 'Mīmāṃsā Sūtras' },
    brahman: {
      'pt-BR': 'Vedas eternos e auto-evidentes; libertação via cumprimento ritual, não via Brahman',
      en: 'Vedas eternal and self-evident; liberation through ritual fulfillment, not through Brahman',
      es: 'Vedas eternos y autoevidentes; liberación por cumplimiento ritual, no por Brahman',
    },
  },
  {
    key: 'vedanta',
    emoji: '🕉️',
    color: 'border-rose-500/40 bg-rose-500/5',
    name: { 'pt-BR': 'Vedanta', en: 'Vedanta', es: 'Vedanta' },
    founder: { 'pt-BR': 'Bādarāyaṇa (sūtras); Śaṅkara (788–820 EC) — Advaita', en: 'Bādarāyaṇa (sūtras); Śaṅkara (788–820 CE) — Advaita', es: 'Bādarāyaṇa (sūtras); Śaṅkara (788–820 d.C.) — Advaita' },
    focus: {
      'pt-BR': 'Metafísica do Ser — natureza de Brahman, Atman e do Universo (3 escolas: Advaita, Vishishtadvaita, Dvaita)',
      en: 'Metaphysics of Being — nature of Brahman, Atman and Universe (3 schools: Advaita, Vishishtadvaita, Dvaita)',
      es: 'Metafísica del Ser — naturaleza de Brahman, Atman y Universo (3 escuelas: Advaita, Vishishtadvaita, Dvaita)',
    },
    text: { 'pt-BR': 'Brahma Sūtras, Upaniṣads, Bhagavad Gītā', en: 'Brahma Sūtras, Upaniṣads, Bhagavad Gītā', es: 'Brahma Sūtras, Upaniṣads, Bhagavad Gītā' },
    brahman: {
      'pt-BR': 'Atman = Brahman ("Tat Tvam Asi"). Moksha = realização direta dessa unidade',
      en: 'Atman = Brahman ("Tat Tvam Asi"). Moksha = direct realization of this unity',
      es: 'Atman = Brahman ("Tat Tvam Asi"). Moksha = realización directa de esta unidad',
    },
  },
];

const ROW_LABELS: Record<'founder' | 'focus' | 'text' | 'brahman', Record<Lang, string>> = {
  founder: { 'pt-BR': 'Fundador', en: 'Founder', es: 'Fundador' },
  focus: { 'pt-BR': 'Foco filosófico', en: 'Philosophical focus', es: 'Foco filosófico' },
  text: { 'pt-BR': 'Texto-base', en: 'Base text', es: 'Texto base' },
  brahman: { 'pt-BR': 'Brahman / Atman', en: 'Brahman / Atman', es: 'Brahman / Atman' },
};

const TITLE: Record<Lang, string> = {
  'pt-BR': 'Os 6 Darshanas — escolas clássicas do Hinduísmo',
  en: 'The 6 Darshanas — classical schools of Hinduism',
  es: 'Los 6 Darshanas — escuelas clásicas del Hinduismo',
};

const SUBTITLE: Record<Lang, string> = {
  'pt-BR': 'Comparativo visual lado a lado',
  en: 'Side-by-side visual comparison',
  es: 'Comparativo visual lado a lado',
};

interface Props {
  compact?: boolean;
}

export default function HinduDarshanasComparison({ compact = false }: Props) {
  const { language } = useApp();
  const lang = (language as Lang) || 'pt-BR';

  return (
    <section className={compact ? 'mb-4' : 'mb-8'}>
      {!compact && (
        <header className="mb-4 text-center">
          <h2 className="font-display text-xl font-semibold text-foreground">{TITLE[lang]}</h2>
          <p className="text-xs text-muted-foreground mt-1">{SUBTITLE[lang]}</p>
        </header>
      )}

      {/* Mobile: stacked cards */}
      <div className="grid gap-3 md:hidden">
        {DARSHANAS.map(d => (
          <div key={d.key} className={`rounded-xl border p-4 ${d.color}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{d.emoji}</span>
              <h3 className="font-display font-semibold text-foreground">{d.name[lang]}</h3>
            </div>
            <dl className="space-y-2">
              {(['founder', 'focus', 'text', 'brahman'] as const).map(field => (
                <div key={field} className="text-xs">
                  <dt className="text-muted-foreground font-medium">{ROW_LABELS[field][lang]}</dt>
                  <dd className="text-foreground/90 leading-snug">{d[field][lang]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {/* Desktop: 7-column table (label + 6 darshanas) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-3 text-xs font-medium text-muted-foreground w-[14%]"></th>
              {DARSHANAS.map(d => (
                <th key={d.key} className={`text-left p-3 font-display font-semibold text-foreground border-l border-border ${d.color}`}>
                  <span className="mr-1.5">{d.emoji}</span>
                  <span>{d.name[lang]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(['founder', 'focus', 'text', 'brahman'] as const).map((field, i) => (
              <tr key={field} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                <th className="text-left align-top p-3 text-xs font-medium text-muted-foreground border-t border-border">
                  {ROW_LABELS[field][lang]}
                </th>
                {DARSHANAS.map(d => (
                  <td key={d.key} className="align-top p-3 text-[12.5px] leading-snug text-foreground/90 border-t border-l border-border">
                    {d[field][lang]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
