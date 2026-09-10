import "dotenv/config";
import { db } from "./index.js";
import { quranSurahs, quranAyahs, quranTranslations } from "./schema.js";

// All 114 surahs with metadata
const SURAH_DATA = [
  { number: 1, nameArabic: "الفاتحة", nameEnglish: "The Opening", nameTransliteration: "Al-Fatihah", totalAyahs: 7, revelationType: "Meccan" },
  { number: 2, nameArabic: "البقرة", nameEnglish: "The Cow", nameTransliteration: "Al-Baqarah", totalAyahs: 286, revelationType: "Medinan" },
  { number: 3, nameArabic: "آل عمران", nameEnglish: "The Family of Imran", nameTransliteration: "Ali 'Imran", totalAyahs: 200, revelationType: "Medinan" },
  { number: 4, nameArabic: "النساء", nameEnglish: "The Women", nameTransliteration: "An-Nisa", totalAyahs: 176, revelationType: "Medinan" },
  { number: 5, nameArabic: "المائدة", nameEnglish: "The Table Spread", nameTransliteration: "Al-Ma'idah", totalAyahs: 120, revelationType: "Medinan" },
  { number: 6, nameArabic: "الأنعام", nameEnglish: "The Cattle", nameTransliteration: "Al-An'am", totalAyahs: 165, revelationType: "Meccan" },
  { number: 7, nameArabic: "الأعراف", nameEnglish: "The Heights", nameTransliteration: "Al-A'raf", totalAyahs: 206, revelationType: "Meccan" },
  { number: 8, nameArabic: "الأنفال", nameEnglish: "The Spoils of War", nameTransliteration: "Al-Anfal", totalAyahs: 75, revelationType: "Medinan" },
  { number: 9, nameArabic: "التوبة", nameEnglish: "The Repentance", nameTransliteration: "At-Tawbah", totalAyahs: 129, revelationType: "Medinan" },
  { number: 10, nameArabic: "يونس", nameEnglish: "Jonah", nameTransliteration: "Yunus", totalAyahs: 109, revelationType: "Meccan" },
  { number: 11, nameArabic: "هود", nameEnglish: "Hud", nameTransliteration: "Hud", totalAyahs: 123, revelationType: "Meccan" },
  { number: 12, nameArabic: "يوسف", nameEnglish: "Joseph", nameTransliteration: "Yusuf", totalAyahs: 111, revelationType: "Meccan" },
  { number: 13, nameArabic: "الرعد", nameEnglish: "The Thunder", nameTransliteration: "Ar-Ra'd", totalAyahs: 43, revelationType: "Medinan" },
  { number: 14, nameArabic: "إبراهيم", nameEnglish: "Abraham", nameTransliteration: "Ibrahim", totalAyahs: 52, revelationType: "Meccan" },
  { number: 15, nameArabic: "الحجر", nameEnglish: "The Rocky Tract", nameTransliteration: "Al-Hijr", totalAyahs: 99, revelationType: "Meccan" },
  { number: 16, nameArabic: "النحل", nameEnglish: "The Bee", nameTransliteration: "An-Nahl", totalAyahs: 128, revelationType: "Meccan" },
  { number: 17, nameArabic: "الإسراء", nameEnglish: "The Night Journey", nameTransliteration: "Al-Isra", totalAyahs: 111, revelationType: "Meccan" },
  { number: 18, nameArabic: "الكهف", nameEnglish: "The Cave", nameTransliteration: "Al-Kahf", totalAyahs: 110, revelationType: "Meccan" },
  { number: 19, nameArabic: "مريم", nameEnglish: "Mary", nameTransliteration: "Maryam", totalAyahs: 98, revelationType: "Meccan" },
  { number: 20, nameArabic: "طه", nameEnglish: "Ta-Ha", nameTransliteration: "Ta-Ha", totalAyahs: 135, revelationType: "Meccan" },
  { number: 21, nameArabic: "الأنبياء", nameEnglish: "The Prophets", nameTransliteration: "Al-Anbiya", totalAyahs: 112, revelationType: "Meccan" },
  { number: 22, nameArabic: "الحج", nameEnglish: "The Pilgrimage", nameTransliteration: "Al-Hajj", totalAyahs: 78, revelationType: "Medinan" },
  { number: 23, nameArabic: "المؤمنون", nameEnglish: "The Believers", nameTransliteration: "Al-Mu'minun", totalAyahs: 118, revelationType: "Meccan" },
  { number: 24, nameArabic: "النور", nameEnglish: "The Light", nameTransliteration: "An-Nur", totalAyahs: 64, revelationType: "Medinan" },
  { number: 25, nameArabic: "الفرقان", nameEnglish: "The Criterion", nameTransliteration: "Al-Furqan", totalAyahs: 77, revelationType: "Meccan" },
  { number: 26, nameArabic: "الشعراء", nameEnglish: "The Poets", nameTransliteration: "Ash-Shu'ara", totalAyahs: 227, revelationType: "Meccan" },
  { number: 27, nameArabic: "النمل", nameEnglish: "The Ant", nameTransliteration: "An-Naml", totalAyahs: 93, revelationType: "Meccan" },
  { number: 28, nameArabic: "القصص", nameEnglish: "The Stories", nameTransliteration: "Al-Qasas", totalAyahs: 88, revelationType: "Meccan" },
  { number: 29, nameArabic: "العنكبوت", nameEnglish: "The Spider", nameTransliteration: "Al-Ankabut", totalAyahs: 69, revelationType: "Meccan" },
  { number: 30, nameArabic: "الروم", nameEnglish: "The Romans", nameTransliteration: "Ar-Rum", totalAyahs: 60, revelationType: "Meccan" },
  { number: 31, nameArabic: "لقمان", nameEnglish: "Luqman", nameTransliteration: "Luqman", totalAyahs: 34, revelationType: "Meccan" },
  { number: 32, nameArabic: "السجدة", nameEnglish: "The Prostration", nameTransliteration: "As-Sajdah", totalAyahs: 30, revelationType: "Meccan" },
  { number: 33, nameArabic: "الأحزاب", nameEnglish: "The Combined Forces", nameTransliteration: "Al-Ahzab", totalAyahs: 73, revelationType: "Medinan" },
  { number: 34, nameArabic: "سبأ", nameEnglish: "Sheba", nameTransliteration: "Saba", totalAyahs: 54, revelationType: "Meccan" },
  { number: 35, nameArabic: "فاطر", nameEnglish: "The Originator", nameTransliteration: "Fatir", totalAyahs: 45, revelationType: "Meccan" },
  { number: 36, nameArabic: "يس", nameEnglish: "Ya-Sin", nameTransliteration: "Ya-Sin", totalAyahs: 83, revelationType: "Meccan" },
  { number: 37, nameArabic: "الصافات", nameEnglish: "Those Ranks", nameTransliteration: "As-Saffat", totalAyahs: 182, revelationType: "Meccan" },
  { number: 38, nameArabic: "ص", nameEnglish: "Sad", nameTransliteration: "Sad", totalAyahs: 88, revelationType: "Meccan" },
  { number: 39, nameArabic: "الزمر", nameEnglish: "The Troops", nameTransliteration: "Az-Zumar", totalAyahs: 75, revelationType: "Meccan" },
  { number: 40, nameArabic: "غافر", nameEnglish: "The Forgiver", nameTransliteration: "Ghafir", totalAyahs: 85, revelationType: "Meccan" },
  { number: 41, nameArabic: "فصلت", nameEnglish: "Explained in Detail", nameTransliteration: "Fussilat", totalAyahs: 54, revelationType: "Meccan" },
  { number: 42, nameArabic: "الشورى", nameEnglish: "The Consultation", nameTransliteration: "Ash-Shura", totalAyahs: 53, revelationType: "Meccan" },
  { number: 43, nameArabic: "الزخرف", nameEnglish: "The Ornaments of Gold", nameTransliteration: "Az-Zukhruf", totalAyahs: 89, revelationType: "Meccan" },
  { number: 44, nameArabic: "الدخان", nameEnglish: "The Smoke", nameTransliteration: "Ad-Dukhan", totalAyahs: 59, revelationType: "Meccan" },
  { number: 45, nameArabic: "الجاثية", nameEnglish: "The Crouching", nameTransliteration: "Al-Jathiyah", totalAyahs: 37, revelationType: "Meccan" },
  { number: 46, nameArabic: "الأحقاف", nameEnglish: "The Wind-Curved Sandhills", nameTransliteration: "Al-Ahqaf", totalAyahs: 35, revelationType: "Meccan" },
  { number: 47, nameArabic: "محمد", nameEnglish: "Muhammad", nameTransliteration: "Muhammad", totalAyahs: 38, revelationType: "Medinan" },
  { number: 48, nameArabic: "الفتح", nameEnglish: "The Victory", nameTransliteration: "Al-Fath", totalAyahs: 29, revelationType: "Medinan" },
  { number: 49, nameArabic: "الحجرات", nameEnglish: "The Rooms", nameTransliteration: "Al-Hujurat", totalAyahs: 18, revelationType: "Medinan" },
  { number: 50, nameArabic: "ق", nameEnglish: "Qaf", nameTransliteration: "Qaf", totalAyahs: 45, revelationType: "Meccan" },
  { number: 51, nameArabic: "الذاريات", nameEnglish: "The Winnowing Winds", nameTransliteration: "Adh-Dhariyat", totalAyahs: 60, revelationType: "Meccan" },
  { number: 52, nameArabic: "الطور", nameEnglish: "The Mount", nameTransliteration: "At-Tur", totalAyahs: 49, revelationType: "Meccan" },
  { number: 53, nameArabic: "النجم", nameEnglish: "The Star", nameTransliteration: "An-Najm", totalAyahs: 62, revelationType: "Meccan" },
  { number: 54, nameArabic: "القمر", nameEnglish: "The Moon", nameTransliteration: "Al-Qamar", totalAyahs: 55, revelationType: "Meccan" },
  { number: 55, nameArabic: "الرحمن", nameEnglish: "The Beneficent", nameTransliteration: "Ar-Rahman", totalAyahs: 78, revelationType: "Medinan" },
  { number: 56, nameArabic: "الواقعة", nameEnglish: "The Inevitable", nameTransliteration: "Al-Waqi'ah", totalAyahs: 96, revelationType: "Meccan" },
  { number: 57, nameArabic: "الحديد", nameEnglish: "The Iron", nameTransliteration: "Al-Hadid", totalAyahs: 29, revelationType: "Medinan" },
  { number: 58, nameArabic: "المجادلة", nameEnglish: "The Pleading Woman", nameTransliteration: "Al-Mujadilah", totalAyahs: 22, revelationType: "Medinan" },
  { number: 59, nameArabic: "الحشر", nameEnglish: "The Exile", nameTransliteration: "Al-Hashr", totalAyahs: 24, revelationType: "Medinan" },
  { number: 60, nameArabic: "الممتحنة", nameEnglish: "She That is Examined", nameTransliteration: "Al-Mumtahanah", totalAyahs: 13, revelationType: "Medinan" },
  { number: 61, nameArabic: "الصف", nameEnglish: "The Ranks", nameTransliteration: "As-Saff", totalAyahs: 14, revelationType: "Medinan" },
  { number: 62, nameArabic: "الجمعة", nameEnglish: "The Congregation", nameTransliteration: "Al-Jumu'ah", totalAyahs: 11, revelationType: "Medinan" },
  { number: 63, nameArabic: "المنافقون", nameEnglish: "The Hypocrites", nameTransliteration: "Al-Munafiqun", totalAyahs: 11, revelationType: "Medinan" },
  { number: 64, nameArabic: "التغابن", nameEnglish: "The Mutual Disillusion", nameTransliteration: "At-Taghabun", totalAyahs: 18, revelationType: "Medinan" },
  { number: 65, nameArabic: "الطلاق", nameEnglish: "The Divorce", nameTransliteration: "At-Talaq", totalAyahs: 12, revelationType: "Medinan" },
  { number: 66, nameArabic: "التحريم", nameEnglish: "The Prohibition", nameTransliteration: "At-Tahrim", totalAyahs: 12, revelationType: "Medinan" },
  { number: 67, nameArabic: "الملك", nameEnglish: "The Sovereignty", nameTransliteration: "Al-Mulk", totalAyahs: 30, revelationType: "Meccan" },
  { number: 68, nameArabic: "القلم", nameEnglish: "The Pen", nameTransliteration: "Al-Qalam", totalAyahs: 52, revelationType: "Meccan" },
  { number: 69, nameArabic: "الحاقة", nameEnglish: "The Reality", nameTransliteration: "Al-Haqqah", totalAyahs: 52, revelationType: "Meccan" },
  { number: 70, nameArabic: "المعارج", nameEnglish: "The Ascending Stairways", nameTransliteration: "Al-Ma'arij", totalAyahs: 44, revelationType: "Meccan" },
  { number: 71, nameArabic: "نوح", nameEnglish: "Noah", nameTransliteration: "Nuh", totalAyahs: 28, revelationType: "Meccan" },
  { number: 72, nameArabic: "الجن", nameEnglish: "The Jinn", nameTransliteration: "Al-Jinn", totalAyahs: 28, revelationType: "Meccan" },
  { number: 73, nameArabic: "المزمل", nameEnglish: "The Enshrouded One", nameTransliteration: "Al-Muzzammil", totalAyahs: 20, revelationType: "Meccan" },
  { number: 74, nameArabic: "المدثر", nameEnglish: "The Cloaked One", nameTransliteration: "Al-Muddaththir", totalAyahs: 56, revelationType: "Meccan" },
  { number: 75, nameArabic: "القيامة", nameEnglish: "The Resurrection", nameTransliteration: "Al-Qiyamah", totalAyahs: 40, revelationType: "Meccan" },
  { number: 76, nameArabic: "الإنسان", nameEnglish: "The Human", nameTransliteration: "Al-Insan", totalAyahs: 31, revelationType: "Medinan" },
  { number: 77, nameArabic: "المرسلات", nameEnglish: "The Emissaries", nameTransliteration: "Al-Mursalat", totalAyahs: 50, revelationType: "Meccan" },
  { number: 78, nameArabic: "النبأ", nameEnglish: "The Tidings", nameTransliteration: "An-Naba", totalAyahs: 40, revelationType: "Meccan" },
  { number: 79, nameArabic: "النازعات", nameEnglish: "Those Who Drag Forth", nameTransliteration: "An-Nazi'at", totalAyahs: 46, revelationType: "Meccan" },
  { number: 80, nameArabic: "عبس", nameEnglish: "He Frowned", nameTransliteration: "Abasa", totalAyahs: 42, revelationType: "Meccan" },
  { number: 81, nameArabic: "التكوير", nameEnglish: "The Overthrowing", nameTransliteration: "At-Takwir", totalAyahs: 29, revelationType: "Meccan" },
  { number: 82, nameArabic: "الانفطار", nameEnglish: "The Cleaving", nameTransliteration: "Al-Infitar", totalAyahs: 19, revelationType: "Meccan" },
  { number: 83, nameArabic: "المطففين", nameEnglish: "The Defrauding", nameTransliteration: "Al-Mutaffifin", totalAyahs: 36, revelationType: "Meccan" },
  { number: 84, nameArabic: "الانشقاق", nameEnglish: "The Sundering", nameTransliteration: "Al-Inshiqaq", totalAyahs: 25, revelationType: "Meccan" },
  { number: 85, nameArabic: "البروج", nameEnglish: "The Mansions of the Stars", nameTransliteration: "Al-Buruj", totalAyahs: 22, revelationType: "Meccan" },
  { number: 86, nameArabic: "الطارق", nameEnglish: "The Nightcomer", nameTransliteration: "At-Tariq", totalAyahs: 17, revelationType: "Meccan" },
  { number: 87, nameArabic: "الأعلى", nameEnglish: "The Most High", nameTransliteration: "Al-A'la", totalAyahs: 19, revelationType: "Meccan" },
  { number: 88, nameArabic: "الغاشية", nameEnglish: "The Overwhelming", nameTransliteration: "Al-Ghashiyah", totalAyahs: 26, revelationType: "Meccan" },
  { number: 89, nameArabic: "الفجر", nameEnglish: "The Dawn", nameTransliteration: "Al-Fajr", totalAyahs: 30, revelationType: "Meccan" },
  { number: 90, nameArabic: "البلد", nameEnglish: "The City", nameTransliteration: "Al-Balad", totalAyahs: 20, revelationType: "Meccan" },
  { number: 91, nameArabic: "الشمس", nameEnglish: "The Sun", nameTransliteration: "Ash-Shams", totalAyahs: 15, revelationType: "Meccan" },
  { number: 92, nameArabic: "الليل", nameEnglish: "The Night", nameTransliteration: "Al-Layl", totalAyahs: 21, revelationType: "Meccan" },
  { number: 93, nameArabic: "الضحى", nameEnglish: "The Morning Hours", nameTransliteration: "Ad-Duhaa", totalAyahs: 11, revelationType: "Meccan" },
  { number: 94, nameArabic: "الشرح", nameEnglish: "The Relief", nameTransliteration: "Ash-Sharh", totalAyahs: 8, revelationType: "Meccan" },
  { number: 95, nameArabic: "التين", nameEnglish: "The Fig", nameTransliteration: "At-Tin", totalAyahs: 8, revelationType: "Meccan" },
  { number: 96, nameArabic: "العلق", nameEnglish: "The Clot", nameTransliteration: "Al-Alaq", totalAyahs: 19, revelationType: "Meccan" },
  { number: 97, nameArabic: "القدر", nameEnglish: "The Power", nameTransliteration: "Al-Qadr", totalAyahs: 5, revelationType: "Meccan" },
  { number: 98, nameArabic: "البينة", nameEnglish: "The Clear Proof", nameTransliteration: "Al-Bayyinah", totalAyahs: 8, revelationType: "Medinan" },
  { number: 99, nameArabic: "الزلزلة", nameEnglish: "The Earthquake", nameTransliteration: "Az-Zalzalah", totalAyahs: 8, revelationType: "Medinan" },
  { number: 100, nameArabic: "العاديات", nameEnglish: "The Courser", nameTransliteration: "Al-Adiyat", totalAyahs: 11, revelationType: "Meccan" },
  { number: 101, nameArabic: "القارعة", nameEnglish: "The Calamity", nameTransliteration: "Al-Qari'ah", totalAyahs: 11, revelationType: "Meccan" },
  { number: 102, nameArabic: "التكاثر", nameEnglish: "The Rivalry in World Increase", nameTransliteration: "At-Takathur", totalAyahs: 8, revelationType: "Meccan" },
  { number: 103, nameArabic: "العصر", nameEnglish: "The Declining Day", nameTransliteration: "Al-Asr", totalAyahs: 3, revelationType: "Meccan" },
  { number: 104, nameArabic: "الهمزة", nameEnglish: "The Traducer", nameTransliteration: "Al-Humazah", totalAyahs: 9, revelationType: "Meccan" },
  { number: 105, nameArabic: "الفيل", nameEnglish: "The Elephant", nameTransliteration: "Al-Fil", totalAyahs: 5, revelationType: "Meccan" },
  { number: 106, nameArabic: "قريش", nameEnglish: "Quraysh", nameTransliteration: "Quraysh", totalAyahs: 4, revelationType: "Meccan" },
  { number: 107, nameArabic: "الماعون", nameEnglish: "The Small Kindnesses", nameTransliteration: "Al-Ma'un", totalAyahs: 7, revelationType: "Meccan" },
  { number: 108, nameArabic: "الكوثر", nameEnglish: "The Abundance", nameTransliteration: "Al-Kawthar", totalAyahs: 3, revelationType: "Meccan" },
  { number: 109, nameArabic: "الكافرون", nameEnglish: "The Disbelievers", nameTransliteration: "Al-Kafirun", totalAyahs: 6, revelationType: "Meccan" },
  { number: 110, nameArabic: "النصر", nameEnglish: "The Divine Support", nameTransliteration: "An-Nasr", totalAyahs: 3, revelationType: "Medinan" },
  { number: 111, nameArabic: "المسد", nameEnglish: "The Palm Fiber", nameTransliteration: "Al-Masad", totalAyahs: 5, revelationType: "Meccan" },
  { number: 112, nameArabic: "الإخلاص", nameEnglish: "The Sincerity", nameTransliteration: "Al-Ikhlas", totalAyahs: 4, revelationType: "Meccan" },
  { number: 113, nameArabic: "الفلق", nameEnglish: "The Daybreak", nameTransliteration: "Al-Falaq", totalAyahs: 5, revelationType: "Meccan" },
  { number: 114, nameArabic: "الناس", nameEnglish: "Mankind", nameTransliteration: "An-Nas", totalAyahs: 6, revelationType: "Meccan" },
];

async function seedSurahs() {
  console.log("Seeding 114 surahs...");
  for (const surah of SURAH_DATA) {
    await db
      .insert(quranSurahs)
      .values(surah)
      .onConflictDoNothing({ target: quranSurahs.number });
  }
  console.log("✓ Surahs seeded");
}

async function fetchAndSeedAyahs() {
  console.log("Fetching ayahs from alquran.cloud API...");

  // Fetch in batches of 10 surahs
  for (let batchStart = 1; batchStart <= 114; batchStart += 10) {
    const batchEnd = Math.min(batchStart + 9, 114);
    console.log(`  Fetching surahs ${batchStart}-${batchEnd}...`);

    for (let surahNum = batchStart; surahNum <= batchEnd; surahNum++) {
      try {
        const resp = await fetch(`https://api.alquran.cloud.com/v1/surah/${surahNum}/ar.alafasy`);
        if (!resp.ok) continue;
        const data = await resp.json() as any;
        const ayahs = data?.data?.ayahs || [];

        for (const ayah of ayahs) {
          const id = surahNum * 1000 + ayah.numberInSurah;
          await db
            .insert(quranAyahs)
            .values({
              surahNumber: surahNum,
              ayahNumber: ayah.numberInSurah,
              textArabic: ayah.text,
              page: ayah.page || null,
              juz: ayah.juz || null,
              hizb: ayah.hizb || null,
              version: "uthmani",
            })
            .onConflictDoNothing();
        }

        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        console.error(`  ✗ Failed surah ${surahNum}:`, (err as Error).message);
      }
    }
  }

  console.log("✓ Ayahs seeded");
}

async function seed() {
  try {
    await seedSurahs();
    await fetchAndSeedAyahs();
    console.log("\n🕌 Quran seed complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();
