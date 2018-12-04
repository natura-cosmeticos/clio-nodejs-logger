const assert = require('assert');
const faker = require('faker/locale/en');
const isEnabled = require('../../src/is-enabled');

/* eslint max-lines-per-function: ["error", 16] */
/* eslint max-nested-callbacks: ["error", 5] */
/* eslint-disable max-lines-per-function */

describe('Log Enable', () => {
  context('with an * pattern', () => {
    it('enables all logs', () => {
      assert.ok(isEnabled(faker.random.words(), '*'));
    });

    context('and an exclude pattern', () => {
      it('disables excluded matching logs', () => {
        const namespace = faker.lorem.word();
        const enabledNamespaces = `*,-${namespace}`;

        assert.ok(!isEnabled(namespace, enabledNamespaces));
      });

      it('does not disables non excluding matching logs', () => {
        const namespace = faker.lorem.word();
        const enabledNamespaces = `*,-${namespace}FOO`;

        assert.ok(isEnabled(namespace, enabledNamespaces));
      });
    });
  });

  context('with a wildcard suffix', () => {
    it('enables wildcard matching logs', () => {
      const enabledNamespaces = 'http:*';
      const matchingNamespaces = [
        `http:${faker.lorem.word()}`,
        `http:${faker.lorem.word()}`,
        `http:${faker.lorem.word()}`,
      ];
      const nonMatchingNamespaces = [
        `db:${faker.lorem.word()}`,
        `db:${faker.lorem.word()}`,
        `db:${faker.lorem.word()}`,
      ];

      assert.ok(matchingNamespaces.every(ns => isEnabled(ns, enabledNamespaces)));
      assert.ok(nonMatchingNamespaces.every(ns => !isEnabled(ns, enabledNamespaces)));
    });

    context('and an exclude with the same wildcard', () => {
      it('disables only exclude matching logs', () => {
        const enabledNamespaces = 'http:*,-http:routes*';
        const matchingNamespaces = [
          `http:${faker.lorem.word()}`,
          `http:${faker.lorem.word()}`,
          `http:${faker.lorem.word()}`,
        ];
        const nonMatchingNamespaces = [
          `db:${faker.lorem.word()}`,
          `db:${faker.lorem.word()}`,
          `http:routes:${faker.lorem.word()}`,
          `http:routes:${faker.lorem.word()}`,
        ];

        assert.ok(matchingNamespaces.every(ns => isEnabled(ns, enabledNamespaces)));
        assert.ok(nonMatchingNamespaces.every(ns => !isEnabled(ns, enabledNamespaces)));
      });
    });
  });

  context('with an empty pattern', () => {
    it('disables all messages', () => {
      const enabledNamespaces = '';
      const namespaces = [
        faker.lorem.word(),
        faker.lorem.word(),
      ];

      assert.ok(namespaces.every(ns => !isEnabled(ns, enabledNamespaces)));
    });
  });

  context('with an undefined pattern', () => {
    it('disables all messages', () => {
      const namespace = faker.lorem.word();

      assert.strictEqual(isEnabled(namespace), false);
    });
  });
});
