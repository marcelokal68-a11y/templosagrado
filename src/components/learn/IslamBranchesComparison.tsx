import { useApp } from '@/contexts/AppContext';

type Lang = 'pt-BR' | 'en' | 'es';

type Branch = {
  key: string;
  emoji: string;
  color: string;
  name: Record<Lang, string>;
  regions: Record<Lang, string>;
  authority: Record<Lang, string>;
  texts: Record<Lang, string>;
  festivals: Record<Lang, string>;
  schools: Record<Lang, string>;
};

const BRANCHES: Branch[] = [
  {
    key: 'sunni',
    emoji: '🟢',
    color: 'border-emerald-500/40 bg-emerald-500/5',
    name: { 'pt-BR': 'Sunismo', en: 'Sunni', es: 'Sunismo' },
    regions: {
      'pt-BR': '~85–90% dos muçulmanos. Indonésia, Paquistão, Egito, Turquia, Magreb, Golfo (exceto Omã)',
      en: '~85–90% of Muslims. Indonesia, Pakistan, Egypt, Turkey, Maghreb, Gulf (except Oman)',
      es: '~85–90% de los musulmanes. Indonesia, Pakistán, Egipto, Turquía, Magreb, Golfo (excepto Omán)',
    },
    authority: {
      'pt-BR': 'Consenso da comunidade (ijmā\') e os ulemás. Califas eleitos historicamente; sem clero hierárquico',
      en: 'Community consensus (ijmā\') and the ulama. Caliphs historically elected; no hierarchical clergy',
      es: 'Consenso de la comunidad (ijmā\') y los ulemas. Califas elegidos históricamente; sin clero jerárquico',
    },
    texts: {
      'pt-BR': 'Alcorão + 6 coleções de Hadith (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa\'i, Ibn Maja)',
      en: 'Qur\'an + 6 Hadith collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa\'i, Ibn Maja)',
      es: 'Corán + 6 colecciones de Hadiz (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa\'i, Ibn Maja)',
    },
    festivals: {
      'pt-BR': 'Eid al-Fitr, Eid al-Adha, Mawlid (variável), Laylat al-Qadr',
      en: 'Eid al-Fitr, Eid al-Adha, Mawlid (variable), Laylat al-Qadr',
      es: 'Eid al-Fitr, Eid al-Adha, Mawlid (variable), Laylat al-Qadr',
    },
    schools: {
      'pt-BR': '4 madhhabs jurídicos: Hanafi, Maliki, Shafi\'i, Hanbali',
      en: '4 legal madhhabs: Hanafi, Maliki, Shafi\'i, Hanbali',
      es: '4 madhhabs jurídicos: Hanafi, Maliki, Shafi\'i, Hanbali',
    },
  },
  {
    key: 'shia',
    emoji: '🔵',
    color: 'border-sky-500/40 bg-sky-500/5',
    name: { 'pt-BR': 'Xiismo (Duodecimano)', en: 'Shia (Twelver)', es: 'Chiismo (Duodecimano)' },
    regions: {
      'pt-BR': '~10–13%. Irã (~90%), Iraque, Bahrein, Azerbaijão, Líbano (Hezbollah), partes do Iêmen e Síria',
      en: '~10–13%. Iran (~90%), Iraq, Bahrain, Azerbaijan, Lebanon (Hezbollah), parts of Yemen and Syria',
      es: '~10–13%. Irán (~90%), Iraq, Baréin, Azerbaiyán, Líbano (Hezbolá), partes de Yemen y Siria',
    },
    authority: {
      'pt-BR': '12 Imãs sucessores de Ali; Mahdi oculto desde 874 EC. Hoje: Marja\'iyya (Aiatolás como Sistani, Khamenei)',
      en: '12 Imams as Ali\'s successors; hidden Mahdi since 874 CE. Today: Marja\'iyya (Ayatollahs like Sistani, Khamenei)',
      es: '12 Imanes sucesores de Alí; Mahdi oculto desde 874 d.C. Hoy: Marja\'iyya (Ayatolás como Sistani, Khamenei)',
    },
    texts: {
      'pt-BR': 'Alcorão + 4 livros de Hadith (Al-Kafi, Man La Yahduruhu al-Faqih, Tahdhib, Istibsar) + Nahj al-Balagha (sermões de Ali)',
      en: 'Qur\'an + 4 Hadith books (Al-Kafi, Man La Yahduruhu al-Faqih, Tahdhib, Istibsar) + Nahj al-Balagha (Ali\'s sermons)',
      es: 'Corán + 4 libros de Hadiz (Al-Kafi, Man La Yahduruhu al-Faqih, Tahdhib, Istibsar) + Nahj al-Balagha (sermones de Alí)',
    },
    festivals: {
      'pt-BR': 'Ashura (martírio de Husayn em Karbala), Arba\'een, Eid al-Ghadir (sucessão de Ali), Mawlid',
      en: 'Ashura (martyrdom of Husayn at Karbala), Arba\'een, Eid al-Ghadir (Ali\'s succession), Mawlid',
      es: 'Ashura (martirio de Husayn en Kerbala), Arba\'een, Eid al-Ghadir (sucesión de Alí), Mawlid',
    },
    schools: {
      'pt-BR': 'Escola jurídica Ja\'fari; sub-ramos: Ismaelitas (Aga Khan), Zaiditas (Iêmen)',
      en: 'Ja\'fari legal school; sub-branches: Ismailis (Aga Khan), Zaydis (Yemen)',
      es: 'Escuela jurídica Ja\'fari; sub-ramas: Ismailíes (Aga Khan), Zaiditas (Yemen)',
    },
  },
  {
    key: 'sufi',
    emoji: '🟣',
    color: 'border-violet-500/40 bg-violet-500/5',
    name: { 'pt-BR': 'Sufismo', en: 'Sufism', es: 'Sufismo' },
    regions: {
      'pt-BR': 'Tradição mística transversal (sunita e xiita). Forte em Turquia, Egito, Marrocos, Senegal, Sul da Ásia',
      en: 'Cross-cutting mystical tradition (Sunni and Shia). Strong in Turkey, Egypt, Morocco, Senegal, South Asia',
      es: 'Tradición mística transversal (sunita y chiita). Fuerte en Turquía, Egipto, Marruecos, Senegal, Sur de Asia',
    },
    authority: {
      'pt-BR': 'Shaykh (mestre espiritual) de cada tariqa; cadeia iniciática (silsila) remontando ao Profeta',
      en: 'Shaykh (spiritual master) of each tariqa; initiatory chain (silsila) tracing back to the Prophet',
      es: 'Shaykh (maestro espiritual) de cada tariqa; cadena iniciática (silsila) que remonta al Profeta',
    },
    texts: {
      'pt-BR': 'Alcorão + Hadith + Mathnawi (Rumi), Futūḥāt (Ibn Arabi), Risāla al-Qushayriyya, Conferências de Hafiz',
      en: 'Qur\'an + Hadith + Mathnawi (Rumi), Futūḥāt (Ibn Arabi), Risāla al-Qushayriyya, Hafiz\'s poems',
      es: 'Corán + Hadiz + Mathnawi (Rumi), Futūḥāt (Ibn Arabi), Risāla al-Qushayriyya, poemas de Hafiz',
    },
    festivals: {
      'pt-BR': 'Urs (aniversário da morte do santo), Mawlid celebrado intensamente, sema (dança giratória) em datas especiais',
      en: 'Urs (saint\'s death anniversary), Mawlid celebrated intensely, sema (whirling) on special dates',
      es: 'Urs (aniversario de muerte del santo), Mawlid celebrado intensamente, sema (danza giratoria) en fechas especiales',
    },
    schools: {
      'pt-BR': 'Tariqas: Mevlevi (Rumi), Naqshbandi, Qadiri, Chishti, Shadhili, Tijani',
      en: 'Tariqas: Mevlevi (Rumi), Naqshbandi, Qadiri, Chishti, Shadhili, Tijani',
      es: 'Tariqas: Mevlevi (Rumi), Naqshbandi, Qadiri, Chishti, Shadhili, Tijani',
    },
  },
  {
    key: 'ibadi',
    emoji: '🟠',
    color: 'border-amber-500/40 bg-amber-500/5',
    name: { 'pt-BR': 'Ibadismo', en: 'Ibadi', es: 'Ibadismo' },
    regions: {
      'pt-BR': '~0,15%. Maioria em Omã (~75% do país); minorias em Zanzibar, Mzab (Argélia), Jerba (Tunísia), Líbia',
      en: '~0.15%. Majority in Oman (~75% of the country); minorities in Zanzibar, Mzab (Algeria), Djerba (Tunisia), Libya',
      es: '~0,15%. Mayoría en Omán (~75% del país); minorías en Zanzíbar, Mzab (Argelia), Yerba (Túnez), Libia',
    },
    authority: {
      'pt-BR': 'Imã eleito pelos eruditos pela piedade e conhecimento (não por linhagem). Tradição do Imamato em Omã',
      en: 'Imam elected by scholars based on piety and knowledge (not lineage). Imamate tradition in Oman',
      es: 'Imán elegido por los eruditos por piedad y conocimiento (no por linaje). Tradición del Imamato en Omán',
    },
    texts: {
      'pt-BR': 'Alcorão + Musnad de al-Rabi\' ibn Habib (coleção própria de Hadith) + obras de Jabir ibn Zayd',
      en: 'Qur\'an + Musnad of al-Rabi\' ibn Habib (own Hadith collection) + works of Jabir ibn Zayd',
      es: 'Corán + Musnad de al-Rabi\' ibn Habib (colección propia de Hadiz) + obras de Jabir ibn Zayd',
    },
    festivals: {
      'pt-BR': 'Eid al-Fitr e Eid al-Adha (sem celebrar Ashura nem Mawlid, considerados inovações)',
      en: 'Eid al-Fitr and Eid al-Adha (no Ashura or Mawlid, considered innovations)',
      es: 'Eid al-Fitr y Eid al-Adha (sin Ashura ni Mawlid, considerados innovaciones)',
    },
    schools: {
      'pt-BR': 'Escola jurídica única (Ibadi); descendente moderado dos Kharijitas, rejeita extremismo',
      en: 'Single legal school (Ibadi); moderate descendant of the Kharijites, rejects extremism',
      es: 'Escuela jurídica única (Ibadi); descendiente moderado de los Jariyíes, rechaza el extremismo',
    },
  },
];

const ROW_LABELS: Record<'regions' | 'authority' | 'texts' | 'festivals' | 'schools', Record<Lang, string>> = {
  regions: { 'pt-BR': 'Regiões e %', en: 'Regions & %', es: 'Regiones y %' },
  authority: { 'pt-BR': 'Autoridade religiosa', en: 'Religious authority', es: 'Autoridad religiosa' },
  texts: { 'pt-BR': 'Textos complementares', en: 'Complementary texts', es: 'Textos complementarios' },
  festivals: { 'pt-BR': 'Festividades distintivas', en: 'Distinctive festivals', es: 'Festividades distintivas' },
  schools: { 'pt-BR': 'Escolas / Ordens', en: 'Schools / Orders', es: 'Escuelas / Órdenes' },
};

const TITLE: Record<Lang, string> = {
  'pt-BR': 'As 4 grandes vertentes do Islã',
  en: 'The 4 major branches of Islam',
  es: 'Las 4 grandes vertientes del Islam',
};

const SUBTITLE: Record<Lang, string> = {
  'pt-BR': 'Comparativo visual lado a lado',
  en: 'Side-by-side visual comparison',
  es: 'Comparativo visual lado a lado',
};

interface Props {
  compact?: boolean;
}

export default function IslamBranchesComparison({ compact = false }: Props) {
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
              {(['regions', 'authority', 'texts', 'festivals', 'schools'] as const).map(field => (
                <div key={field} className="text-xs">
                  <dt className="text-muted-foreground font-medium">{ROW_LABELS[field][lang]}</dt>
                  <dd className="text-foreground/90 leading-snug">{b[field][lang]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      {/* Desktop: 5-column table (label + 4 branches) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-3 text-xs font-medium text-muted-foreground w-[16%]"></th>
              {BRANCHES.map(b => (
                <th key={b.key} className={`text-left p-3 font-display font-semibold text-foreground border-l border-border ${b.color}`}>
                  <span className="mr-1.5">{b.emoji}</span>
                  <span>{b.name[lang]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(['regions', 'authority', 'texts', 'festivals', 'schools'] as const).map((field, i) => (
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
