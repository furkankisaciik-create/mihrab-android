export type DuaCategoryKey =
  | 'general'
  | 'forgiveness'
  | 'worship'
  | 'ease'
  | 'knowledge'
  | 'healing'
  | 'family'
  | 'sustenance';

export type DuaCategory = {
  key: DuaCategoryKey;
  label: string;
};

export type Dua = {
  id: string;
  title: string;
  summary: string;
  category: DuaCategoryKey;
  arabicText: string;
  transliteration: string;
  meaning: string;
  source: string;
  sourceUrl: string;
  tags: string[];
};
