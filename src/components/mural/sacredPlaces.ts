export interface SacredPlaceInfo {
  religion: string;
  name: Record<string, string>;
  subtitle: Record<string, string>;
  imageUrl: string;
}

export const SACRED_PLACES: SacredPlaceInfo[] = [
  {
    religion: 'jewish',
    name: { 'pt-BR': 'Muro das Lamentações', en: 'Western Wall', es: 'Muro de los Lamentos' },
    subtitle: { 'pt-BR': 'Deposite aqui sua oração, como fazem os fiéis em Jerusalém', en: 'Place your prayer here, as the faithful do in Jerusalem', es: 'Deposita aquí tu oración, como hacen los fieles en Jerusalén' },
    imageUrl: 'https://images.unsplash.com/photo-1547483238-2cbf881a559f?w=1200&q=80',
  },
  {
    religion: 'catholic',
    name: { 'pt-BR': 'Basílica de São Pedro', en: "St. Peter's Basilica", es: 'Basílica de San Pedro' },
    subtitle: { 'pt-BR': 'Acenda uma vela e deixe sua prece neste santuário', en: 'Light a candle and leave your prayer in this sanctuary', es: 'Enciende una vela y deja tu oración en este santuario' },
    imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1200&q=80',
  },
  {
    religion: 'protestant',
    name: { 'pt-BR': 'Igreja Reformada', en: 'Reformed Church', es: 'Iglesia Reformada' },
    subtitle: { 'pt-BR': 'Deixe seu bilhete no púlpito da Palavra', en: 'Leave your note at the pulpit of the Word', es: 'Deja tu nota en el púlpito de la Palabra' },
    imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80',
  },
  {
    religion: 'christian',
    name: { 'pt-BR': 'Igreja de Cristo', en: 'Church of Christ', es: 'Iglesia de Cristo' },
    subtitle: { 'pt-BR': 'Aos pés da Cruz, deposite sua oração', en: 'At the foot of the Cross, place your prayer', es: 'Al pie de la Cruz, deposita tu oración' },
    imageUrl: 'https://images.unsplash.com/photo-1445445290350-18a3b86e0b5a?w=1200&q=80',
  },
  {
    religion: 'mormon',
    name: { 'pt-BR': 'Templo de Salt Lake', en: 'Salt Lake Temple', es: 'Templo de Salt Lake' },
    subtitle: { 'pt-BR': 'Confie sua oração a este templo sagrado', en: 'Entrust your prayer to this sacred temple', es: 'Confía tu oración a este templo sagrado' },
    imageUrl: 'https://images.unsplash.com/photo-1617415400483-5765e3626a34?w=1200&q=80',
  },
  {
    religion: 'islam',
    name: { 'pt-BR': 'Grande Mesquita de Meca', en: 'Grand Mosque of Mecca', es: 'Gran Mezquita de La Meca' },
    subtitle: { 'pt-BR': 'Deposite sua du\'a junto à Kaaba', en: 'Place your du\'a near the Kaaba', es: 'Deposita tu du\'a junto a la Kaaba' },
    imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=80',
  },
  {
    religion: 'buddhist',
    name: { 'pt-BR': 'Árvore Bodhi', en: 'Bodhi Tree', es: 'Árbol Bodhi' },
    subtitle: { 'pt-BR': 'Pendure sua intenção na árvore da iluminação', en: 'Hang your intention on the tree of enlightenment', es: 'Cuelga tu intención en el árbol de la iluminación' },
    imageUrl: 'https://images.unsplash.com/photo-1545290024-1f15cd093fcc?w=1200&q=80',
  },
  {
    religion: 'hindu',
    name: { 'pt-BR': 'Margem do Ganges', en: 'Banks of the Ganges', es: 'Orillas del Ganges' },
    subtitle: { 'pt-BR': 'Solte sua prece nas águas sagradas', en: 'Release your prayer into the sacred waters', es: 'Suelta tu oración en las aguas sagradas' },
    imageUrl: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1200&q=80',
  },
  {
    religion: 'spiritist',
    name: { 'pt-BR': 'Centro Espírita', en: 'Spiritist Center', es: 'Centro Espírita' },
    subtitle: { 'pt-BR': 'Deposite sua prece na mesa de passes', en: 'Place your prayer at the healing table', es: 'Deposita tu oración en la mesa de pases' },
    imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1200&q=80',
  },
  {
    religion: 'umbanda',
    name: { 'pt-BR': 'Terreiro de Umbanda', en: 'Umbanda Temple', es: 'Templo de Umbanda' },
    subtitle: { 'pt-BR': 'Deixe seu pedido junto às velas sagradas', en: 'Leave your request beside the sacred candles', es: 'Deja tu pedido junto a las velas sagradas' },
    imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1200&q=80',
  },
  {
    religion: 'candomble',
    name: { 'pt-BR': 'Árvore Sagrada (Iroko)', en: 'Sacred Tree (Iroko)', es: 'Árbol Sagrado (Iroko)' },
    subtitle: { 'pt-BR': 'Ofereça sua prece à árvore dos ancestrais', en: 'Offer your prayer to the tree of ancestors', es: 'Ofrece tu oración al árbol de los ancestros' },
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80',
  },
  {
    religion: 'agnostic',
    name: { 'pt-BR': 'Universo', en: 'Universe', es: 'Universo' },
    subtitle: { 'pt-BR': 'Solte seu pensamento nas estrelas', en: 'Release your thought into the stars', es: 'Suelta tu pensamiento en las estrellas' },
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80',
  },
];

export function getSacredPlace(religion: string): SacredPlaceInfo {
  return SACRED_PLACES.find(p => p.religion === religion) || {
    religion: 'ecumenical',
    name: { 'pt-BR': 'Encontro Ecumênico', en: 'Ecumenical Meeting', es: 'Encuentro Ecuménico' },
    subtitle: { 'pt-BR': 'Todas as tradições, uma só humanidade', en: 'All traditions, one humanity', es: 'Todas las tradiciones, una sola humanidad' },
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
  };
}
