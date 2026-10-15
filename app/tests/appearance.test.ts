import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cellLabel,defaultAppearance,themes} from '../lib/appearance.ts';
test('Pedestal labels support numbers and full alphabet beyond Z',()=>{assert.equal(cellLabel(0,'numbers'),'01');assert.equal(cellLabel(24,'numbers'),'25');assert.equal(cellLabel(0,'letters'),'A');assert.equal(cellLabel(25,'letters'),'Z');assert.equal(cellLabel(26,'letters'),'AA');assert.equal(cellLabel(49,'letters'),'AX');assert.equal(defaultAppearance.teamLayout,'right');assert.equal(themes.length,5);});
