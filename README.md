checky
======

A service that maintains a status check of selected sites

The "sites" list should be POSTed to the index in the following format:

```
[
  {
    "name": "Example One",
    "slug": "example",
    "url": "http://example.com"
  },
  {
    "name": "Example Two",
    "slug": "example2",
    "url": "http://example.org"
  }
]
```
