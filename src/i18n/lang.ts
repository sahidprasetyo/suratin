import { createContext, useContext } from 'react';
import type { Lang } from '../types/letter';
import { strings } from './strings';

export const LangContext = createContext<Lang>('id');

export const useLang = () => useContext(LangContext);

export const useT = () => strings[useLang()];
