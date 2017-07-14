function assert(mustBeTrue, message) {
  if (mustBeTrue === true) {
    return;
  }

  if (message === undefined) {
    message = 'Expected true but got ' + String(mustBeTrue);
  }
  throw new Error(message);
}

assert._isSameValue = function (a, b) {
  if (a === b) {
    // Handle +/-0 vs. -/+0
    return a !== 0 || 1 / a === 1 / b;
  }

  // Handle NaN vs. NaN
  return a !== a && b !== b;
};

assert.sameValue = function (actual, expected, message) {
  if (assert._isSameValue(actual, expected)) {
    return;
  }

  if (message === undefined) {
    message = '';
  } else {
    message += ' ';
  }

  message += 'Expected SameValue(«' + String(actual) + '», «' + String(expected) + '») to be true';

  throw new Error(message);
};

assert.notSameValue = function (actual, unexpected, message) {
  if (!assert._isSameValue(actual, unexpected)) {
    return;
  }

  if (message === undefined) {
    message = '';
  } else {
    message += ' ';
  }

  message += 'Expected SameValue(«' + String(actual) + '», «' + String(unexpected) + '») to be false';

  throw new Error(message);
};

assert.throws = function (expectedErrorConstructor, func, message) {
  if (typeof func !== "function") {
    throw new Error('assert.throws requires two arguments: the error constructor ' +
      'and a function to run');
    return;
  }
  if (message === undefined) {
    message = '';
  } else {
    message += ' ';
  }

  try {
    func();
  } catch (thrown) {
    if (typeof thrown !== 'object' || thrown === null) {
      message += 'Thrown value was not an object!';
      throw new Error(message);
    } else if (thrown.constructor !== expectedErrorConstructor) {
      message += 'Expected a ' + expectedErrorConstructor.name + ' but got a ' + thrown.constructor.name;
      throw new Error(message);
    }
    return;
  }

  message += 'Expected a ' + expectedErrorConstructor.name + ' to be thrown but no exception was thrown at all';
  throw new Error(message);
};

assert.throws.early = function(err, code) {
  let wrappedCode = `function wrapperFn() { ${code} }`;
  let ieval = eval;

  assert.throws(err, () => { Function(wrappedCode); }, `Function: ${code}`);
};

// Copyright 2012 Mozilla Corporation. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/**
 * @description Tests that obj meets the requirements for built-in objects
 *   defined by the introduction of chapter 15 of the ECMAScript Language Specification.
 * @param {Object} obj the object to be tested.
 * @param {boolean} isFunction whether the specification describes obj as a function.
 * @param {boolean} isConstructor whether the specification describes obj as a constructor.
 * @param {String[]} properties an array with the names of the built-in properties of obj,
 *   excluding length, prototype, or properties with non-default attributes.
 * @param {number} length for functions only: the length specified for the function
 *   or derived from the argument list.
 * @author Norbert Lindenberg
 */

function testBuiltInObject(obj, isFunction, isConstructor, properties, length) {

  if (obj === undefined) {
    throw new Error("Object being tested is undefined.");
  }

  var objString = Object.prototype.toString.call(obj);
  if (isFunction) {
    if (objString !== "[object Function]") {
      throw new Error("The [[Class]] internal property of a built-in function must be " +
          "\"Function\", but toString() returns " + objString);
    }
  } else {
    if (objString !== "[object Object]") {
      throw new Error("The [[Class]] internal property of a built-in non-function object must be " +
          "\"Object\", but toString() returns " + objString);
    }
  }

  if (!Object.isExtensible(obj)) {
    throw new Error("Built-in objects must be extensible.");
  }

  if (isFunction && Object.getPrototypeOf(obj) !== Function.prototype) {
    throw new Error("Built-in functions must have Function.prototype as their prototype.");
  }

  if (isConstructor && Object.getPrototypeOf(obj.prototype) !== Object.prototype) {
    throw new Error("Built-in prototype objects must have Object.prototype as their prototype.");
  }

  // verification of the absence of the [[Construct]] internal property has
  // been moved to the end of the test

  // verification of the absence of the prototype property has
  // been moved to the end of the test

  if (isFunction) {

    if (typeof obj.length !== "number" || obj.length !== Math.floor(obj.length)) {
      throw new Error("Built-in functions must have a length property with an integer value.");
    }

    if (obj.length !== length) {
      throw new Error("Function's length property doesn't have specified value; expected " +
        length + ", got " + obj.length + ".");
    }

    var desc = Object.getOwnPropertyDescriptor(obj, "length");
    if (desc.writable) {
      // This test is disabled to avoid the v8 bug outlined at https://code.google.com/p/v8/issues/detail?id=2694
      //throw new Error("The length property of a built-in function must not be writable.");
    }
    if (desc.enumerable) {
      throw new Error("The length property of a built-in function must not be enumerable.");
    }
    if (!desc.configurable) {
      // This test is disabled because it relies on ES 2015 behaviour, which is not implemented in environments that need this polyfill
      //throw new Error("The length property of a built-in function must be configurable.");
    }
  }

  properties.forEach(function(prop) {
    var desc = Object.getOwnPropertyDescriptor(obj, prop);
    if (desc === undefined) {
      throw new Error("Missing property " + prop + ".");
    }
    // accessor properties don't have writable attribute
    if (desc.hasOwnProperty("writable") && !desc.writable) {
      throw new Error("The " + prop + " property of this built-in object must be writable.");
    }
    if (desc.enumerable) {
      throw new Error("The " + prop + " property of this built-in object must not be enumerable.");
    }
    if (!desc.configurable) {
      throw new Error("The " + prop + " property of this built-in object must be configurable.");
    }
  });

// Intl.js cannot pass the following sections of this test:
//  // The remaining sections have been moved to the end of the test because
//  // unbound non-constructor functions written in JavaScript cannot possibly
//  // pass them, and we still want to test JavaScript implementations as much
//  // as possible.

//  var exception;
//  if (isFunction && !isConstructor) {
//    // this is not a complete test for the presence of [[Construct]]:
//    // if it's absent, the exception must be thrown, but it may also
//    // be thrown if it's present and just has preconditions related to
//    // arguments or the this value that this statement doesn't meet.
//    try {
//      /*jshint newcap:false*/
//      var instance = new obj();
//    } catch (e) {
//      exception = e;
//    }
//    if (exception === undefined || exception.name !== "TypeError") {
//      throw new Error("Built-in functions that aren't constructors must throw TypeError when " +
//        "used in a \"new\" statement.");
//    }
//  }

//  if (isFunction && !isConstructor && obj.hasOwnProperty("prototype")) {
//    throw new Error("Built-in functions that aren't constructors must not have a prototype property.");
//  }

  // passed the complete test!
  return true;
}

"use strict";var __globalObject = Function("return this;")();function fnGlobalObject() {    return __globalObject;}function Test262Error(message) {  this.message = message || "";}IntlPolyfill.__applyLocaleSensitivePrototypes();function runner() {    var passed = false;    runTheTest();    passed = true;    return passed;}function runTheTest () {// Copyright 2012 Mozilla Corporation. All rights reserved.
// This code is governed by the license found in the LICENSE file.

/*---
es5id: 13.2.1_L15
description: >
    Tests that Number.prototype.toLocaleString meets the requirements
    for built-in objects defined by the introduction of chapter 17 of
    the ECMAScript Language Specification.
author: Norbert Lindenberg
testBuiltInObject.js
---*/

testBuiltInObject(Number.prototype.toLocaleString, true, false, [], 0);
 }