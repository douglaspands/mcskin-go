import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidDimension,
  resolveTargetDimensions,
  calculateDownsampleSteps,
} from '../internal/web/static/js/editor-file-loader.js';

describe('editor-file-loader: Dimension Resolution & Downsampling (TDD)', () => {
  describe('Standard Dimensions', () => {
    it('recognizes 64x64 as valid standard dimension', () => {
      assert.equal(isValidDimension(64, 64), true);
      const res = resolveTargetDimensions(64, 64);
      assert.deepEqual(res, { targetW: 64, targetH: 64, isAI: false, isHighRes: false });
    });

    it('recognizes 64x32 as valid legacy dimension', () => {
      assert.equal(isValidDimension(64, 32), true);
      const res = resolveTargetDimensions(64, 32);
      assert.deepEqual(res, { targetW: 64, targetH: 32, isAI: false, isHighRes: false });
    });

    it('recognizes 128x128 as valid HD Bedrock dimension', () => {
      assert.equal(isValidDimension(128, 128), true);
      const res = resolveTargetDimensions(128, 128);
      assert.deepEqual(res, { targetW: 128, targetH: 128, isAI: false, isHighRes: true });
    });
  });

  describe('Arbitrary & High-Resolution Square Dimensions (> 64x64)', () => {
    it('routes 256x256 to 128x128 HD with isHighRes=true and isAI=true', () => {
      const res = resolveTargetDimensions(256, 256);
      assert.ok(res, 'Expected resolution not to be null');
      assert.equal(res.targetW, 128);
      assert.equal(res.targetH, 128);
      assert.equal(res.isHighRes, true);
      assert.equal(res.isAI, true);
    });

    it('routes 500x500 (arbitrary non-power-of-two) to 128x128 HD', () => {
      const res = resolveTargetDimensions(500, 500);
      assert.ok(res, 'Arbitrary square dimension 500x500 must not be rejected');
      assert.equal(res.targetW, 128);
      assert.equal(res.targetH, 128);
      assert.equal(res.isHighRes, true);
      assert.equal(res.isAI, true);
    });

    it('routes 512x512 to 128x128 HD preserving high detail', () => {
      const res = resolveTargetDimensions(512, 512);
      assert.ok(res, 'Expected resolution not to be null');
      assert.equal(res.targetW, 128);
      assert.equal(res.targetH, 128);
      assert.equal(res.isHighRes, true);
      assert.equal(res.isAI, true);
    });

    it('routes 1024x1024 and 2048x2048 to 128x128 HD', () => {
      const res1024 = resolveTargetDimensions(1024, 1024);
      assert.ok(res1024);
      assert.equal(res1024.targetW, 128);
      assert.equal(res1024.targetH, 128);
      assert.equal(res1024.isHighRes, true);

      const res2048 = resolveTargetDimensions(2048, 2048);
      assert.ok(res2048);
      assert.equal(res2048.targetW, 128);
      assert.equal(res2048.targetH, 128);
      assert.equal(res2048.isHighRes, true);
    });
  });

  describe('Legacy Rectangular 2:1 Dimensions', () => {
    it('routes 128x64 to 64x32 legacy', () => {
      const res = resolveTargetDimensions(128, 64);
      assert.ok(res);
      assert.equal(res.targetW, 64);
      assert.equal(res.targetH, 32);
      assert.equal(res.isAI, true);
      assert.equal(res.isHighRes, false);
    });

    it('routes 500x250 (arbitrary 2:1) to 64x32 legacy', () => {
      const res = resolveTargetDimensions(500, 250);
      assert.ok(res, 'Arbitrary 2:1 dimension 500x250 must not be rejected');
      assert.equal(res.targetW, 64);
      assert.equal(res.targetH, 32);
      assert.equal(res.isAI, true);
      assert.equal(res.isHighRes, false);
    });
  });

  describe('Invalid Dimensions Rejection', () => {
    it('rejects non-square and non-2:1 aspect ratios', () => {
      assert.equal(resolveTargetDimensions(300, 200), null);
      assert.equal(resolveTargetDimensions(100, 500), null);
      assert.equal(resolveTargetDimensions(10, 10), null);
    });
  });

  describe('Stepped Downsampling Plan Calculation', () => {
    it('calculates iterative halving steps from 1024 down to 128', () => {
      const steps = calculateDownsampleSteps(1024, 1024, 128, 128);
      assert.deepEqual(steps, [
        { w: 512, h: 512 },
        { w: 256, h: 256 },
        { w: 128, h: 128 }
      ]);
    });

    it('calculates iterative halving steps from 500 down to 128', () => {
      const steps = calculateDownsampleSteps(500, 500, 128, 128);
      assert.deepEqual(steps, [
        { w: 250, h: 250 },
        { w: 128, h: 128 }
      ]);
    });

    it('returns single target step if source is already <= 2x target', () => {
      const steps = calculateDownsampleSteps(200, 200, 128, 128);
      assert.deepEqual(steps, [
        { w: 128, h: 128 }
      ]);
    });
  });
});
