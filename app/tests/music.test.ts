import {test} from 'node:test';
import assert from 'node:assert/strict';
import {musicDefaults,musicDuration,normalizeMusic,musicLevel} from '../lib/music-profile.ts';
test('Music preferences recover invalid values and keep seek/volume within playable limits',()=>{
 assert.deepEqual(normalizeMusic(),musicDefaults);
 assert.deepEqual(normalizeMusic({introStart:Infinity,introVolume:NaN,gameVolume:-5}),{...musicDefaults,gameVolume:0});
 assert.deepEqual(normalizeMusic({enabled:false,introStart:999,introVolume:9,gameVolume:9}),{enabled:false,introStart:musicDuration-5,introVolume:.8,gameVolume:.5});
});
test('Intro is prominent, classroom stays quiet, question audio ducks music, mute overrides every scene',()=>{
 assert.equal(musicLevel('intro',musicDefaults),.5);
 for(const scene of ['lobby','gameplay','victory'] as const){assert.equal(musicLevel(scene,musicDefaults),.13);assert.equal(musicLevel(scene,musicDefaults,false,true),.0325);assert.equal(musicLevel(scene,musicDefaults,true),0);}
 assert.equal(musicLevel('off',musicDefaults),0);assert.equal(musicLevel('intro',{...musicDefaults,enabled:false}),0);
});
