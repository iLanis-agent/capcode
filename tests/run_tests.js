/* CapCode tests: engine vs tests/expected.json (python oracle). */
'use strict';
const fs=require('fs'),path=require('path');
const C=require(path.join(__dirname,'..','engine.js'));
const items=JSON.parse(fs.readFileSync(path.join(__dirname,'expected.json'),'utf8')).items;
let pass=0,fail=0;
function ok(){pass++;}
function bad(l,a,b){fail++;console.log('FAIL '+l+': got '+JSON.stringify(a)+' want '+JSON.stringify(b));}
for(const it of items){
  const T=it.kind+' '+(it.code||it.pF||'life')+' ';
  if(it.kind==='decode'){
    const r=C.decode(it.code),o=it.oracle;
    if(!o.ok){ if(!r.ok)ok(); else bad(T+'should fail',r,o); continue; }
    if(!r.ok){bad(T+'should pass',r,o);continue;}
    if(Math.abs(r.pF-o.pF)<1e-9*Math.max(1,o.pF))ok(); else bad(T+'pF',r.pF,o.pF);
    if((r.tolLetter||null)===(o.tol||null))ok(); else bad(T+'tol',r.tolLetter,o.tol);
  }else if(it.kind==='encode'){
    const r=C.encode(it.pF),o=it.oracle;
    if((r.shorthand||null)===(o.shorthand||null))ok(); else bad(T+'shorthand',r.shorthand,o.shorthand);
    if((r.eia||null)===(o.eia||null))ok(); else bad(T+'eia',r.eia,o.eia);
  }else{
    const r=C.lifetime(it.ratedHrs,it.ratedTemp,it.actualTemp);
    if(r===it.oracle)ok(); else bad(T+'hours',r,it.oracle);
  }
}
// decode(encode(x)) round-trips for standard values
for(const v of [100000,4700,2200000,68000]){
  const e=C.encode(v);
  const code=e.eia||e.shorthand;
  const d=C.decode(code);
  if(d.ok&&Math.abs(d.pF-v)<1e-6*v)pass++; else bad('roundtrip '+v,d.pF,v);
}
// lifetime at rating returns rated hours
if(C.lifetime(2000,105,105)===2000)pass++; else bad('life@rating',C.lifetime(2000,105,105),2000);
console.log(pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
