export const fallbackLng = 'ru';
export const languages = ['ru', 'kg'] as const;
export const defaultNS = 'landing';
export const cookieName = 'i18next';

export type Language = typeof languages[number];

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
