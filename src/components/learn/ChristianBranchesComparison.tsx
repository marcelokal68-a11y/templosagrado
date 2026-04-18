import { useApp } from '@/contexts/AppContext';

type Lang = 'pt-BR' | 'en' | 'es';

type Branch = {
  key: string;
  emoji: string;
  color: string;
  name: Record<Lang, string>;
  authority: Record<Lang, string>;
  sacraments: Record<Lang, string>;
  mariology: Record<Lang, string>;
  liturgy: Record<Lang, string>;
  figures: Record<Lang, string>;
};

const BRANCHES: Branch[] = [
  {
    key: 'catholic',
    emoji: '⛪',
    color: 'border-amber-500/40 bg-amber-500/5',
    name: { 'pt-BR': 'Catolicismo Romano', en: 'Roman Catholicism', es: 'Catolicismo Romano' },
    authority: {
      'pt-BR': 'Papa (sucessor de Pedro), Magistério, Concílios e Tradição Apostólica + Escritura',
      en: 'Pope (successor of Peter), Magisterium, Councils and Apostolic Tradition + Scripture',
      es: 'Papa (sucesor de Pedro), Magisterio, Concilios y Tradición Apostólica + Escritura',
    },
    sacraments: {
      'pt-BR': '7 sacramentos: Batismo, Eucaristia, Confirmação, Confissão, Matrimônio, Ordem, Unção dos Enfermos',
      en: '7 sacraments: Baptism, Eucharist, Confirmation, Confession, Matrimony, Holy Orders, Anointing of the Sick',
      es: '7 sacramentos: Bautismo, Eucaristía, Confirmación, Confesión, Matrimonio, Orden, Unción de los Enfermos',
    },
    mariology: {
      'pt-BR': 'Imaculada Conceição (1854), Assunção (1950), Mãe da Igreja, Co-Redentora (devocional). Rosário central',
      en: 'Immaculate Conception (1854), Assumption (1950), Mother of the Church, Co-Redemptrix (devotional). Rosary central',
      es: 'Inmaculada Concepción (1854), Asunción (1950), Madre de la Iglesia, Corredentora (devocional). Rosario central',
    },
    liturgy: {
      'pt-BR': 'Latim (forma extraordinária) e vernáculo após Vaticano II (1965). Rito Romano dominante',
      en: 'Latin (extraordinary form) and vernacular after Vatican II (1965). Roman Rite dominant',
      es: 'Latín (forma extraordinaria) y vernáculo tras Vaticano II (1965). Rito Romano dominante',
    },
    figures: {
      'pt-BR': 'Pedro, Agostinho, Tomás de Aquino, Francisco de Assis, Teresa d\'Ávila, João Paulo II, Francisco',
      en: 'Peter, Augustine, Thomas Aquinas, Francis of Assisi, Teresa of Ávila, John Paul II, Francis',
      es: 'Pedro, Agustín, Tomás de Aquino, Francisco de Asís, Teresa de Ávila, Juan Pablo II, Francisco',
    },
  },
  {
    key: 'orthodox',
    emoji: '☦️',
    color: 'border-sky-500/40 bg-sky-500/5',
    name: { 'pt-BR': 'Ortodoxia Oriental', en: 'Eastern Orthodoxy', es: 'Ortodoxia Oriental' },
    authority: {
      'pt-BR': 'Sinodalidade — 14 Igrejas autocéfalas. Patriarca de Constantinopla "primus inter pares". Sem infalibilidade papal',
      en: 'Synodality — 14 autocephalous Churches. Patriarch of Constantinople "primus inter pares". No papal infallibility',
      es: 'Sinodalidad — 14 Iglesias autocéfalas. Patriarca de Constantinopla "primus inter pares". Sin infalibilidad papal',
    },
    sacraments: {
      'pt-BR': '7 Mistérios (mesmos do catolicismo). Crisma e Eucaristia administradas no batismo, mesmo a bebês',
      en: '7 Mysteries (same as Catholicism). Chrismation and Eucharist given at baptism, even to infants',
      es: '7 Misterios (mismos que el catolicismo). Crismación y Eucaristía dadas en el bautismo, incluso a bebés',
    },
    mariology: {
      'pt-BR': 'Theotokos (Mãe de Deus, Concílio de Éfeso 431). Sempre virgem. Rejeita Imaculada Conceição como dogma',
      en: 'Theotokos (Mother of God, Council of Ephesus 431). Ever-Virgin. Rejects Immaculate Conception as dogma',
      es: 'Theotokos (Madre de Dios, Concilio de Éfeso 431). Siempre Virgen. Rechaza Inmaculada Concepción como dogma',
    },
    liturgy: {
      'pt-BR': 'Grego, eslavo eclesiástico, árabe, romeno, georgiano, vernáculo. Liturgia de São João Crisóstomo',
      en: 'Greek, Church Slavonic, Arabic, Romanian, Georgian, vernacular. Divine Liturgy of St. John Chrysostom',
      es: 'Griego, eslavo eclesiástico, árabe, rumano, georgiano, vernáculo. Liturgia de San Juan Crisóstomo',
    },
    figures: {
      'pt-BR': 'João Crisóstomo, Basílio Magno, Gregório de Nissa, Gregório Palamas, Serafim de Sarov, Bartolomeu I',
      en: 'John Chrysostom, Basil the Great, Gregory of Nyssa, Gregory Palamas, Seraphim of Sarov, Bartholomew I',
      es: 'Juan Crisóstomo, Basilio Magno, Gregorio de Nisa, Gregorio Palamas, Serafín de Sarov, Bartolomé I',
    },
  },
  {
    key: 'protestant',
    emoji: '✝️',
    color: 'border-rose-500/40 bg-rose-500/5',
    name: { 'pt-BR': 'Protestantismo', en: 'Protestantism', es: 'Protestantismo' },
    authority: {
      'pt-BR': 'Sola Scriptura — só a Bíblia. 5 Solas (Scriptura, Fide, Gratia, Christus, Deo Gloria). Sem clero hierárquico universal',
      en: 'Sola Scriptura — Bible alone. 5 Solas (Scriptura, Fide, Gratia, Christus, Deo Gloria). No universal hierarchical clergy',
      es: 'Sola Scriptura — solo la Biblia. 5 Solas (Scriptura, Fide, Gratia, Christus, Deo Gloria). Sin clero jerárquico universal',
    },
    sacraments: {
      'pt-BR': '2 ordenanças: Batismo e Ceia do Senhor (Eucaristia simbólica/espiritual, varia por denominação)',
      en: '2 ordinances: Baptism and Lord\'s Supper (Eucharist symbolic/spiritual, varies by denomination)',
      es: '2 ordenanzas: Bautismo y Cena del Señor (Eucaristía simbólica/espiritual, varía por denominación)',
    },
    mariology: {
      'pt-BR': 'Mãe de Jesus, exemplo de fé. Rejeita orações a Maria, Imaculada Conceição e Assunção. Sem rosário',
      en: 'Mother of Jesus, example of faith. Rejects prayers to Mary, Immaculate Conception and Assumption. No rosary',
      es: 'Madre de Jesús, ejemplo de fe. Rechaza oraciones a María, Inmaculada Concepción y Asunción. Sin rosario',
    },
    liturgy: {
      'pt-BR': 'Sempre vernáculo (princípio luterano). Pregação central. Música congregacional, hinários e bandas modernas',
      en: 'Always vernacular (Lutheran principle). Preaching central. Congregational music, hymnals and modern bands',
      es: 'Siempre vernáculo (principio luterano). Predicación central. Música congregacional, himnarios y bandas modernas',
    },
    figures: {
      'pt-BR': 'Lutero, Calvino, Zuínglio, John Wesley, Karl Barth, Bonhoeffer, Billy Graham, C. S. Lewis',
      en: 'Luther, Calvin, Zwingli, John Wesley, Karl Barth, Bonhoeffer, Billy Graham, C. S. Lewis',
      es: 'Lutero, Calvino, Zuinglio, John Wesley, Karl Barth, Bonhoeffer, Billy Graham, C. S. Lewis',
    },
  },
];

const ROW_LABELS: Record<'authority' | 'sacraments' | 'mariology' | 'liturgy' | 'figures', Record<Lang, string>> = {
  authority: { 'pt-BR': 'Autoridade', en: 'Authority', es: 'Autoridad' },
  sacraments: { 'pt-BR': 'Sacramentos', en: 'Sacraments', es: 'Sacramentos' },
  mariology: { 'pt-BR': 'Mariologia', en: 'Mariology', es: 'Mariología' },
  liturgy: { 'pt-BR': 'Língua litúrgica', en: 'Liturgical language', es: 'Lengua litúrgica' },
  figures: { 'pt-BR': 'Figuras de referência', en: 'Reference figures', es: 'Figuras de referencia' },
};

const TITLE: Record<Lang, string> = {
  'pt-BR': 'As 3 grandes vertentes do Cristianismo',
  en: 'The 3 major branches of Christianity',
  es: 'Las 3 grandes vertientes del Cristianismo',
};

const SUBTITLE: Record<Lang, string> = {
  'pt-BR': 'Comparativo visual lado a lado',
  en: 'Side-by-side visual comparison',
  es: 'Comparativo visual lado a lado',
};

interface Props {
  compact?: boolean;
}

export default function ChristianBranchesComparison({ compact = false }: Props) {
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
        {BRANCHES.map(b => (
          <div key={b.key} className={`rounded-xl border p-4 ${b.color}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{b.emoji}</span>
              <h3 className="font-display font-semibold text-foreground">{b.name[lang]}</h3>
            </div>
            <dl className="space-y-2">
              {(['authority', 'sacraments', 'mariology', 'liturgy', 'figures'] as const).map(field => (
                <div key={field} className="text-xs">
                  <dt className="text-muted-foreground font-medium">{ROW_LABELS[field][lang]}</dt>
                  <dd className="text-foreground/90 leading-snug">{b[field][lang]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {/* Desktop: 4-column table (label + 3 branches) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-3 text-xs font-medium text-muted-foreground w-[18%]"></th>
              {BRANCHES.map(b => (
                <th key={b.key} className={`text-left p-3 font-display font-semibold text-foreground border-l border-border ${b.color}`}>
                  <span className="mr-1.5">{b.emoji}</span>
                  <span>{b.name[lang]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(['authority', 'sacraments', 'mariology', 'liturgy', 'figures'] as const).map((field, i) => (
              <tr key={field} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                <th className="text-left align-top p-3 text-xs font-medium text-muted-foreground border-t border-border">
                  {ROW_LABELS[field][lang]}
                </th>
                {BRANCHES.map(b => (
                  <td key={b.key} className="align-top p-3 text-[12.5px] leading-snug text-foreground/90 border-t border-l border-border">
                    {b[field][lang]}
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
