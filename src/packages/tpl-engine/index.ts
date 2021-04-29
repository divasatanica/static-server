/**
 * A simple template engine implemented with regular expression.
 * It scans the template line by line, match the syntax with regular expression.
 */
import { parseTemplate } from './parser';
import { render as renderWithTokens } from './renderer';

const defaultRenderOption = {
  uglify: false
};

export function render(template: string, data: any, options = defaultRenderOption) {

  const tokens = parseTemplate(template);
  const out = renderWithTokens(tokens, data);

  return out.join(options.uglify ? '' : '\n');
}