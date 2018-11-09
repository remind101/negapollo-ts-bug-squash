'use strict';

const _buildCurl = function buildCurl(params) {
  if (!params.url) {
    console.error('Input missing: URL');
  }

  if (!params.verb) {
    console.error('Input missing: HTTP verb');
  }

  let _headers = '';
  let _body = '';

  try {
    if (params.headers) {
      Object.keys(params.headers).forEach(key => {
        if (key === 'content-length') {
          return;
        }
        _headers += `-H '${key}:${params.headers[key]}' `;
      });

      if (params.body) {
        if (
          params.headers &&
          params.headers['content-type'] &&
          params.headers['content-type'] === 'application/json'
        ) {
          _body += `-d '${JSON.stringify(params.body)}' `;
        } else {
          Object.keys(params.body).forEach(key => {
            _body += `-d '${key}=${params.body[key]}' `;
          });
        }
      }

      if (_headers.length) {
        _headers = _headers.substring(0, _headers.length - 1);
      }
      if (_body.length) {
        _body = _body.substring(0, _body.length - 1);
      }

      return `curl ${_headers} -X ${params.verb.toUpperCase()} '${params.url}' ${_body}`;
    }
  } catch (e) {
    console.log(e);
    return null;
  }

  return null;
};

const reqToCurl = function what(req) {
  const curlParams = {};
  // @ts-ignore
  let host = req.hostname;
  if (req.headers) {
    ({ host } = req.headers);
  }

  curlParams.url = `${req.protocol}://${host}${req.originalUrl}`;
  // @ts-ignore
  curlParams.verb = 'GET';
  if (req.method) {
    curlParams.verb = req.method.toUpperCase();
  }
  // @ts-ignore
  if (req.headers) {
    curlParams.headers = req.headers;
  }
  // @ts-ignore
  if (req.body) {
    curlParams.body = req.body;
  }
  return _buildCurl(curlParams);
};

module.exports = reqToCurl;
