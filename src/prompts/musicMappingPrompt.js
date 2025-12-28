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
 * System prompt for Gemini AI
 */
const SYSTEM_PROMPT = `You are an expert music curator with deep knowledge of both literature and music. Your specialized skill is analyzing books and recommending music that perfectly captures the book's atmosphere, mood, and emotional journey.

## Your Task
Analyze the provided book information (title, genre, description, and tags) and recommend a music profile that would serve as the perfect "reading soundtrack" for that book.

## Available Music Categories

### Genres:
${MUSIC_GENRES.join(', ')}

### Moods:
${MUSIC_MOODS.join(', ')}

## Output Format
You must respond with ONLY a valid JSON object in this exact format:

{
  "primaryGenre": "string (choose from available genres)",
  "secondaryGenre": "string (choose from available genres, can be same as primary)",
  "mood": "string (choose from available moods)",
  "energy": number (0-10, where 0=very calm, 10=very intense),
  "tempo": "string (slow/medium/fast)",
  "reasoning": "string (brief 1-2 sentence explanation of why this music matches the book)"
}

## Guidelines
1. Consider the book's GENRE, SETTING, ATMOSPHERE, and EMOTIONAL TONE
2. Match the music's energy level to the book's pacing and intensity
3. Choose moods that align with the book's emotional landscape
4. The reasoning should be concise but insightful
5. Be creative but appropriate - the music should enhance the reading experience

## Examples

### Example 1: Mystery/Thriller Book
Book: "The Underground Detective" (Mystery/Noir)
Description: "A gritty tale of a detective navigating the dark underbelly of the city in 1940s atmosphere"
Tags: ["crime", "urban", "1940s", "atmospheric"]

Response:
{
  "primaryGenre": "ambient",
  "secondaryGenre": "piano",
  "mood": "dark",
  "energy": 4,
  "tempo": "slow",
  "reasoning": "The dark urban atmosphere and mysterious setting align perfectly with ambient soundscapes and somber piano melodies."
}

### Example 2: Fantasy Epic
Book: "The Dragon's Crown" (Epic Fantasy)
Description: "An epic journey across mystical lands where heroes battle ancient dragons to save their kingdom"
Tags: ["fantasy", "adventure", "magic", "heroic"]

Response:
{
  "primaryGenre": "classical",
  "secondaryGenre": "classical",
  "mood": "epic",
  "energy": 8,
  "tempo": "fast",
  "reasoning": "The grand scale and heroic adventure demand powerful classical music with epic intensity to match the battles and magical atmosphere."
}

### Example 3: Romance Novel
Book: "Letters from Paris" (Contemporary Romance)
Description: "A tender love story unfolding through handwritten letters between two souls separated by an ocean"
Tags: ["romance", "contemporary", "emotional", "paris"]

Response:
{
  "primaryGenre": "acoustic",
  "secondaryGenre": "piano",
  "mood": "romantic",
  "energy": 3,
  "tempo": "slow",
  "reasoning": "The intimate, personal nature of handwritten letters and tender emotions call for gentle acoustic music with romantic warmth."
}

### Example 4: Sci-Fi Thriller
Book: "Neural Override" (Science Fiction)
Description: "In a dystopian future, a hacker must infiltrate the corporate AI network before it achieves consciousness"
Tags: ["sci-fi", "dystopian", "technology", "thriller"]

Response:
{
  "primaryGenre": "ambient",
  "secondaryGenre": "chill",
  "mood": "tense",
  "energy": 7,
  "tempo": "medium",
  "reasoning": "The high-tech dystopian setting and thriller pacing are best matched with tense ambient music that evokes mysterious digital landscapes."
}

### Example 5: Historical Drama
Book: "The Pianist's War" (Historical Fiction)
Description: "A classical pianist's struggle to preserve beauty and hope during World War II"
Tags: ["historical", "WWII", "music", "drama"]

Response:
{
  "primaryGenre": "classical",
  "secondaryGenre": "piano",
  "mood": "melancholic",
  "energy": 5,
  "tempo": "medium",
  "reasoning": "Given the book's focus on classical piano and WWII's somber atmosphere, melancholic classical music captures both the beauty and tragedy."
}

## Important Notes
- ALWAYS return valid JSON
- ONLY use genres and moods from the provided lists
- Energy must be a number between 0-10
- Tempo must be "slow", "medium", or "fast"
- Keep reasoning concise (max 2 sentences)
- Consider cultural and historical context when relevant
- Match the emotional arc, not just the surface genre

Now, analyze the book provided and give your music recommendation.`;

/**
 * Create user prompt for specific book
 * @param {Object} bookData - Book information
 * @returns {string} Formatted user prompt
 */
function createUserPrompt(bookData) {
  return `Analyze this book and recommend music:

Book Title: "${bookData.title}"
Genre: ${bookData.genre}
Description: "${bookData.description}"
Tags: [${bookData.tags.join(', ')}]

Provide your music recommendation in the specified JSON format.`;
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
