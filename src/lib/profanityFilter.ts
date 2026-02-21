// Basic profanity filter for multiple languages
// This list is intentionally limited - a more robust solution would use AI moderation
const BLOCKED_WORDS = [
  // Portuguese
  'porra', 'caralho', 'foda', 'fodase', 'puta', 'merda', 'cuzao', 'viado',
  'arrombado', 'desgraca', 'filho da puta', 'fdp', 'vtnc', 'vsf', 'tnc',
  // Spanish
  'mierda', 'puto', 'pendejo', 'cabron', 'chingada', 'coño', 'joder', 'marica',
  // English
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'cunt', 'dick', 'nigger', 'faggot',
  // Hate/discrimination terms (multi-language)
  'nazista', 'nazi', 'terrorista', 'macaco', 'macaca',
];

export function containsProfanity(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s]/g, ' ');

  return BLOCKED_WORDS.some(word => {
    const normalizedWord = word
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    // Check word boundaries
    const regex = new RegExp(`\\b${normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(normalized);
  });
}
