/** @jest-environment node */

import { Readable } from 'stream';

import { errorCatchingHandler, handleFromJSONStream, LambdaResponse, isPlainJsObject } from '../lambda';
import { AppProps } from '../../lib/app';
import { FakeServerInfo, FakeSessionInfo, FakeAppContext } from '../../lib/tests/util';

const fakeAppProps: AppProps = {
  initialURL: '/',
  server: FakeServerInfo,
  initialSession: FakeSessionInfo
};

test('lambda works', async () => {
  const response = await errorCatchingHandler(fakeAppProps);
  expect(response.status).toBe(200);
});

test('lambda catches errors', async () => {
  const mockConsoleError = jest.fn();
  jest.spyOn(console, 'error').mockImplementation(mockConsoleError);
  const response = await errorCatchingHandler({
    ...fakeAppProps,
    testInternalServerError: true
  });
  expect(response.status).toBe(500);
  expect(mockConsoleError.mock.calls.length).toBe(1);
});

test('isPlainJsObject works', () => {
  expect(isPlainJsObject(null)).toBe(false);
  expect(isPlainJsObject([])).toBe(false);
  expect(isPlainJsObject({})).toBe(true);
});

describe('handleFromJSONStream', () => {
  const makeStream = (thing: any) => {
    const stream = new Readable();
    let text = typeof(thing) === 'string' ? thing : JSON.stringify(thing);
    stream.push(Buffer.from(text, 'utf-8'));
    stream.push(null);
    return stream;
  }

  const handle = async (thing: any) => {
    const response = await handleFromJSONStream(makeStream(thing));
    return JSON.parse(response.toString('utf-8')) as LambdaResponse;
  }

  it('works', async () => {
    const response = await handle(fakeAppProps);
    expect(response.status).toBe(200);
  });

  it('raises error on malformed input', () => {
    const response = handle('i am not valid json');
    expect(response).rejects.toBeInstanceOf(SyntaxError);
  });

  it('raises error on bad JSON input', () => {
    const response = handle(null);
    expect(response).rejects.toEqual(new Error("Expected input to be a JS object!"));
  });
});