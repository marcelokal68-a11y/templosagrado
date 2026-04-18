import { useApp } from '@/contexts/AppContext';

type Lang = 'pt-BR' | 'en' | 'es';

type Branch = {
  key: string;
  emoji: string;
  color: string;
  name: Record<Lang, string>;
  origin: Record<Lang, string>;
  halacha: Record<Lang, string>;
  women: Record<Lang, string>;
  liturgy: Record<Lang, string>;
  figures: Record<Lang, string>;
};

const BRANCHES: Branch[] = [
  {
    key: 'orthodox',
    emoji: '🔵',
    color: 'border-sky-600/40 bg-sky-600/5',
    name: { 'pt-BR': 'Ortodoxo', en: 'Orthodox', es: 'Ortodoxo' },
    origin: {
      'pt-BR': 'Continuidade do judaísmo rabínico clássico. Como movimento autoconsciente, surge no séc. XIX como reação à Haskalá e à Reforma (Rabino Moshe Sofer / Chatam Sofer, 1762–1839). Inclui Moderno (Hirsch, Soloveitchik), Haredi e Hassídico (Baal Shem Tov, séc. XVIII).',
      en: 'Continuation of classical rabbinic Judaism. As a self-conscious movement, emerges in the 19th c. as a reaction to the Haskalah and Reform (Rabbi Moshe Sofer / Chatam Sofer, 1762–1839). Includes Modern (Hirsch, Soloveitchik), Haredi and Hasidic (Baal Shem Tov, 18th c.).',
      es: 'Continuidad del judaísmo rabínico clásico. Como movimiento autoconsciente, surge en el s. XIX como reacción a la Haskalá y a la Reforma (Rabino Moshe Sofer / Jatam Sofer, 1762–1839). Incluye Moderno (Hirsch, Soloveitchik), Haredí y Jasídico (Baal Shem Tov, s. XVIII).',
    },
    halacha: {
      'pt-BR': 'Halachá (lei judaica) é vinculante e divinamente revelada. Torá Escrita e Oral (Talmud) imutáveis. Codificação no Shulchan Aruch (Yosef Karo, 1565). Mudanças só por consenso rabínico estrito.',
      en: 'Halakha (Jewish law) is binding and divinely revealed. Written and Oral Torah (Talmud) are immutable. Codified in the Shulchan Arukh (Yosef Karo, 1565). Changes only by strict rabbinic consensus.',
      es: 'Halajá (ley judía) es vinculante y divinamente revelada. Torá Escrita y Oral (Talmud) inmutables. Codificada en el Shulján Aruj (Yosef Karo, 1565). Cambios solo por estricto consenso rabínico.',
    },
    women: {
      'pt-BR': 'Mechitsá (separação) na sinagoga. Mulheres não contam no minyan, não leem Torá no público misto, não são ordenadas como rabinas. Ênfase em casa, família e tzniut (modéstia).',
      en: 'Mechitzah (separation) in synagogue. Women not counted in minyan, do not read Torah in mixed public, not ordained as rabbis. Emphasis on home, family, and tzniut (modesty).',
      es: 'Mejitzá (separación) en la sinagoga. Mujeres no cuentan en el minyán, no leen Torá en público mixto, no son ordenadas como rabinas. Énfasis en hogar, familia y tzniut (modestia).',
    },
    liturgy: {
      'pt-BR': 'Inteiramente em hebraico (e aramaico). Nusach tradicional (Ashkenazi, Sefaradi, Edot HaMizrach). Sem instrumentos no Shabat. 3 orações diárias completas: Shacharit, Mincha, Maariv.',
      en: 'Entirely in Hebrew (and Aramaic). Traditional nusach (Ashkenazi, Sephardi, Edot HaMizrach). No instruments on Shabbat. 3 full daily prayers: Shacharit, Mincha, Maariv.',
      es: 'Totalmente en hebreo (y arameo). Nusaj tradicional (Asquenazí, Sefaradí, Edot HaMizraj). Sin instrumentos en Shabat. 3 oraciones diarias completas: Shajarit, Minjá, Maariv.',
    },
    figures: {
      'pt-BR': 'Joseph B. Soloveitchik (Modern Orthodox, MIT/YU), Menachem M. Schneerson (Rebe de Lubavitch/Chabad), Ovadia Yosef (sefaradi, Israel), Rav Kook (sionismo religioso)',
      en: 'Joseph B. Soloveitchik (Modern Orthodox, MIT/YU), Menachem M. Schneerson (Lubavitcher Rebbe/Chabad), Ovadia Yosef (Sephardi, Israel), Rav Kook (religious Zionism)',
      es: 'Joseph B. Soloveitchik (Ortodoxo Moderno, MIT/YU), Menachem M. Schneerson (Rebe de Lubavitch/Jabad), Ovadia Yosef (sefaradí, Israel), Rav Kook (sionismo religioso)',
    },
  },
  {
    key: 'conservative',
    emoji: '🟣',
    color: 'border-violet-500/40 bg-violet-500/5',
    name: { 'pt-BR': 'Conservador (Masorti)', en: 'Conservative (Masorti)', es: 'Conservador (Masortí)' },
    origin: {
      'pt-BR': 'Surge do judaísmo positivo-histórico de Zacharias Frankel (Breslau, 1854). Institucionalizado nos EUA por Solomon Schechter no Jewish Theological Seminary (JTS, 1902). "Tradição com mudança."',
      en: 'Emerges from Zacharias Frankel\'s positive-historical Judaism (Breslau, 1854). Institutionalized in the U.S. by Solomon Schechter at the Jewish Theological Seminary (JTS, 1902). "Tradition with change."',
      es: 'Surge del judaísmo positivo-histórico de Zacharias Frankel (Breslavia, 1854). Institucionalizado en EE. UU. por Solomon Schechter en el Jewish Theological Seminary (JTS, 1902). "Tradición con cambio."',
    },
    halacha: {
      'pt-BR': 'Halachá é vinculante mas evolui historicamente. Comitê de Lei Judaica e Padrões (CJLS) emite teshuvot. Permite dirigir ao Shabat para a sinagoga (1950), eletricidade etc.',
      en: 'Halakha is binding but evolves historically. Committee on Jewish Law and Standards (CJLS) issues teshuvot. Permits driving to synagogue on Shabbat (1950), electricity, etc.',
      es: 'Halajá es vinculante pero evoluciona históricamente. Comité de Ley Judía y Normas (CJLS) emite teshuvot. Permite conducir a la sinagoga en Shabat (1950), electricidad, etc.',
    },
    women: {
      'pt-BR': 'Igualitário desde 1983: mulheres rabinas, contam no minyan, leem Torá. Sem mechitsá. Em 2006, aprovação de uniões same-sex e ordenação de rabinos LGBT.',
      en: 'Egalitarian since 1983: women rabbis, count in minyan, read Torah. No mechitzah. In 2006, approval of same-sex unions and ordination of LGBT rabbis.',
      es: 'Igualitario desde 1983: mujeres rabinas, cuentan en el minyán, leen Torá. Sin mejitzá. En 2006, aprobación de uniones del mismo sexo y ordenación de rabinos LGBT.',
    },
    liturgy: {
      'pt-BR': 'Maioria em hebraico, com leituras e sermões em vernáculo. Coro e às vezes órgão (sem instrumentos no Shabat estrito). Sidur Sim Shalom / Lev Shalem.',
      en: 'Mostly in Hebrew, with readings and sermons in vernacular. Choir and sometimes organ (no instruments on strict Shabbat). Siddur Sim Shalom / Lev Shalem.',
      es: 'Mayoría en hebreo, con lecturas y sermones en vernáculo. Coro y a veces órgano (sin instrumentos en Shabat estricto). Sidur Sim Shalom / Lev Shalem.',
    },
    figures: {
      'pt-BR': 'Solomon Schechter, Abraham Joshua Heschel (místico, marchou com Martin Luther King), Mordecai Kaplan (depois fundou Reconstrucionismo), Ismar Schorsch',
      en: 'Solomon Schechter, Abraham Joshua Heschel (mystic, marched with Martin Luther King), Mordecai Kaplan (later founded Reconstructionism), Ismar Schorsch',
      es: 'Solomon Schechter, Abraham Joshua Heschel (místico, marchó con Martin Luther King), Mordecai Kaplan (luego fundó Reconstruccionismo), Ismar Schorsch',
    },
  },
  {
    key: 'reform',
    emoji: '🟢',
    color: 'border-emerald-500/40 bg-emerald-500/5',
    name: { 'pt-BR': 'Reformista (Liberal)', en: 'Reform (Liberal)', es: 'Reformista (Liberal)' },
    origin: {
      'pt-BR': 'Nasce na Alemanha pós-Iluminismo: Israel Jacobson (Seesen, 1810), Hamburg Temple (1818), Abraham Geiger (séc. XIX). Plataforma de Pittsburgh (1885) nos EUA: rejeita ritual cerimonial, foca em ética profética.',
      en: 'Born in post-Enlightenment Germany: Israel Jacobson (Seesen, 1810), Hamburg Temple (1818), Abraham Geiger (19th c.). Pittsburgh Platform (1885) in the U.S.: rejects ceremonial ritual, focuses on prophetic ethics.',
      es: 'Nace en la Alemania post-Ilustración: Israel Jacobson (Seesen, 1810), Templo de Hamburgo (1818), Abraham Geiger (s. XIX). Plataforma de Pittsburgh (1885) en EE. UU.: rechaza ritual ceremonial, se centra en ética profética.',
    },
    halacha: {
      'pt-BR': 'Halachá é orientadora, não vinculante. Autonomia individual informada. Princípios éticos da Torá são eternos; rituais são adaptáveis. Tikun Olam (reparo do mundo) é central.',
      en: 'Halakha is guiding, not binding. Informed individual autonomy. Torah ethical principles are eternal; rituals are adaptable. Tikkun Olam (repairing the world) is central.',
      es: 'Halajá es orientadora, no vinculante. Autonomía individual informada. Principios éticos de la Torá son eternos; rituales son adaptables. Tikún Olam (reparación del mundo) es central.',
    },
    women: {
      'pt-BR': 'Igualitarismo total desde Sally Priesand (1ª rabina, 1972, HUC). Aceita patrilinearidade (1983), casamentos inter-religiosos (parcial), ordenação LGBT desde 1990, casamento same-sex desde 2000.',
      en: 'Full egalitarianism since Sally Priesand (1st female rabbi, 1972, HUC). Accepts patrilineality (1983), interfaith marriages (partial), LGBT ordination since 1990, same-sex marriage since 2000.',
      es: 'Igualitarismo total desde Sally Priesand (1.ª rabina, 1972, HUC). Acepta patrilinealidad (1983), matrimonios interreligiosos (parcial), ordenación LGBT desde 1990, matrimonio del mismo sexo desde 2000.',
    },
    liturgy: {
      'pt-BR': 'Bilíngue (vernáculo + hebraico). Órgão, coro misto e instrumentos no Shabat. Serviços mais curtos. Mishkan T\'filah (sidur, 2007). Sem kipá ou tefilin obrigatórios (opcional).',
      en: 'Bilingual (vernacular + Hebrew). Organ, mixed choir, and instruments on Shabbat. Shorter services. Mishkan T\'filah (siddur, 2007). No mandatory kippah or tefillin (optional).',
      es: 'Bilingüe (vernáculo + hebreo). Órgano, coro mixto e instrumentos en Shabat. Servicios más cortos. Mishkán T\'filá (sidur, 2007). Sin kipá ni tefilín obligatorios (opcional).',
    },
    figures: {
      'pt-BR': 'Abraham Geiger, Isaac Mayer Wise (HUC, 1875), Stephen Wise, Eugene Borowitz, Regina Jonas (1ª rabina ordenada, 1935, morta em Auschwitz), Rick Jacobs (URJ atual)',
      en: 'Abraham Geiger, Isaac Mayer Wise (HUC, 1875), Stephen Wise, Eugene Borowitz, Regina Jonas (1st ordained woman rabbi, 1935, killed at Auschwitz), Rick Jacobs (current URJ)',
      es: 'Abraham Geiger, Isaac Mayer Wise (HUC, 1875), Stephen Wise, Eugene Borowitz, Regina Jonas (1.ª rabina ordenada, 1935, asesinada en Auschwitz), Rick Jacobs (URJ actual)',
    },
  },
];

const ROW_LABELS: Record<'origin' | 'halacha' | 'women' | 'liturgy' | 'figures', Record<Lang, string>> = {
  origin: { 'pt-BR': 'Origem histórica', en: 'Historical origin', es: 'Origen histórico' },
  halacha: { 'pt-BR': 'Posição sobre Halachá', en: 'Stance on Halakha', es: 'Posición sobre Halajá' },
  women: { 'pt-BR': 'Papel da mulher', en: 'Role of women', es: 'Papel de la mujer' },
  liturgy: { 'pt-BR': 'Liturgia', en: 'Liturgy', es: 'Liturgia' },
  figures: { 'pt-BR': 'Expoentes modernos', en: 'Modern figures', es: 'Exponentes modernos' },
};

const TITLE: Record<Lang, string> = {
  'pt-BR': 'As 3 grandes vertentes do Judaísmo',
  en: 'The 3 major branches of Judaism',
  es: 'Las 3 grandes vertientes del Judaísmo',
};

const SUBTITLE: Record<Lang, string> = {
  'pt-BR': 'Comparativo visual lado a lado',
  en: 'Side-by-side visual comparison',
  es: 'Comparativo visual lado a lado',
};

interface Props {
  compact?: boolean;
}

export default function JewishBranchesComparison({ compact = false }: Props) {
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
              {(['origin', 'halacha', 'women', 'liturgy', 'figures'] as const).map(field => (
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
        <table className="w-full text-sm min-w-[720px]">
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
            {(['origin', 'halacha', 'women', 'liturgy', 'figures'] as const).map((field, i) => (
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
