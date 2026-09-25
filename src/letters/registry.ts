import type { LetterTypeId } from '../types/letter';
import type { LetterTypeDef } from './types';
import { invitation } from './invitation';
import { notice } from './notice';
import { request } from './request';
import { assignment } from './assignment';

// To add a letter type: add its id and block shape in types/letter.ts, write its file, register it here.
export const LETTER_TYPES: { [K in LetterTypeId]: LetterTypeDef<K> } = {
  invitation,
  notice,
  request,
  assignment,
};
