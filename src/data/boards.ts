import type { Board, Lang } from '../types';
import { TRIVIA_EN } from './jeopardy.en';
import { TRIVIA_AR } from './jeopardy.ar';

export const BOARDS: Record<Lang, Board> = {
    en: {
      label:'English', sub:'6 categories · 30 questions', cats:TRIVIA_EN, rtl:false,
      finalCat:'The Ancient World',
      finalQ:'The Great Pyramid is the only surviving wonder of the ancient world. Name any three of the other six.',
      finalA:'Any three of: the Hanging Gardens of Babylon, the Statue of Zeus at Olympia, the Temple of Artemis at Ephesus, the Mausoleum at Halicarnassus, the Colossus of Rhodes, the Lighthouse of Alexandria.'
    },
    ar: {
      label:'العربية', sub:'٦ فئات · ٣٠ سؤالاً', cats:TRIVIA_AR, rtl:true,
      finalCat:'حوض النيل',
      finalQ:'يمرّ نهر النيل أو يتغذّى من عدة دول. اذكر خمس دول من دول حوض النيل.',
      finalA:'أي خمس من: مصر، السودان، جنوب السودان، إثيوبيا، إريتريا، أوغندا، كينيا، تنزانيا، رواندا، بوروندي، الكونغو الديمقراطية.'
    }
  };
