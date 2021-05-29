# @vergiss/static-server

Static resources server implemented with Node.js API (including C++ addon in the future).

## TODO

- [x] Etag calculation to support 304 cache-control.
- [ ] Cache the file on the server end.
- [ ] Consider the scalability to support deploying on the docker platform.
- [x] Write a simple template engine to render directory views.