import { RuleConfigSeverity } from '@commitlint/types';
import versionrc from './.versionrc.json';

const commitTypes = versionrc.types.map((type) => type.type);

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [RuleConfigSeverity.Error, 'always', commitTypes],
    'subject-case': [RuleConfigSeverity.Error, 'never'],
  },
};
