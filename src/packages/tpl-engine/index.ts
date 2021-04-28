/**
 * A simple template engine implemented with regular expression.
 */
const dslReg = /\<%(.+)\%\>/;
const dataReg = /{{([\w|\s|\.])+}}/g;
const descReg = /^<!--/;
const descEndReg = /-->$/;
const iterationReg = /for\s?{{([\w|\s]+)}}\s?in\s?{{([\w|\s]+)}}\s?=>\s?(.+)/;
const conditionIfReg = /^if\s?{{(.+)}}\s?=>\s?(.+)/;
const conditionElseIfReg = /elif\s?{{(.+)}}\s?=>\s?(.+)/;
const conditionElseReg = /else\s?=>\s?(.+)/;
const TYPE_CONDITION_ITEM_IF = 1;
const TYPE_CONDITION_ITEM_ELSEIF = 2;
const TYPE_CONDITION_ITEM_ELSE = 3;

export function render(template: string, data: any) {
  const out = [] as any[];
  let conditionChunks = [] as any[];
  let descChunks = [] as any[];
  const templates = template.split('\n');
  for (let i = 0, len = templates.length; i < len; i ++) {
    const chunk = templates[i];
    let _chunk = chunk.trim();
    if (descChunks.length > 0) {
      continue;
    }
    if (!dslReg.test(_chunk)) {
      out.push(_chunk);
      continue;
    } else if (descReg.test(chunk)) {
      descChunks.push(chunk);
      continue;
    } else if (descEndReg.test(chunk)) {
      descChunks = [];
      continue;
    } else {
      _chunk = _chunk.match(dslReg)![1].trim();
    }

    const iterMatch = _chunk.match(iterationReg);
    if (iterMatch) {
      out.push(...renderIteration(iterMatch, data));
      continue;
    }

    const startIfMatch = _chunk.match(conditionIfReg);
    if (startIfMatch) {
      if (conditionChunks.length > 0) {
        throw new Error('Unmatched if blocks in tmeplate');
      }
      const conditionItem = {
        condition: startIfMatch[1].trim(),
        result: startIfMatch[2].trim(),
        type: TYPE_CONDITION_ITEM_IF
      };
      conditionChunks.push(conditionItem);
      continue;
    }

    const elseIfMatch = _chunk.match(conditionElseIfReg);
    if (elseIfMatch) {
      if (conditionChunks.length === 0) {
        throw new Error('Unmatched elif blocks in template');
      }

      const conditionItem = {
        condition: elseIfMatch[1].trim(),
        result: elseIfMatch[2].trim(),
        type: TYPE_CONDITION_ITEM_ELSEIF
      };

      conditionChunks.push(conditionItem);
      continue;
    }

    const elseMatch = _chunk.match(conditionElseReg);
    if (elseMatch) {
      if (conditionChunks.length === 0) {
        throw new Error('Unmatched else blocks in template');
      }

      const conditionItem = {
        condition: '',
        result: elseMatch[1].trim(),
        type: TYPE_CONDITION_ITEM_ELSE
      };
      conditionChunks.push(conditionItem);
      out.push(...renderCondition(conditionChunks, data));
      conditionChunks = [];
      continue;
    }

    const dataPropMatch = _chunk.match(dataReg);
    if (dataPropMatch) {
      out.push(renderDataProp(_chunk, data));
    }
  }

  return out.join('');
}

function renderCondition(conditionItems, data) {
  const functionBody = conditionItems.map(item => {
    const { condition, type, result } = item;
    switch(type) {
      case TYPE_CONDITION_ITEM_IF: {
        return `if(${condition}){return '${renderDataProp(result, data)}'}`;
      }
      case TYPE_CONDITION_ITEM_ELSEIF: {
        return `else if(${condition}){return '${renderDataProp(result, data)}'}`;
      }
      case TYPE_CONDITION_ITEM_ELSE: {
        return `else {return '${renderDataProp(result, data)}'}`;
      }
      default: {
        return '';
      }
    }
  });
  const fn = new Function(functionBody.join(''));

  const result = fn.bind(data)();

  return [result];
}

function renderIteration(templateChunk: string[], data: any) {
  const [iterated, outputTemplate] = templateChunk.slice(2);
  const _iterated = data[iterated.trim()] || [];
  const res = [] as any[];
  _iterated.forEach(item => {
    if (!dataReg) {
      res.push(outputTemplate);
    } else {
      res.push(renderDataProp(outputTemplate, item, false));
    }
  });

  return res;
}

function renderDataProp(templateChunk: string, data: any, isGlobal: boolean = true) {
  if (!dataReg.test(templateChunk)) {
    return templateChunk;
  }
  const dataMatch = templateChunk.match(dataReg);
  dataMatch!.forEach((match) => {
    // TODO // SHOULD BE IMPROVED
    // If use data prop statement in globally, should not slice to ensure the scope.
    // Or if use data prop statement in iteration, should slice first out cause the scope is decided.
    const propPath = match.split('.').slice(isGlobal ? 0 : 1);
    let _data = data;
    for (let i = 0, len = propPath.length; i < len; i ++) {
      const key = propPath[i].replace(/[\s|\{|\}]/g, '');
      _data = _data[key];
    }
    templateChunk = templateChunk.replace(match, _data);
  });

  return templateChunk;
}