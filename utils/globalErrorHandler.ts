/*
  Global JS error & unhandled promise rejection catcher for production
  Prevents the app from crashing or showing the red screen.
*/
// RN exposes ErrorUtils globally; declare for TypeScript
declare const ErrorUtils: any;

if (!__DEV__) {
  const defaultHandler = (ErrorUtils.getGlobalHandler && ErrorUtils.getGlobalHandler()) || ((e: any) => {});

  const globalHandler = (error: any, isFatal?: boolean) => {
    console.log('[GlobalErrorHandler]', isFatal ? 'Fatal:' : '', error);
    // TODO: send to remote logging service if desired
    // Do NOT invoke defaultHandler to avoid red screen
  };

  if (ErrorUtils.setGlobalHandler) {
    ErrorUtils.setGlobalHandler(globalHandler);
  }

  // Catch unhandled promise rejections
  // @ts-ignore
  const tracking = require('promise/setimmediate/rejection-tracking');
  tracking.enable({ allRejections: true, onUnhandled: (id: number, error: any) => {
    console.log('[UnhandledPromiseRejection]', error);
  }, onHandled: () => {} });
}
