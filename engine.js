/* CapCode engine: decode and encode capacitor markings.
   - 3-digit EIA code: 104 = 10 * 10^4 pF
   - shorthand with unit letter as decimal point: 4u7 = 4.7uF, n47 = 0.47nF, 4R7 = 4.7pF
   - plain numbers: 47 = 47 pF
   - tolerance letters: F,G,J,K,M,Z
   - electrolytic lifetime: Arrhenius, life doubles every 10C below rating
   All values internally in picofarads. Pure JS, browser + Node. */
(function(root,factory){
  if(typeof module==='object'&&module.exports){module.exports=factory();}
  else{root.CapCode=factory();}
})(typeof self!=='undefined'?self:this,function(){
'use strict';
var TOL={F:1,G:2,J:5,K:10,M:20,Z:80}; // Z is -20/+80, report upper bound
function decode(code){
  code=String(code).trim();
  if(!code)return {ok:false,error:'empty'};
  var m,pF,tol=null;
  var tmatch=code.match(/[FGJKMZ]$/);
  var body=code;
  if(tmatch){tol=tmatch[0];body=code.slice(0,-1);}
  if(/^\d{3}$/.test(body)){
    var base=parseInt(body.slice(0,2),10),mult=parseInt(body[2],10);
    if(mult>6)return {ok:false,error:'multiplier digit > 6 is a tolerance or invalid'};
    pF=base*Math.pow(10,mult);
  }else if((m=/^(\d+)[unpUNP](\d+)$/.exec(body))||(m=/^(\d+)[rR](\d+)$/.exec(body))){
    var unit=body.replace(/\d/g,'').toLowerCase();
    var val=parseFloat(m[1]+'.'+m[2]);
    pF=unit==='u'?val*1e6:unit==='n'?val*1e3:val;
  }else if(/^[unpUNP](\d+)$/.test(body)){
    var u2=body[0].toLowerCase();
    var v2=parseFloat('0.'+body.slice(1));
    pF=u2==='u'?v2*1e6:u2==='n'?v2*1e3:v2;
  }else if(/^\d+(\.\d+)?$/.test(body)){
    pF=parseFloat(body); // bare number = pF
  }else{
    return {ok:false,error:'unrecognized code'};
  }
  if(!(pF>0))return {ok:false,error:'non-positive value'};
  var r={ok:true,pF:pF,pretty:pretty(pF),tolLetter:tol};
  if(tol)r.tolPct=TOL[tol];
  return r;
}
function pretty(pF){
  if(pF>=1e6)return trim(pF/1e6)+' uF';
  if(pF>=1e3)return trim(pF/1e3)+' nF';
  return trim(pF)+' pF';
}
function trim(v){
  var s=(Math.round(v*1000)/1000).toString();
  return s;
}
/* encode pF into the common markings */
function encode(pF){
  var out={};
  if(pF>=1e6){
    var u=pF/1e6;
    if(u<10&&Math.abs(u-Math.round(u))>1e-9){
      var parts=u.toFixed(1).split('.');
      out.shorthand=parts[0]+'u'+parts[1];
    }else if(u<10){out.shorthand=Math.round(u)+'u';}
  }else if(pF>=1e3&&pF<1e6){
    var n=pF/1e3;
    if(n<10&&Math.abs(n-Math.round(n))>1e-9){
      var pn=n.toFixed(1).split('.');
      out.shorthand=pn[0]+'n'+pn[1];
    }else if(n<10){out.shorthand=Math.round(n)+'n';}
  }
  // 3-digit code when expressible
  var s=String(Math.round(pF));
  if(pF>=10&&s.length>=2){
    var firstTwo=parseInt(s.slice(0,2),10);
    var mult=s.length-2;
    if(mult<=6&&firstTwo*Math.pow(10,mult)===Math.round(pF)){
      out.eia=s.slice(0,2)+String(mult);
    }
  }
  if(pF<10){
    var pp=pF.toFixed(1).split('.');
    if(pp[1]&&pp[1]!=='0')out.shorthand=out.shorthand||pp[0]+'R'+pp[1];
  }
  out.pretty=pretty(pF);
  return out;
}
/* lifetime: ratedHrs at ratedTemp C, running at actualTemp C.
   Rule: doubles every 10C below rating (Arrhenius approx). */
function lifetime(ratedHrs,ratedTemp,actualTemp){
  var f=Math.pow(2,(ratedTemp-actualTemp)/10);
  return Math.round(ratedHrs*f);
}
return {decode:decode,encode:encode,lifetime:lifetime,pretty:pretty};
});
