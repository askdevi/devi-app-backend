const { doc, getDoc, setDoc } = require('firebase/firestore');
const { db } = require('@/lib/firebase-admin'); // adjust relative path as needed

// In-memory cache to avoid repeated Firebase calls
const dailyBlessingsCache = new Map();

// Predefined list of lucky colors
const LUCKY_COLORS = [
    "Red", "Blue", "Green", "Yellow", "Purple",
    "Orange", "Pink", "White", "Gold", "Silver",
    "Turquoise", "Indigo", "Violet", "Saffron", "Maroon",
    "Crimson", "Magenta", "Black", "Brown", "Saffron Orange"
];

// Predefined list of mantras
const MANTRA_LIST = [
    {
        "latinScript": "Om Shreem Hreem Kleem",
        "sanskritScript": "ॐ श्रीं ह्रीं क्लीं",
        "direction": "Chant 108 times for wealth and attraction."
    },
    {
        "latinScript": "Om Namah Shivaya",
        "sanskritScript": "ॐ नमः शिवाय",
        "direction": "Chant 108 times for inner peace and protection."
    },
    {
        "latinScript": "Om Namo Narayanaya",
        "sanskritScript": "ॐ नमो नारायणाय",
        "direction": "Chant 108 times for spiritual growth and calm."
    },
    {
        "latinScript": "Om Aim Hreem Kleem",
        "sanskritScript": "ॐ ऐं ह्रीं क्लीं",
        "direction": "Chant 108 times for clarity, power, and magnetism."
    },
    {
        "latinScript": "Om Kleem Krishnaya Namah",
        "sanskritScript": "ॐ क्लीं कृष्णाय नमः",
        "direction": "Chant 108 times for love and divine joy."
    },
    {
        "latinScript": "Om Hreem Namah Shivaya",
        "sanskritScript": "ॐ ह्रीं नमः शिवाय",
        "direction": "Chant 108 times for purification and spiritual strength."
    },
    {
        "latinScript": "Om Shreem Maha Lakshmiyei",
        "sanskritScript": "ॐ श्रीं महालक्ष्म्यै",
        "direction": "Chant 108 times for financial prosperity."
    },
    {
        "latinScript": "Om Dum Durgayei Namah",
        "sanskritScript": "ॐ दुं दुर्गायै नमः",
        "direction": "Chant 108 times for protection from negative forces."
    },
    {
        "latinScript": "Om Gam Ganapataye Namah",
        "sanskritScript": "ॐ गं गणपतये नमः",
        "direction": "Chant 108 times to remove obstacles and begin anew."
    },
    {
        "latinScript": "Om Namo Bhagavate Vasudevaya",
        "sanskritScript": "ॐ नमो भगवते वासुदेवाय",
        "direction": "Chant 108 times for liberation and divine grace."
    },
    {
        "latinScript": "Om Hreem Shreem Krim",
        "sanskritScript": "ॐ ह्रीं श्रीं क्रीं",
        "direction": "Chant 108 times for energy balance and inner power."
    },
    {
        "latinScript": "Om Aim Saraswatyai Namah",
        "sanskritScript": "ॐ ऐं सरस्वत्यै नमः",
        "direction": "Chant 108 times for wisdom and academic success."
    },
    {
        "latinScript": "Om Ram Rahave Namah",
        "sanskritScript": "ॐ रां राहवे नमः",
        "direction": "Chant 108 times to reduce Rahu's astrological impact."
    },
    {
        "latinScript": "Om Krem Krom Hum Krom",
        "sanskritScript": "ॐ क्रें क्रों हुं क्रों",
        "direction": "Chant 108 times for intense spiritual transformation."
    },
    {
        "latinScript": "Om Krim Kaliye Namah",
        "sanskritScript": "ॐ क्रीं काल्यै नमः",
        "direction": "Chant 108 times for strength and destruction of ego."
    },
    {
        "latinScript": "Om Hanumate Namah",
        "sanskritScript": "ॐ हनुमते नमः",
        "direction": "Chant 108 times for courage and protection."
    },
    {
        "latinScript": "Om Sri Rama Jai Rama",
        "sanskritScript": "ॐ श्री राम जय राम",
        "direction": "Chant 108 times for peace and devotion."
    },
    {
        "latinScript": "Om Dram Dattatreyaya Namah",
        "sanskritScript": "ॐ द्रां दत्तात्रेयाय नमः",
        "direction": "Chant 108 times for knowledge and healing."
    },
    {
        "latinScript": "Om Vajra Sattva Hum",
        "sanskritScript": "ॐ वज्रसत्त्व हुं",
        "direction": "Chant 108 times for purification and karma cleansing."
    },
    {
        "latinScript": "Om Shanti Shanti Shanti",
        "sanskritScript": "ॐ शान्ति शान्ति शान्ति",
        "direction": "Chant 11 times for peace in body, mind, and soul."
    }
];

// Helper to get today's date in IST format (YYYY-MM-DD)
function getTodayDateIST() {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return istTime.toISOString().split('T')[0];
}

// Helper function to generate a random time window
function generateRandomTimeWindow() {
    const startHour = Math.floor(Math.random() * 16) + 5; // 5 AM to 8 PM
    const startMinute = Math.floor(Math.random() * 60);

    const durationHours = Math.floor(Math.random() * 2) + 1; // 1 or 2 hours
    const durationMinutes = Math.floor(Math.random() * 60);

    let endHour = startHour + durationHours;
    let endMinute = startMinute + durationMinutes;

    if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute = endMinute % 60;
    }

    const formatTime = (hour, minute) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    };

    return `${formatTime(startHour, startMinute)} - ${formatTime(endHour, endMinute)}`;
}

async function getDailyBlessings(userId) {
    try {
        const todayIST = getTodayDateIST();
        const cacheKey = `${userId}_${todayIST}`;

        if (dailyBlessingsCache.has(cacheKey)) {
            console.log('Using in-memory cache for daily blessings');
            return dailyBlessingsCache.get(cacheKey).data;
        }

        const blessingsRef = doc(db, 'dailyBlessings', cacheKey);
        const blessingsDoc = await getDoc(blessingsRef);

        if (blessingsDoc.exists()) {
            const cachedBlessings = blessingsDoc.data();
            console.log('Using Firebase cached daily blessings');

            dailyBlessingsCache.set(cacheKey, {
                data: cachedBlessings,
                timestamp: Date.now()
            });

            return cachedBlessings;
        }

        console.log('Generating new daily blessings');

        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            throw new Error('User data not found');
        }

        const userData = userDoc.data();

        // Random lucky number and color (you can replace with numerology logic if needed)
        const luckyNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        const luckyNumber = luckyNumbers[Math.floor(Math.random() * luckyNumbers.length)];
        const luckyColor = LUCKY_COLORS[Math.floor(Math.random() * LUCKY_COLORS.length)];

        const luckyMantra = MANTRA_LIST[Math.floor(Math.random() * MANTRA_LIST.length)];
        const auspiciousTime = generateRandomTimeWindow();

        const dailyBlessings = {
            luckyMantra,
            auspiciousTime,
            luckyNumber,
            luckyColor,
            date: todayIST
        };

        await setDoc(blessingsRef, dailyBlessings);

        dailyBlessingsCache.set(cacheKey, {
            data: dailyBlessings,
            timestamp: Date.now()
        });

        console.log('Final daily blessings result:', dailyBlessings);

        return dailyBlessings;
    } catch (error) {
        console.error('Daily Blessings Generation Error:', {
            error: error.message,
            providedUserId: userId,
            timestamp: new Date().toISOString(),
            stack: error.stack
        });

        const todayIST = getTodayDateIST();

        return {
            luckyMantra: MANTRA_LIST[0],
            auspiciousTime: "10:00 AM - 12:00 PM",
            luckyNumber: "9",
            luckyColor: "Saffron Orange",
            date: todayIST
        };
    }
}

module.exports = {
    getDailyBlessings
};
