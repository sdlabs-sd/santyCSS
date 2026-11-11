// id → component. The download packager rewrites this file to export only the
// purchased / downloaded template.
import Commit from './Commit.vue';
import Canvas from './Canvas.vue';
import Signal from './Signal.vue';
import Spotlight from './Spotlight.vue';
import Care from './Care.vue';
import Chalkboard from './Chalkboard.vue';
import Quota from './Quota.vue';
import Ledger from './Ledger.vue';
import Boardroom from './Boardroom.vue';
import Roadmap from './Roadmap.vue';
import Counsel from './Counsel.vue';
import Physician from './Physician.vue';

export default {
  commit: Commit,
  canvas: Canvas,
  signal: Signal,
  spotlight: Spotlight,
  care: Care,
  chalkboard: Chalkboard,
  quota: Quota,
  ledger: Ledger,
  boardroom: Boardroom,
  roadmap: Roadmap,
  counsel: Counsel,
  physician: Physician,
};
