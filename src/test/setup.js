// src/test/setup.js
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { crypto } from 'node:crypto'; // Add this

// Polyfill crypto for JSDOM
if (!global.crypto) {
  global.crypto = crypto;
}

Object.defineProperty(navigator, 'onLine', {
  configurable: true,
  value: true,
});

vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});