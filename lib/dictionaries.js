import "server-only";

const dictionaries = ["en", "zh"].reduce((acc, key) => {
  acc[key] = () =>
    import(`/dictionaries/${key}.json`).then((module) => module.default);
  return acc;
}, {});

export const getDictionary = async (locale) => {
  if (!dictionaries[locale]) {
    throw new Error(`No dictionary found for locale "${locale}"`);
  }
  return dictionaries[locale]();
};
