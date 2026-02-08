/**
 * 타로 카드 덱 데이터 (krates98/tarotcardapi 기반)
 * https://github.com/krates98/tarotcardapi
 * 이미지: https://raw.githubusercontent.com/krates98/tarotcardapi/main/images/{imageFile}
 */

const IMAGE_BASE = 'https://raw.githubusercontent.com/krates98/tarotcardapi/main/images';

/** name, imageFile(덱 내 파일명), meaningShort(요약) */
export const TAROT_DECK = [
  { name: 'The Fool', imageFile: 'thefool.jpeg', meaningShort: 'New beginnings, adventure, trust your instincts.' },
  { name: 'The Magician', imageFile: 'themagician.jpeg', meaningShort: 'Power, skill, manifestation of goals.' },
  { name: 'The High Priestess', imageFile: 'thehighpriestess.jpeg', meaningShort: 'Intuition, mystery, hidden knowledge.' },
  { name: 'The Empress', imageFile: 'theempress.jpeg', meaningShort: 'Abundance, nurturing, prosperity.' },
  { name: 'The Emperor', imageFile: 'theemperor.jpeg', meaningShort: 'Authority, structure, stability.' },
  { name: 'The Hierophant', imageFile: 'thehierophant.jpeg', meaningShort: 'Tradition, spirituality, teaching.' },
  { name: 'The Lovers', imageFile: 'TheLovers.jpg', meaningShort: 'Partnership, choice, alignment with values.' },
  { name: 'The Chariot', imageFile: 'thechariot.jpeg', meaningShort: 'Determination, willpower, victory.' },
  { name: 'Strength', imageFile: 'thestrength.jpeg', meaningShort: 'Courage, inner power, resilience.' },
  { name: 'The Hermit', imageFile: 'thehermit.jpeg', meaningShort: 'Introspection, wisdom, inner guidance.' },
  { name: 'Wheel of Fortune', imageFile: 'wheeloffortune.jpeg', meaningShort: 'Cycles, change, destiny.' },
  { name: 'Justice', imageFile: 'justice.jpeg', meaningShort: 'Fairness, truth, cause and effect.' },
  { name: 'The Hanged Man', imageFile: 'thehangedman.jpeg', meaningShort: 'Pause, surrender, new perspective.' },
  { name: 'Death', imageFile: 'death.jpeg', meaningShort: 'Transformation, endings, new beginnings.' },
  { name: 'Temperance', imageFile: 'temperance.jpeg', meaningShort: 'Balance, moderation, harmony.' },
  { name: 'The Devil', imageFile: 'thedevil.jpeg', meaningShort: 'Temptation, bondage, breaking free.' },
  { name: 'The Tower', imageFile: 'thetower.jpeg', meaningShort: 'Sudden change, upheaval, revelation.' },
  { name: 'The Star', imageFile: 'thestar.jpeg', meaningShort: 'Hope, inspiration, renewal.' },
  { name: 'The Moon', imageFile: 'themoon.jpeg', meaningShort: 'Intuition, illusion, the subconscious.' },
  { name: 'The Sun', imageFile: 'thesun.jpeg', meaningShort: 'Success, joy, vitality.' },
  { name: 'Judgement', imageFile: 'judgement.jpeg', meaningShort: 'Evaluation, rebirth, calling.' },
  { name: 'The World', imageFile: 'theworld.jpeg', meaningShort: 'Completion, wholeness, achievement.' },
  { name: 'Ace of Cups', imageFile: 'aceofcups.jpeg', meaningShort: 'New emotional beginnings, intuition.' },
  { name: 'Two of Cups', imageFile: 'twoofcups.jpeg', meaningShort: 'Partnership, connection, mutual benefit.' },
  { name: 'Three of Cups', imageFile: 'threeofcups.jpeg', meaningShort: 'Celebration, friendship, abundance.' },
  { name: 'Four of Cups', imageFile: 'fourofcups.jpeg', meaningShort: 'Contemplation, reassessment.' },
  { name: 'Five of Cups', imageFile: 'fiveofcups.jpeg', meaningShort: 'Loss, grief, resilience.' },
  { name: 'Six of Cups', imageFile: 'sixofcups.jpeg', meaningShort: 'Nostalgia, past influences.' },
  { name: 'Seven of Cups', imageFile: 'sevenofcups.jpeg', meaningShort: 'Choices, illusion, discernment.' },
  { name: 'Eight of Cups', imageFile: 'eightofcups.jpeg', meaningShort: 'Transition, letting go.' },
  { name: 'Nine of Cups', imageFile: 'nineofcups.jpeg', meaningShort: 'Fulfillment, satisfaction, wishes.' },
  { name: 'Ten of Cups', imageFile: 'tenofcups.jpeg', meaningShort: 'Emotional fulfillment, harmony.' },
  { name: 'Page of Cups', imageFile: 'pageofcups.jpeg', meaningShort: 'Creativity, new ideas, intuition.' },
  { name: 'Knight of Cups', imageFile: 'knightofcups.jpeg', meaningShort: 'Romance, idealism, following the heart.' },
  { name: 'Queen of Cups', imageFile: 'queenofcups.jpeg', meaningShort: 'Compassion, empathy, inner feeling.' },
  { name: 'King of Cups', imageFile: 'kingofcups.jpeg', meaningShort: 'Emotional balance, diplomacy.' },
  { name: 'Ace of Wands', imageFile: 'aceofwands.jpeg', meaningShort: 'Inspiration, new energy, potential.' },
  { name: 'Two of Wands', imageFile: 'twoofwands.jpeg', meaningShort: 'Planning, discovery, bold choices.' },
  { name: 'Three of Wands', imageFile: 'threeofwands.jpeg', meaningShort: 'Expansion, foresight, opportunity.' },
  { name: 'Four of Wands', imageFile: 'fourofwands.jpeg', meaningShort: 'Celebration, stability, home.' },
  { name: 'Five of Wands', imageFile: 'fiveofwands.jpeg', meaningShort: 'Conflict, competition, tension.' },
  { name: 'Six of Wands', imageFile: 'sixofwands.jpeg', meaningShort: 'Victory, recognition, success.' },
  { name: 'Seven of Wands', imageFile: 'sevenofwands.jpeg', meaningShort: 'Defense, perseverance, standing ground.' },
  { name: 'Eight of Wands', imageFile: 'eightofwands.jpeg', meaningShort: 'Swift movement, fast change.' },
  { name: 'Nine of Wands', imageFile: 'nineofwands.jpeg', meaningShort: 'Resilience, courage, boundaries.' },
  { name: 'Ten of Wands', imageFile: 'tenofwands.jpeg', meaningShort: 'Burden, responsibility, release.' },
  { name: 'Page of Wands', imageFile: 'pageofwands.jpeg', meaningShort: 'Exploration, enthusiasm, discovery.' },
  { name: 'Knight of Wands', imageFile: 'knightofwands.jpeg', meaningShort: 'Action, adventure, passion.' },
  { name: 'Queen of Wands', imageFile: 'queenofwands.jpeg', meaningShort: 'Confidence, courage, determination.' },
  { name: 'King of Wands', imageFile: 'kingofwands.jpeg', meaningShort: 'Leadership, vision, entrepreneur.' },
  { name: 'Ace of Swords', imageFile: 'aceofswords.jpeg', meaningShort: 'Clarity, breakthrough, new ideas.' },
  { name: 'Two of Swords', imageFile: 'twoofswords.jpeg', meaningShort: 'Difficult decisions, stalemate.' },
  { name: 'Three of Swords', imageFile: 'threeofswords.jpeg', meaningShort: 'Heartbreak, grief, release.' },
  { name: 'Four of Swords', imageFile: 'fourofswords.jpeg', meaningShort: 'Rest, recuperation, reflection.' },
  { name: 'Five of Swords', imageFile: 'fiveofswords.jpeg', meaningShort: 'Conflict, tension, win at cost.' },
  { name: 'Six of Swords', imageFile: 'sixofswords.jpeg', meaningShort: 'Transition, moving on, calmer waters.' },
  { name: 'Seven of Swords', imageFile: 'sevenofswords.jpeg', meaningShort: 'Strategy, caution, independence.' },
  { name: 'Eight of Swords', imageFile: 'eightofswords.jpeg', meaningShort: 'Restriction, self-limiting beliefs.' },
  { name: 'Nine of Swords', imageFile: 'nineofswords.jpeg', meaningShort: 'Anxiety, worry, fear.' },
  { name: 'Ten of Swords', imageFile: 'tenofswords.jpeg', meaningShort: 'Endings, rock bottom, release.' },
  { name: 'Page of Swords', imageFile: 'pageofswords.jpeg', meaningShort: 'New ideas, curiosity, vigilance.' },
  { name: 'Knight of Swords', imageFile: 'knightofswords.jpeg', meaningShort: 'Action, impulse, assertiveness.' },
  { name: 'Queen of Swords', imageFile: 'queenofswords.jpeg', meaningShort: 'Clarity, independence, direct communication.' },
  { name: 'King of Swords', imageFile: 'kingofswords.jpeg', meaningShort: 'Mental clarity, authority, truth.' },
  { name: 'Ace of Pentacles', imageFile: 'aceofpentacles.jpeg', meaningShort: 'New financial or physical opportunity.' },
  { name: 'Two of Pentacles', imageFile: 'twoofpentacles.jpeg', meaningShort: 'Balance, adaptability, multitasking.' },
  { name: 'Three of Pentacles', imageFile: 'threeofpentacles.jpeg', meaningShort: 'Teamwork, collaboration, skill.' },
  { name: 'Four of Pentacles', imageFile: 'fourofpentacles.jpeg', meaningShort: 'Security, control, saving.' },
  { name: 'Five of Pentacles', imageFile: 'fiveofpentacles.jpeg', meaningShort: 'Hardship, exclusion, support.' },
  { name: 'Six of Pentacles', imageFile: 'sixofpentacles.jpeg', meaningShort: 'Generosity, sharing, giving.' },
  { name: 'Seven of Pentacles', imageFile: 'sevenofpentacles.jpeg', meaningShort: 'Patience, long-term view, investment.' },
  { name: 'Eight of Pentacles', imageFile: 'eightofpentacles.jpeg', meaningShort: 'Mastery, diligence, craft.' },
  { name: 'Nine of Pentacles', imageFile: 'nineofpentacles.jpeg', meaningShort: 'Abundance, self-sufficiency, luxury.' },
  { name: 'Ten of Pentacles', imageFile: 'tenofpentacles.jpeg', meaningShort: 'Legacy, family, long-term security.' },
  { name: 'Page of Pentacles', imageFile: 'pageofpentacles.jpeg', meaningShort: 'Learning, new skills, opportunity.' },
  { name: 'Knight of Pentacles', imageFile: 'knightofpentacles.jpeg', meaningShort: 'Reliability, routine, hard work.' },
  { name: 'Queen of Pentacles', imageFile: 'queenofpentacles.jpeg', meaningShort: 'Nurturing, practical, grounded.' },
  { name: 'King of Pentacles', imageFile: 'kingofpentacles.jpeg', meaningShort: 'Wealth, security, leadership.' },
];

export function getImageUrl(imageFile) {
  return `${IMAGE_BASE}/${imageFile}`;
}

export function nameToId(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
