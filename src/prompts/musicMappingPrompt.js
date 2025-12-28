/**
 * Music categories available in the Music API
 * Based on actual Music API genres: acoustic, ambient, chill, classical, piano
 */

const MUSIC_GENRES = [
  'acoustic',
  'ambient',
  'chill',
  'classical',
  'piano'
];

const MUSIC_MOODS = [
  'dark',
  'uplifting',
  'melancholic',
  'energetic',
  'calm',
  'mysterious',
  'romantic',
  'epic',
  'nostalgic',
  'tense',
  'peaceful',
  'aggressive',
  'dreamy',
  'hopeful'
];

/**
 * System prompt for Gemini AI - OPTIMIZED FOR TOKEN EFFICIENCY
 */
const SYSTEM_PROMPT = `You are a music curator analyzing books to recommend soundtrack music.

## Task
Analyze book info and recommend music that captures its atmosphere and mood.

## Available Options
Genres: ${MUSIC_GENRES.join(', ')}
Moods: ${MUSIC_MOODS.join(', ')}

## Output Format (JSON ONLY)
{
  "primaryGenre": "string",
  "secondaryGenre": "string",
  "mood": "string",
  "energy": number (0-10),
  "tempo": "slow|medium|fast",
  "reasoning": "brief explanation (1 sentence)"
}

## Guidelines
- Match music energy to book pacing/intensity
- Consider genre, setting, atmosphere, emotional tone
- Use ONLY provided genres/moods
- Energy: 0=calm, 10=intense
- Reasoning: max 1 sentence

## Quick Examples
Mystery → ambient/dark/energy:4
Romance → acoustic/romantic/energy:3
Fantasy → classical/epic/energy:7
Thriller → ambient/tense/energy:7

Return ONLY valid JSON.`;

/**
 * Create user prompt for specific book - OPTIMIZED
 * @param {Object} bookData - Book information
 * @returns {string} Formatted user prompt
 */
function createUserPrompt(bookData) {
  const tagsStr = Array.isArray(bookData.tags) ? bookData.tags.join(', ') : '';
  return `Book: "${bookData.title}"
Genre: ${bookData.genre}
Description: "${bookData.description}"
Tags: ${tagsStr}

Respond with JSON only.`;
}

/**
 * Fallback rule-based mapping if Gemini fails
 * Mapped to actual available genres: acoustic, ambient, chill, classical, piano
 */
const FALLBACK_MAPPING = {
  'mystery': { primaryGenre: 'ambient', mood: 'mysterious', energy: 4, tempo: 'slow' },
  'noir': { primaryGenre: 'ambient', mood: 'dark', energy: 3, tempo: 'slow' },
  'thriller': { primaryGenre: 'piano', mood: 'tense', energy: 7, tempo: 'fast' },
  'horror': { primaryGenre: 'ambient', mood: 'dark', energy: 6, tempo: 'slow' },
  'romance': { primaryGenre: 'acoustic', mood: 'romantic', energy: 3, tempo: 'slow' },
  'fantasy': { primaryGenre: 'classical', mood: 'epic', energy: 7, tempo: 'medium' },
  'sci-fi': { primaryGenre: 'ambient', mood: 'mysterious', energy: 6, tempo: 'medium' },
  'historical': { primaryGenre: 'classical', mood: 'nostalgic', energy: 4, tempo: 'medium' },
  'comedy': { primaryGenre: 'acoustic', mood: 'uplifting', energy: 7, tempo: 'fast' },
  'drama': { primaryGenre: 'piano', mood: 'melancholic', energy: 4, tempo: 'slow' },
  'adventure': { primaryGenre: 'classical', mood: 'energetic', energy: 8, tempo: 'fast' },
  'literary': { primaryGenre: 'piano', mood: 'calm', energy: 3, tempo: 'slow' }
};

/**
 * Get fallback music profile based on book genre
 * @param {string} bookGenre - Book genre
 * @returns {Object} Music profile
 */
function getFallbackProfile(bookGenre) {
  const genreLower = bookGenre.toLowerCase();

  // Try to find matching keyword in fallback mapping
  for (const [key, profile] of Object.entries(FALLBACK_MAPPING)) {
    if (genreLower.includes(key)) {
      return {
        primaryGenre: profile.primaryGenre,
        secondaryGenre: profile.primaryGenre,
        mood: profile.mood,
        energy: profile.energy,
        tempo: profile.tempo,
        reasoning: `Fallback mapping based on "${bookGenre}" genre classification.`
      };
    }
  }

  // Ultimate fallback
  return {
    primaryGenre: 'ambient',
    secondaryGenre: 'acoustic',
    mood: 'calm',
    energy: 5,
    tempo: 'medium',
    reasoning: 'General recommendation for unknown genre.'
  };
}

module.exports = {
  SYSTEM_PROMPT,
  createUserPrompt,
  MUSIC_GENRES,
  MUSIC_MOODS,
  getFallbackProfile
};
