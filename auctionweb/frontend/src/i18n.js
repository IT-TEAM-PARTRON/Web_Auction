import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getAll } from './services/api';

import viJson from './locales/vi.json';
import enJson from './locales/en.json';
import koJson from './locales/ko.json';

const staticResources = {
    vi: viJson,
    en: enJson,
    ko: koJson,
};

const CACHE_KEY_PREFIX = 'i18n_cache_';
const CACHE_TTL = 10000;
const fetchingLangs = new Set();
let lastFetchedLang = null;

const getCachedTranslations = (lang) => {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + lang);
    if (!cached) return null;
    try {
        const { data, timestamp } = JSON.parse(cached);
        // Kiểm tra hết hạn cache
        if (Date.now() - timestamp > CACHE_TTL) {
            localStorage.removeItem(CACHE_KEY_PREFIX + lang);
            return null;
        }
        return data;
    } catch (e) {
        return null;
    }
};

// Lưu dữ liệu vào cache localStorage
const setCachedTranslations = (lang, data) => {
    localStorage.setItem(CACHE_KEY_PREFIX + lang, JSON.stringify({
        data,
        timestamp: Date.now()
    }));
};

// Hàm phụ để fetch dữ liệu từ Database (kèm cache logic)
const fetchDBTranslations = async (lang, ignoreCache = false) => {
    // 1. Kiểm tra cache trước (nếu không yêu cầu ignore)
    if (!ignoreCache) {
        const cachedData = getCachedTranslations(lang);
        if (cachedData) return cachedData;
    }

    // 2. Ngăn chặn spam call nếu đang fetch ngôn ngữ này rồi
    if (fetchingLangs.has(lang)) return {};
    
    fetchingLangs.add(lang);
    try {
        const response = await getAll('translations', false, { lang });
        const dbData = response.data?.data || {};
        
        if (Object.keys(dbData).length > 0) {
            setCachedTranslations(lang, dbData);
        }
        return dbData;
    } catch (error) {
        console.error(`I18n: Load from DB failed for ${lang}, using local fallback.`, error);
        return {};
    } finally {
        fetchingLangs.delete(lang);
    }
};

// Khởi tạo i18n bất đồng bộ
const initI18n = async () => {
    const currentLang = sessionStorage.getItem('lang') || 'en';
    lastFetchedLang = currentLang;
    
    // Luôn fetch mới từ DB khi reload app (ignoreCache = true)
    const dbTranslations = await fetchDBTranslations(currentLang, true);

    // Merge JSON local + DB
    const resources = {
        vi: { translation: { ...viJson, ...(currentLang === 'vi' ? dbTranslations : {}) } },
        en: { translation: { ...enJson, ...(currentLang === 'en' ? dbTranslations : {}) } },
        ko: { translation: { ...koJson, ...(currentLang === 'ko' ? dbTranslations : {}) } },
    };

    await i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: currentLang,
            fallbackLng: 'en',
            interpolation: { escapeValue: false },
            react: { useSuspense: false } 
        });

    // Lắng nghe sự kiện đổi ngôn ngữ
    i18n.on('languageChanged', async (lng) => {
        // Tránh spam nếu ngôn ngữ không đổi hoặc vừa fetch lúc init
        if (lng === lastFetchedLang) return;
        
        const newDbTranslations = await fetchDBTranslations(lng);
        if (Object.keys(newDbTranslations).length > 0) {
            i18n.addResourceBundle(lng, 'translation', newDbTranslations, true, true);
            lastFetchedLang = lng;
        }
    });
};

export { initI18n };
export default i18n;
