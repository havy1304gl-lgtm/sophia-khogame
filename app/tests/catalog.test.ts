import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gameLink,avengersGame,mergeGameCatalog} from '../lib/game-catalog.ts';
test('Catalog links accept deployed games and local game paths, reject executable and credential URLs',()=>{
 assert.equal(gameLink(' https://classroom.example/game '),'https://classroom.example/game');assert.equal(gameLink('/games/new-game/index.html'),'/games/new-game/index.html');
 for(const value of ['javascript:alert(1)','data:text/html,<script>','//untrusted.example','https://teacher:password@example.com','/games\\wrong','not a link'])assert.equal(gameLink(value),'');
 assert.equal(avengersGame.id,'avengers-infinity');
});
test('Published catalog entries remain first and local links cannot duplicate or replace them',()=>{const shared={id:'shared',title:'Shared game',description:'',url:'https://game.example/'},extra={id:'extra',title:'Extra',description:'',url:'https://extra.example/'};assert.deepEqual(mergeGameCatalog([{...shared,title:'Changed'},{id:'copy',title:'Duplicate',description:'',url:shared.url},extra],[shared]),[shared,extra]);});
