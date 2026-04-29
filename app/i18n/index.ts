import { cookies } from 'next/headers';
import { fallbackLng, languages, cookieName, type Language } from './settings';

export async function getLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const lang = cookieStore.get(cookieName)?.value;
  
  if (lang && languages.includes(lang as Language)) {
    return lang as Language;
  }
  
  return fallbackLng;
}

export async function getTranslations(lng?: Language, ns: string = 'landing') {
  const language = lng || await getLanguage();
  
  try {
    const translations = await import(`./locales/${language}/${ns}.json`);
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for ${language}/${ns}`, error);
    const fallback = await import(`./locales/${fallbackLng}/${ns}.json`);
    return fallback.default;
  }
}
