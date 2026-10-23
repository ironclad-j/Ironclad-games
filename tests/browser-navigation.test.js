import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const source=html.match(/function createNavigation\(\)[\s\S]*?\/\/ end-navigation/)?.[0];
test('tabs have independent navigation histories starting at home',()=>{
  assert.ok(source,'navigation history helper must exist');
  const make=vm.runInNewContext('('+source.replace('// end-navigation','')+')');
  const a=make(),b=make();a.visit({view:'library'});a.visit({view:'game',gameId:'slope'});
  assert.equal(a.current().gameId,'slope');assert.equal(b.current().view,'home');
  a.back();assert.equal(a.current().view,'library');a.back();assert.equal(a.current().view,'home');
  assert.equal(a.canBack(),false);a.forward();assert.equal(a.current().view,'library');
});
test('new navigation drops the forward branch',()=>{
  assert.ok(source,'navigation history helper must exist');
  const make=vm.runInNewContext('('+source.replace('// end-navigation','')+')'),nav=make();
  nav.visit({view:'library'});nav.visit({view:'game',gameId:'slope'});nav.back();nav.visit({view:'home'});
  assert.equal(nav.canForward(),false);nav.forward();assert.equal(nav.current().view,'home');
});
