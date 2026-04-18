import { useApp } from '@/contexts/AppContext';

type Lang = 'pt-BR' | 'en' | 'es';

type Row = {
  label: Record<Lang, string>;
  theravada: Record<Lang, string>;
  mahayana: Record<Lang, string>;
  vajrayana: Record<Lang, string>;
};

const ROWS: Row[] = [
  {
    label: { 'pt-BR': 'Significado', en: 'Meaning', es: 'Significado' },
    theravada: { 'pt-BR': '"Doutrina dos Anciãos"', en: '"Doctrine of the Elders"', es: '"Doctrina de los Ancianos"' },
    mahayana: { 'pt-BR': '"Grande Veículo"', en: '"Great Vehicle"', es: '"Gran Vehículo"' },
    vajrayana: { 'pt-BR': '"Veículo do Diamante"', en: '"Diamond Vehicle"', es: '"Vehículo del Diamante"' },
  },
  {
    label: { 'pt-BR': 'Origem', en: 'Origin', es: 'Origen' },
    theravada: { 'pt-BR': 'Séc. III AEC, Sri Lanka', en: '3rd c. BCE, Sri Lanka', es: 'S. III a.C., Sri Lanka' },
    mahayana: { 'pt-BR': 'Séc. I AEC, Índia', en: '1st c. BCE, India', es: 'S. I a.C., India' },
    vajrayana: { 'pt-BR': 'Séc. VII–VIII EC, Índia → Tibete', en: '7th–8th c. CE, India → Tibet', es: 'S. VII–VIII d.C., India → Tíbet' },
  },
  {
    label: { 'pt-BR': 'Regiões', en: 'Regions', es: 'Regiones' },
    theravada: { 'pt-BR': 'Sri Lanka, Tailândia, Mianmar, Laos, Camboja', en: 'Sri Lanka, Thailand, Myanmar, Laos, Cambodia', es: 'Sri Lanka, Tailandia, Myanmar, Laos, Camboya' },
    mahayana: { 'pt-BR': 'China, Japão, Coreia, Vietnã, Taiwan', en: 'China, Japan, Korea, Vietnam, Taiwan', es: 'China, Japón, Corea, Vietnam, Taiwán' },
    vajrayana: { 'pt-BR': 'Tibete, Mongólia, Butão, Nepal, Norte da Índia', en: 'Tibet, Mongolia, Bhutan, Nepal, Northern India', es: 'Tíbet, Mongolia, Bután, Nepal, Norte de India' },
  },
  {
    label: { 'pt-BR': 'Ideal espiritual', en: 'Spiritual ideal', es: 'Ideal espiritual' },
    theravada: { 'pt-BR': 'Arhat — extinção pessoal das impurezas', en: 'Arhat — personal extinction of impurities', es: 'Arhat — extinción personal de impurezas' },
    mahayana: { 'pt-BR': 'Bodhisattva — adia o Nirvana para libertar todos os seres', en: 'Bodhisattva — postpones Nirvana to liberate all beings', es: 'Bodhisattva — pospone el Nirvana para liberar a todos' },
    vajrayana: { 'pt-BR': 'Iluminação nesta vida via meios tântricos', en: 'Enlightenment in this life via tantric means', es: 'Iluminación en esta vida por medios tántricos' },
  },
  {
    label: { 'pt-BR': 'Textos centrais', en: 'Central texts', es: 'Textos centrales' },
    theravada: { 'pt-BR': 'Tipitaka (cânone Pali), Dhammapada', en: 'Tipitaka (Pali Canon), Dhammapada', es: 'Tipitaka (Canon Pali), Dhammapada' },
    mahayana: { 'pt-BR': 'Sutras Lotus, Coração, Diamante, Avatamsaka', en: 'Lotus, Heart, Diamond, Avatamsaka Sutras', es: 'Sutras del Loto, Corazón, Diamante, Avatamsaka' },
    vajrayana: { 'pt-BR': 'Tantras, Bardo Thodol, Lamrim de Tsongkhapa', en: 'Tantras, Bardo Thodol, Tsongkhapa\'s Lamrim', es: 'Tantras, Bardo Thodol, Lamrim de Tsongkhapa' },
  },
  {
    label: { 'pt-BR': 'Práticas-chave', en: 'Key practices', es: 'Prácticas clave' },
    theravada: { 'pt-BR': 'Vipassana (insight), Samatha (calma), monasticismo estrito', en: 'Vipassana (insight), Samatha (calm), strict monasticism', es: 'Vipassana, Samatha, monacato estricto' },
    mahayana: { 'pt-BR': '6 Paramitas, Zen (shikantaza), recitação de sutras, koans', en: '6 Paramitas, Zen (shikantaza), sutra recitation, koans', es: '6 Paramitas, Zen, recitación de sutras, koans' },
    vajrayana: { 'pt-BR': 'Mantras, mudras, mandalas, deidades (yidams), Dzogchen', en: 'Mantras, mudras, mandalas, deities (yidams), Dzogchen', es: 'Mantras, mudras, mandalas, deidades (yidams), Dzogchen' },
  },
  {
    label: { 'pt-BR': 'Mestres modernos', en: 'Modern masters', es: 'Maestros modernos' },
    theravada: { 'pt-BR': 'Ajahn Chah, Mahasi Sayadaw, S. N. Goenka', en: 'Ajahn Chah, Mahasi Sayadaw, S. N. Goenka', es: 'Ajahn Chah, Mahasi Sayadaw, S. N. Goenka' },
    mahayana: { 'pt-BR': 'Dogen, Thich Nhat Hanh, D. T. Suzuki', en: 'Dogen, Thich Nhat Hanh, D. T. Suzuki', es: 'Dogen, Thich Nhat Hanh, D. T. Suzuki' },
    vajrayana: { 'pt-BR': '14º Dalai Lama, Padmasambhava, Milarepa', en: '14th Dalai Lama, Padmasambhava, Milarepa', es: '14º Dalái Lama, Padmasambhava, Milarepa' },
  },
  {
    label: { 'pt-BR': 'Mantra emblemático', en: 'Emblematic mantra', es: 'Mantra emblemático' },
    theravada: { 'pt-BR': 'Buddham saranam gacchami', en: 'Buddham saranam gacchami', es: 'Buddham saranam gacchami' },
    mahayana: { 'pt-BR': 'Gate gate paragate / Namu Amida Butsu', en: 'Gate gate paragate / Namu Amida Butsu', es: 'Gate gate paragate / Namu Amida Butsu' },
    vajrayana: { 'pt-BR': 'Om Mani Padme Hum', en: 'Om Mani Padme Hum', es: 'Om Mani Padme Hum' },
  },
];

const HEADERS: { key: 'theravada' | 'mahayana' | 'vajrayana'; emoji: string; color: string }[] = [
  { key: 'theravada', emoji: '🟠', color: 'border-amber-500/40 bg-amber-500/5' },
  { key: 'mahayana', emoji: '🔴', color: 'border-rose-500/40 bg-rose-500/5' },
  { key: 'vajrayana', emoji: '🟣', color: 'border-violet-500/40 bg-violet-500/5' },
];

const TITLE: Record<Lang, string> = {
  'pt-BR': 'As 3 grandes escolas do Budismo',
  en: 'The 3 great schools of Buddhism',
  es: 'Las 3 grandes escuelas del Budismo',
};

const SUBTITLE: Record<Lang, string> = {
  'pt-BR': 'Comparativo visual lado a lado',
  en: 'Side-by-side visual comparison',
  es: 'Comparativo visual lado a lado',
};

interface Props {
  compact?: boolean;
}

export default function BuddhistSchoolsComparison({ compact = false }: Props) {
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
        {HEADERS.map(h => (
          <div key={h.key} className={`rounded-xl border p-4 ${h.color}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{h.emoji}</span>
              <h3 className="font-display font-semibold text-foreground capitalize">{h.key}</h3>
            </div>
            <dl className="space-y-2">
              {ROWS.map((row, i) => (
                <div key={i} className="text-xs">
                  <dt className="text-muted-foreground font-medium">{row.label[lang]}</dt>
                  <dd className="text-foreground/90 leading-snug">{row[h.key][lang]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {/* Desktop: 4-column table (label + 3 schools) */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-3 text-xs font-medium text-muted-foreground w-[18%]"></th>
              {HEADERS.map(h => (
                <th key={h.key} className={`text-left p-3 font-display font-semibold text-foreground border-l border-border ${h.color}`}>
                  <span className="mr-2">{h.emoji}</span>
                  <span className="capitalize">{h.key}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                <th className="text-left align-top p-3 text-xs font-medium text-muted-foreground border-t border-border">
                  {row.label[lang]}
                </th>
                {HEADERS.map(h => (
                  <td key={h.key} className="align-top p-3 text-[13px] leading-snug text-foreground/90 border-t border-l border-border">
                    {row[h.key][lang]}
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
