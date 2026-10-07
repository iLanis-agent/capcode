#!/usr/bin/env python3
"""CapCode oracle: independent python decode/encode/lifetime."""
import json, os, re

TOL = {'F':1,'G':2,'J':5,'K':10,'M':20,'Z':80}

def decode(code):
    body = code.strip()
    tol = None
    if body and body[-1] in TOL and not re.fullmatch(r'[unpUNP]?\d+', body):
        tol = body[-1]; body = body[:-1]
    m = re.fullmatch(r'(\d{3})', body)
    if m:
        mult = int(body[2])
        if mult > 6: return {'ok': False}
        pf = int(body[:2]) * 10**mult
    else:
        m = re.fullmatch(r'(\d+)([unpUNPrR])(\d+)', body)
        if m:
            u = m.group(2).lower()
            v = float(m.group(1)+'.'+m.group(3))
            pf = v*1e6 if u=='u' else v*1e3 if u=='n' else v
        else:
            m = re.fullmatch(r'([unpUNP])(\d+)', body)
            if m:
                u = m.group(1).lower()
                v = float('0.'+m.group(2))
                pf = v*1e6 if u=='u' else v*1e3 if u=='n' else v
            else:
                m = re.fullmatch(r'\d+(\.\d+)?', body)
                if m: pf = float(body)
                else: return {'ok': False}
    if not pf > 0: return {'ok': False}
    return {'ok': True, 'pF': pf, 'tol': tol}

DECODES = ['104','470','101','225','103K','4u7','n47','2n2','4R7','u47','47','100','0','abc','109','6u8M']
ENCODES = [100000, 4700, 2200000, 10000000, 47, 4.7e6, 2200, 330, 68000, 10]
LIFETIMES = [(2000,105,85),(2000,105,105),(5000,105,65),(1000,85,45),(2000,105,130)]

def enc(pF):
    out = {}
    if pF >= 1e6:
        u = pF/1e6
        if u < 10 and abs(u-round(u)) > 1e-9:
            p = ('%.1f' % u).split('.')
            out['shorthand'] = p[0]+'u'+p[1]
        elif u < 10:
            out['shorthand'] = str(round(u))+'u'
    elif pF >= 1e3:
        n = pF/1e3
        if n < 10 and abs(n-round(n)) > 1e-9:
            p = ('%.1f' % n).split('.')
            out['shorthand'] = p[0]+'n'+p[1]
        elif n < 10:
            out['shorthand'] = str(round(n))+'n'
    s = str(round(pF))
    if pF >= 10 and len(s) >= 2:
        ft = int(s[:2]); mult = len(s)-2
        if mult <= 6 and ft*10**mult == round(pF):
            out['eia'] = s[:2]+str(mult)
    if pF < 10:
        p = ('%.1f' % pF).split('.')
        if len(p) > 1 and p[1] != '0' and 'shorthand' not in out:
            out['shorthand'] = p[0]+'R'+p[1]
    return out

items = []
for c in DECODES:
    items.append({'kind':'decode','code':c,'oracle':decode(c)})
for v in ENCODES:
    items.append({'kind':'encode','pF':v,'oracle':enc(v)})
for h,rt,at in LIFETIMES:
    items.append({'kind':'lifetime','ratedHrs':h,'ratedTemp':rt,'actualTemp':at,
                  'oracle':round(h*2**((rt-at)/10))})
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'expected.json')
json.dump({'items': items}, open(out,'w'))
print('cases:', len(items))
