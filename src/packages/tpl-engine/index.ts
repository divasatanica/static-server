const dslReg = /\<%(.+)\%\>/;
const dataReg = /{{([\w|\s|\.])+}}/g;
const iterationReg = /for\s?{{([\w|\s]+)}}\s?in\s?{{([\w|\s]+)}}\s?=>\s?(.+)/;

export function render(template: string, data: any) {
  const out = [] as any[];
  
  const templates = template.split('\n');
  templates.forEach(chunk => {
    let _chunk = chunk.trim();
    if (!dslReg.test(_chunk)) {
      out.push(_chunk);
    } else {
      _chunk = _chunk.match(dslReg)![1].trim();
    }

    const iterMatch = _chunk.match(iterationReg);
    if (iterMatch) {
      out.push(...renderIteration(iterMatch, data));
    }

    // TODO
    // const conditionMatch = _chunk.match(conditionReg)
    // if (false) {
    //   out.push(...renderCondition())
    // }

    
  });

  return out.join('');
}

function renderIteration(templateChunk: string[], data: any) {
  console.log('templateChunk:', templateChunk);
  const [iterated, outputTemplate] = templateChunk.slice(2);
  const _iterated = data[iterated.trim()] || [];
  const res = [] as any[];
  _iterated.forEach(item => {
    if (!dataReg) {
      res.push(outputTemplate);
    } else {
      res.push(renderDataProp(outputTemplate, item));
    }
  });

  return res;
}

function renderDataProp(templateChunk: string, data: any) {
  const dataMatch = templateChunk.match(dataReg);
  dataMatch!.forEach((match) => {
    const propPath = match.split('.').slice(1);
    let _data = data;
    for (let i = 0, len = propPath.length; i < len; i ++) {
      const key = propPath[i].replace(/[\{|\}]/g, '');
      _data = _data[key];
    }
    templateChunk = templateChunk.replace(match, _data);
  });

  return templateChunk;
}

// TODO
// function renderCondition(templateChunk: string, data: any) {
//   
// } 