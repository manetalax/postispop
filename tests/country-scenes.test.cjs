const {test}=require('node:test');
const assert=require('node:assert/strict');
const ready=Promise.all([import('../assets/designs/country-scenes.js'),import('../assets/designs/country-outlines.js'),import('../assets/designs/country-cultural-data.js')]);

test('Every country has its own local geographic engraving and a safe, valid scene',async()=>{
  const [{countryScene,countrySceneProfiles},{countryOutlines}]=await ready;
  assert.equal(Object.keys(countryOutlines).length,195);assert.equal(Object.keys(countrySceneProfiles).length,195);
  assert.equal(new Set(Object.values(countryOutlines).map(o=>o.path)).size,195);
  for(const code of Object.keys(countryOutlines)){
    const svg=countryScene({code,accent:'#e8c98c'});assert.ok(svg.includes('data-country-scene="'+code+'"'));
    assert.ok(!/<script|<foreignObject|https?:|onload=/i.test(svg)&&!/\b(?:NaN|Infinity)\b/.test(svg),code);
    assert.ok(!/<text\b/.test(svg),'Geometry must differentiate the art without substituting text labels.');
    for(const match of svg.matchAll(/<svg x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)){
      const [x,y,w,h]=match.slice(1).map(Number);assert.ok(x+w<=63||x>=649||y+h<=114||y>=438,code+' ornament overlaps note area');
    }
  }
  assert.equal(countryScene({code:'<script>'}),'');
  assert.ok(!/onload|NaN|Infinity/.test(countryScene({code:'ES',accent:'\" onload=\"alert(1)'},'not a number',Infinity)));
});

test('Finished country editions require both a referenced place and an illustrated food example',async()=>{
  const [{countrySceneProfiles,countryArtCoverage},,{countryCulturalData}]=await ready;
  assert.equal(countryArtCoverage.verifiedIllustratedLandmarks,195);assert.equal(countryArtCoverage.verifiedIllustratedDishes,195);assert.equal(countryArtCoverage.finishedEditions,195);
  for(const [code,profile]of Object.entries(countrySceneProfiles)){
    const source=countryCulturalData[code];
    if(profile.illustratedLandmark){assert.equal(source.landmark.verified,true);assert.equal(profile.landmark.name,source.landmark.name);assert.ok(source.landmark.source);}
    if(profile.illustratedFood){assert.equal(source.food.verified,true);assert.equal(profile.food.name,source.food.name);assert.ok(source.food.source);}
    assert.equal(profile.edition==='crafted',profile.illustratedLandmark&&profile.illustratedFood,code);
  }
});

test('The five priority destinations contain distinct named cultural drawings',async()=>{
  const [{countryScene,countrySceneProfiles}]=await ready;
  const expected={ES:['Alhambra','Paella'],IT:['Coliseo','Pizza'],FR:['Mont-Saint-Michel','Baguette'],JP:['Fuji','Onigiri'],EG:['Guiza','Koshary']};
  for(const [code,names]of Object.entries(expected)){
    const profile=countrySceneProfiles[code];assert.equal(profile.edition,'crafted');
    assert.ok(profile.landmark.name.includes(names[0]));assert.ok(profile.food.name.includes(names[1]));
    const svg=countryScene({code});assert.ok(svg.includes('x="652"'));assert.ok(svg.includes('x="592"'));
  }
});

test('Editorial changes cannot silently reuse a drawing of another place or dish',()=>{
  const {spawnSync}=require('node:child_process');
  const result=spawnSync(process.execPath,['--input-type=module','-e',`
    import assert from 'node:assert/strict';
    import {countryCulturalData as data} from './assets/designs/country-cultural-data.js';
    data.ES.landmark={...data.ES.landmark,name:'Otro lugar'};
    data.AF.food={...data.AF.food,name:'Otro alimento'};
    data.AM.food={...data.AM.food,verified:false};
    const {countrySceneProfiles:profiles,countryScene}=await import('./assets/designs/country-scenes.js');
    assert.equal(profiles.ES.illustratedLandmark,false);
    assert.equal(profiles.AF.illustratedFood,false);
    assert.equal(profiles.AM.illustratedFood,false);
    assert.equal(profiles.ES.edition,'foundation');
    assert.ok(!countryScene({code:'ES'}).includes('x="652"'));
    assert.ok(!countryScene({code:'AF'}).includes('x="592"'));
  `],{cwd:require('node:path').resolve(__dirname,'..'),encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.stdout);
});
