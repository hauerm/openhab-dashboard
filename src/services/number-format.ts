export type LocaleInput = Intl.LocalesArgument;

const getBrowserLocale = (): LocaleInput => {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  return navigator.languages.length > 0 ? navigator.languages : navigator.language;
};

export const formatLocalizedNumber = (
  value: number,
  options: Intl.NumberFormatOptions,
  locale: LocaleInput = getBrowserLocale()
): string => new Intl.NumberFormat(locale, options).format(value);
